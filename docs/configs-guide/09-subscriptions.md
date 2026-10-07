## Part 9. Subscriptions

Subscriptions notify clients about created, updated and deleted entities. They need no declaration: without `inventory` every tangible entity has them (part 1, step 7), and they are removed by `exclude: { Subscription: true }` (part 5). This part shows what they deliver, how to filter them, what to put into the context, and how to tell subscribers who made a change. The examples were run on MongoDB with a real subscription for every case ✅.

### Step 1. What is generated

For `Country` ✅:

```graphql
type Subscription {
  createdCountry(wherePayload: CountryWherePayloadInput): CountryCreatedOrDeletedPayload!
  deletedCountry(wherePayload: CountryWherePayloadInput): CountryCreatedOrDeletedPayload!
  updatedCountry(wherePayload: CountryWherePayloadInput, whichUpdated: CountryWhichUpdatedInput): CountryUpdatedPayload!
}

type CountryCreatedOrDeletedPayload { node: Country!  actor: CountryActor }
type CountryUpdatedPayload { updatedFields(slice: SliceInput): [String!]!  node: Country  previousNode: Country  actor: CountryActor }
```

`node` is a full `Country`: the subscriber selects any fields, including link fields and calculated fields, which are resolved for the subscriber (`deletedCountry { node { code cities { name } } }`) ✅. In `CountryUpdatedPayload` `node` and `previousNode` are nullable: a state that does not pass the filters of the subscriber is `null` (step 4). `actor` exists only with `subscriptionActorConfigName` (step 5).

### Step 2. Which mutations publish

Only the single-entity mutations publish events (checked for `createX`, `updateX`, `deleteX`, `createManyXs`, `updateManyXs` ✅, the rest from the code 📖):

| Event | Published by | Not published by |
|---|---|---|
| `createdX` | `createX` | `createManyXs` |
| `updatedX` | `updateX` | `updateManyXs`, `updateFilteredXs…` |
| `deletedX` | `deleteX` | `deleteManyXs`, `deleteFilteredXs…`, `…WithChildren` |

Bulk loading (part 1, step 6; part 2, step 4) therefore does not flood subscribers. If clients must learn about bulk changes, notify them yourself (e.g. a custom mutation that publishes, or a refetch after a bulk operation).

### Step 3. The context: `pubsub`

Every GraphQL call — queries, mutations and subscriptions — gets `pubsub` in the context next to `mongooseConn` (part 1, step 5). Without it the publishing mutations above fail before any write ✅.

- `pubsub` exported by the library is an in-process PubSub (`createPubSub` of `@graphql-yoga/subscription`): enough for one server process, as long as the process has one copy of the library. A bundler that puts several copies into the server bundles (Next.js does) gives each its own `pubsub`; then create the PubSub yourself and keep it on `globalThis` ([part 6 of the infrastructure guide](../infrastructure-guide/06-subscriptions-local.md#step-3-one-pubsub-per-process)).
- For several processes pass your own object with the same interface, e.g. over Redis: `publish(channel, payload)` and `subscribe(channel)` returning an async iterator. Channels are `created-Country`, `updated-Country`, `deleted-Country` 📖. A serializing transport (JSON) is supported: the published payload keeps the values of calculated fields ([calculated-fields.md](../calculated-fields.md) CF26), and the filters of events compare the relational ids and the dates of a serialized payload as those of an in-memory one ✅. A setup with Redis: [part 7 of the infrastructure guide](../infrastructure-guide/07-subscriptions-production.md#step-2-a-pubsub-shared-by-the-processes).
- The transport to clients (graphql-ws, SSE of GraphQL Yoga, …) is the server's business: it only has to call `subscribe` of `graphql` with the schema and the same context.

### Step 4. Filters: `wherePayload` and `whichUpdated`

**`wherePayload`** selects events by the fields of the entity ✅:

```graphql
subscription { createdCountry(wherePayload: { euMember: true }) { node { code } } }
```

- It has operators for **all** fields of the entity, not only indexed ones (the events are filtered in memory, not in MongoDB): `euMember` has no `index` and works ✅. Calculated fields are included if they are not `async`, or are listed in `allowedCalculatedWithAsyncFuncFieldNames` (step 5) ([calculated-fields.md](../calculated-fields.md) CF9).
- For `updatedX` it is enough that **one** of the two states matches; the state that does not is sent as `null` (see below).

**Entering and leaving.** Every state of an `updatedX` event is checked separately, by `wherePayload` together with the restrictions of the user (step 6). The event is delivered if at least one state passes, the other one comes as `null`, and `updatedFields` always lists all changed fields. With `updatedCountry(wherePayload: { population_gte: 40000000 }) { previousNode { code population } node { code population } updatedFields }` ✅:

| Change | Delivered |
|---|---|
| UA 41 000 000 → 39 000 000 (leaves) | `previousNode: { code: "UA", population: 41000000 }, node: null, updatedFields: ["population"]` |
| PL 37 600 000 → 38 000 000 (never in the set) | nothing |
| UA 39 000 000 → 42 000 000 (enters) | `previousNode: null, node: { code: "UA", population: 42000000 }, updatedFields: ["population"]` |
| UA 42 000 000 → 43 000 000 (stays) | both states |

So a client keeps a filtered list in sync with `updatedX` alone: `node: null` removes the entity, `previousNode: null` adds it, both states update it in place. The same rule makes the restrictions of the user precise: a subscriber never gets a state it may not see, but learns that an entity entered or left its scope ([part 7 of the infrastructure guide, step 7](../infrastructure-guide/07-subscriptions-production.md#step-7-who-receives-an-event-a-support-chat)).

**`whichUpdated`** (only `updatedX`) selects events by the changed fields; the payload lists them in `updatedFields` ✅:

```graphql
subscription {
  updatedCountry(whichUpdated: { updatedFields_in: [population, euMember] }) {
    node { code population }
    previousNode { population }
    updatedFields
  }
}
```

`updatedFields` (one field), `updatedFields_ne`, `updatedFields_in`, `updatedFields_nin` take the values of `CountryWhichUpdatedEnum` (the field names) ✅. An update of `name` is not delivered here; an update of `population` arrives with `updatedFields: ["population"]` and the old value in `previousNode` ✅.

### Step 5. Who made the change: `subscriptionActorConfigName`

The payload can carry an **actor**: data about the author of the change, computed in the context of the **mutation**, not of the subscriber. It is declared with a virtual entity for the actor and fields with the same names in the entity:

```ts
// graphql-fns.general.config.ts
{ name: 'CountryActor', type: 'virtual', textFields: [{ name: 'editor' }] },
{
  name: 'Country',
  subscriptionActorConfigName: 'CountryActor',
  allowedCalculatedWithAsyncFuncFieldNames: ['editor'],
  textFields: [{ name: 'code', unique: true, required: true }, { name: 'name' }],
  intFields: [{ name: 'population' }],
  booleanFields: [{ name: 'euMember' }],
  calculatedFields: [{ name: 'editor', calculatedType: 'textFields', async: true }],
},

// graphql-fns.serverSide.config.ts
calculatedFields: {
  Country: {
    editor: {
      asyncFunc: async (args, resolverCreatorArg, { context }) => context.user ?? null, // the user of the mutation
      func: (args, data, resolverArg, user) => user,
    },
  },
},
```

✅ `createCountry` made with `context.user = 'bob'` is delivered as `{ node: { code: "PL" }, actor: { editor: "bob" } }` to every subscriber, whoever the subscriber is.

- The fields of the actor config are taken from the published entity by name (`CountryActor.editor` ← `Country.editor`) 📖; empty values give `actor: null`. Usually they are calculated fields that read the context of the mutation (the current user, the client, the request id).
- An `async` calculated field is computed at publish time (with the mutation's context) only if it is listed in `allowedCalculatedWithAsyncFuncFieldNames`; the same list makes it available in `wherePayload` (`createdCountry(wherePayload: { editor: "bob" })`). Other async calculated fields are computed for every subscriber in the subscriber's context ([calculated-fields.md](../calculated-fields.md) CF26, CF27).
- `subscriptionActorConfigName` must name a `type: 'virtual'` config, otherwise `composeAllEntityConfigs` throws 📖.

### Step 6. Who receives the events

Authorization of subscriptions runs once, when a client subscribes: the user must be allowed the subscription action (`createdEntity`, `updatedEntity`, `deletedEntity` in `inventoryByRoles`), and `serversideConfig.subscribePayloadFilters` restricts the events of every role in addition to the client's `wherePayload` (part 10) 📖. Without authorization every subscriber gets every matching event.

### Checklist

- [ ] subscriptions needed → `pubsub` in the context of every call; a shared PubSub (e.g. Redis) for several server processes; not needed → `exclude: { Subscription: true }`;
- [ ] only `createX`, `updateX`, `deleteX` publish; bulk mutations do not;
- [ ] `wherePayload` works on all fields; an `updatedX` event comes if one state matches, the other one is `null` (an entity entered or left the set);
- [ ] "who changed it" → a virtual actor config + `subscriptionActorConfigName` + same-named (calculated) fields of the entity; async ones listed in `allowedCalculatedWithAsyncFuncFieldNames`.

---

[← Part 8](08-representations.md) · [Contents](README.md) · [Part 10 →](10-authorization.md)
