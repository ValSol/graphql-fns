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
type CountryUpdatedPayload { updatedFields(slice: SliceInput): [String!]!  node: Country!  previousNode: Country!  actor: CountryActor }
```

`node` is a full `Country`: the subscriber selects any fields, including link fields and calculated fields, which are resolved for the subscriber (`deletedCountry { node { code cities { name } } }`) ✅. `actor` exists only with `subscriptionActorConfigName` (step 5).

### Step 2. Which mutations publish

Only the single-entity mutations publish events (checked for `createX`, `updateX`, `deleteX`, `createManyXs`, `updateManyXs` ✅, the rest from the code 📖):

| Event | Published by | Not published by |
|---|---|---|
| `createdX` | `createX` | `createManyXs` |
| `updatedX` | `updateX`, `pushIntoX` | `updateManyXs`, `updateFilteredXs…` |
| `deletedX` | `deleteX` | `deleteManyXs`, `deleteFilteredXs…`, `…WithChildren` |

Bulk loading (part 1, step 6; part 2, step 4) therefore does not flood subscribers. If clients must learn about bulk changes, notify them yourself (e.g. a custom mutation that publishes, or a refetch after a bulk operation).

### Step 3. The context: `pubsub`

Every GraphQL call — queries, mutations and subscriptions — gets `pubsub` in the context next to `mongooseConn` (part 1, step 5). Without it the publishing mutations above fail before any write ✅.

- `pubsub` exported by the library is an in-process PubSub (`createPubSub` of `@graphql-yoga/subscription`): enough for one server process.
- For several processes pass your own object with the same interface, e.g. over Redis: `publish(channel, payload)` and `subscribe(channel)` returning an async iterator. Channels are `created-Country`, `updated-Country`, `deleted-Country` 📖. A serializing transport (JSON) is supported: the published payload keeps the values of calculated fields ([calculated-fields.md](../calculated-fields.md) §0) ✅.
- The transport to clients (graphql-ws, SSE of GraphQL Yoga, …) is the server's business: it only has to call `subscribe` of `graphql` with the schema and the same context.

### Step 4. Filters: `wherePayload` and `whichUpdated`

**`wherePayload`** selects events by the fields of the entity ✅:

```graphql
subscription { createdCountry(wherePayload: { euMember: true }) { node { code } } }
```

- It has operators for **all** fields of the entity, not only indexed ones (the events are filtered in memory, not in MongoDB): `euMember` has no `index` and works ✅. Calculated fields are included if they are not `async`, or are listed in `allowedCalculatedWithAsyncFuncFieldNames` (step 5) ([calculated-fields.md](../calculated-fields.md) §0).
- For `updatedX` **both** `previousNode` and `node` must match ✅: a country that becomes an EU member (`euMember: false → true`) is **not** delivered to `updatedCountry(wherePayload: { euMember: true })`, because its previous state does not match. To catch such transitions, subscribe with `whichUpdated` and check the values on the client.

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
- An `async` calculated field is computed at publish time (with the mutation's context) only if it is listed in `allowedCalculatedWithAsyncFuncFieldNames`; the same list makes it available in `wherePayload` (`createdCountry(wherePayload: { editor: "bob" })`). Other async calculated fields are computed for every subscriber in the subscriber's context ([calculated-fields.md](../calculated-fields.md) §0).
- `subscriptionActorConfigName` must name a `type: 'virtual'` config, otherwise `composeAllEntityConfigs` throws 📖.

### Step 6. Who receives the events

Authorization of subscriptions runs once, when a client subscribes: the user must be allowed the subscription action (`createdEntity`, `updatedEntity`, `deletedEntity` in `inventoryByRoles`), and `serversideConfig.subscribePayloadFilters` restricts the events of every role in addition to the client's `wherePayload` (part 10) 📖. Without authorization every subscriber gets every matching event.

### Checklist

- [ ] subscriptions needed → `pubsub` in the context of every call; a shared PubSub (e.g. Redis) for several server processes; not needed → `exclude: { Subscription: true }`;
- [ ] only `createX`, `updateX`, `pushIntoX`, `deleteX` publish; bulk mutations do not;
- [ ] `wherePayload` works on all fields; for `updatedX` both states must match; transitions → `whichUpdated`;
- [ ] "who changed it" → a virtual actor config + `subscriptionActorConfigName` + same-named (calculated) fields of the entity; async ones listed in `allowedCalculatedWithAsyncFuncFieldNames`.

---

[← Part 8](08-representations.md) · [Contents](README.md) · [Part 10 →](10-authorization.md)
