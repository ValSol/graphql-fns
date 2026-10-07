## Part 11. Transactions

A mutation of graphql-fns often writes several collections: a country and its cities (part 2), the back references of duplex links, counters (part 4). `serversideConfig.transactions: true` makes every mutation atomic. The examples were run on a single-node replica set, with and without transactions ✅.

```ts
const serversideConfig = composeServersideConfig(generalConfig, {
  transactions: true,
  // … the rest of part 10
});
```

### Step 1. What goes wrong without transactions

A mutation is executed as several writes, one `bulkWrite` per collection. Without a transaction a failure in the middle leaves what was written before it ✅:

```graphql
# City has uniqueCompoundIndexes: [['name', 'country']] (part 4)
mutation {
  createCountry(data: { code: "SK", cities: { create: [{ name: "Bratislava" }, { name: "Bratislava" }] } }) { id }
}
```

| | The mutation returns | What stays in MongoDB |
|---|---|---|
| `transactions: false` | `E11000 duplicate key error … name_1_country_1` | the country `SK` with **two** city ids in `cities`, and **one** city: a dangling reference ✅ |
| `transactions: true` | the same error | nothing ✅ |

The same for a chain of mutations executed by `workOutMutations` (step 3): with a second mutation that fails, the first one stays without transactions and is rolled back with them ✅.

### Step 2. What `transactions: true` does

- Every mutation resolver (`create…`, `update…`, `delete…`, `copy…`, generated, of representations, and the ones you call from code, part 7) runs in its own MongoDB session and transaction: the lookup of the previous state, all writes and the counters are committed together or not at all 📖.
- Every call of `workOutMutations` runs **all its mutations in one transaction** (step 3) 📖.
- A transaction that fails with a transient error (`TransientTransactionError`, `WriteConflict`: two requests changed the same documents) is retried, up to 7 attempts with a growing pause; a commit with an unknown result (`UnknownTransactionCommitResult`) is retried as a commit. Other errors are returned at once. Without transactions nothing is retried, so that partially done writes are not repeated 📖.
- Queries do not use transactions.

### Step 3. Several standard mutations in one transaction: `workOutMutations`

Two standard mutations called one after another, from the client or from your resolver (`create…MutationResolver(…)(…)` twice), are two transactions: the second may fail after the first is committed. To combine what several standard mutations do into one atomic operation, pass them all to one `workOutMutations` call in a **hand-written resolver**. There are two places for such a resolver, both in `serversideConfig.Mutation`:

- a **custom mutation** (part 7): a new action with its own signature (example A);
- a **mutation of a representation** (part 8, step 5): a resolver set explicitly under the general name of the action (`updateEntityForEditor`) replaces the generated one, the signature stays as generated (example B).

**Example A, a custom mutation.** `replaceCurrency` re-links every country of a currency to another currency and deletes the first one. The signature in the general config:

```ts
// custom.ts
export const replaceEntity: ActionSignatureMethods = {
  name: 'replaceEntity',
  specificName: ({ name }) => (name === 'Currency' ? 'replaceCurrency' : ''),
  argNames: () => ['whereOne', 'replacement'],
  argTypes: ({ name }) => [`${name}WhereOneInput!`, `${name}WhereOneInput!`],
  involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
  type: ({ name }) => `${name}!`,
  config: (entityConfig) => entityConfig,
};

// generalConfig.custom: composeCustom({ …, Mutation: [importEntities, replaceEntity] })
```

```graphql
replaceCurrency(whereOne: CurrencyWhereOneInput!, replacement: CurrencyWhereOneInput!): Currency!   # in Mutation
```

The resolver in the server-side config:

```ts
import { composeQueryResolver, createInfoEssence, workOutMutations } from 'graphql-fns';

const serversideConfig = composeServersideConfig(generalConfig, {
  transactions: true,

  Mutation: {
    replaceEntity: (entityConfig, generalConfig, serversideConfig) =>
      async (parent, { whereOne, replacement }, context, info, resolverOptions) => {
        // 1. reads and checks: before the chain, with the filters of the current user
        const getCurrency = composeQueryResolver('Currency', generalConfig, serversideConfig);
        const onlyId = createInfoEssence({ projection: { _id: 1 } });

        const [from, to] = await Promise.all(
          [whereOne, replacement].map((where) =>
            getCurrency(null, { whereOne: where }, context, onlyId, resolverOptions),
          ),
        );

        if (!from || !to) throw new TypeError('Currency not found!');

        // 2. all writes: one chain, one transaction
        const [, deletedCurrency] = await workOutMutations(
          [
            {
              actionGeneralName: 'updateFilteredEntities',
              entityConfig: generalConfig.allEntityConfigs.Country,
              args: { where: { currency: from.id }, data: { currency: { connect: to.id } } },
              returnResult: false,
            },
            {
              actionGeneralName: 'deleteEntity',
              entityConfig, // Currency
              args: { whereOne: { id: from.id } },
              info, // the fields the client asked for
              returnResult: true,
            },
          ],
          { generalConfig, serversideConfig, context },
        );

        return deletedCurrency;
      },
  },
});
```

```graphql
mutation { replaceCurrency(whereOne: { code: "DEM" }, replacement: { code: "EUR" }) { code name } }
```

✅ With the currencies `DEM`, `FRF`, `EUR` and the countries `DE`, `AT` (both `DEM`) and `FR` (`FRF`): the mutation returns `{ code: "DEM", name: "Mark" }`, `DE` and `AT` now have `EUR`, `FR` is untouched, `DEM` is deleted. With an unknown `replacement` it fails with `Currency not found!` and writes nothing. With `transactions: true` either both mutations are committed or none (step 1).

**Example B, a mutation of a representation.** The editor of part 8 updates countries by `updateCountryForEditor`. Every such update must also leave a record in a journal, an entity `CountryChange` (`textFields: [{ name: 'data' }]`, `relationalFields: [{ name: 'country', configName: 'Country', oppositeName: 'changes' }]`), and both writes must succeed together. Nothing changes in the general config, only the resolver is set:

```ts
const serversideConfig = composeServersideConfig(generalConfig, {
  transactions: true,

  Mutation: {
    // the general name of the representation action; "entityConfig" is the root "Country" config
    updateEntityForEditor: (entityConfig, generalConfig, serversideConfig) =>
      async (parent, { whereOne, data }, context, info, resolverOptions) => {
        const country = await composeQueryResolver('Country', generalConfig, serversideConfig)(
          null,
          { whereOne },
          context,
          createInfoEssence({ projection: { _id: 1 } }),
          resolverOptions,
        );

        if (!country) throw new TypeError('Country not found!');

        const [updatedCountry] = await workOutMutations(
          [
            {
              actionGeneralName: 'updateEntity', // the standard mutation the generated resolver would run
              entityConfig,
              args: { whereOne: { id: country.id }, data },
              info,
              resolverOptions, // the filters of the current user for the country
              returnResult: true,
            },
            {
              actionGeneralName: 'createEntity',
              entityConfig: generalConfig.allEntityConfigs.CountryChange,
              args: { data: { country: { connect: country.id }, data: JSON.stringify(data) } },
              returnResult: false,
            },
          ],
          { generalConfig, serversideConfig, context },
        );

        return updatedCountry;
      },
  },
});
```

✅ `updateCountryForEditor(whereOne: { code: "UA" }, data: { name: "Ukraine" }) { id code name }` returns the country with the id of the representation (`…:Country:ForEditor`), the country is renamed and `Country.changes` gets `{ data: "{\"name\":\"Ukraine\"}" }`; for an unknown country it fails with `Country not found!` and no journal record is written. The resolver gets the arguments already checked against the representation (`data` has only the fields of `CountryForEditorUpdateInput`) and with Mongo ids, and returns a raw object, exactly as a custom resolver does (part 7, step 4).

An item of the chain 📖:

| Key | Meaning |
|---|---|
| `actionGeneralName` | the general name of a standard mutation: `createEntity`, `createManyEntities`, `updateEntity`, `updateManyEntities`, `updateFilteredEntities`, `deleteEntity`, `deleteManyEntities`, `deleteFilteredEntities`, `copyEntity`, `copyManyEntities` and their `…WithChildren` / `…ReturnScalar` variants |
| `entityConfig` | the entity of the mutation, from `generalConfig.allEntityConfigs` |
| `args` | the arguments of the mutation, as in the GraphQL API but with Mongo ids |
| `returnResult` | required. `true`: the result of the mutation is put into the returned array; `false`: `null` is put there. The array has the order of the chain |
| `info` | which fields to return: the `info` of your resolver or `createInfoEssence({ projection })`; without it all stored fields are returned ✅ |
| `resolverOptions` | `{ involvedFilters: { inputOutputFilterAndLimit } }` for the mutation; by default no restriction (`[[]]`) |
| `inAnyCase` | `true` allows a mutation that `inventory` excludes from the API; otherwise the chain fails with `Not authorized "deleteEntity" mutation for "Currency" entity!` |
| `returnReport` | with `returnResult: true`, publishes the subscription payload of the mutation (part 9) after the writes, if `resolverOptions` also carry `subscriptionEntityNames`: spread `composeSubscriptionReportArgs(kind, entityConfig, generalConfig, info, resolverOptions)` into the item, it sets `info` and `resolverOptions` ([part 6 of the infrastructure guide, step 8](../infrastructure-guide/06-subscriptions-local.md#step-8-a-manually-created-mutation-publishes-only-if-told-to)) ✅ |
| `lockedData` | optimistic locking (step 6) |

Rules:

- **Check permissions yourself.** `workOutMutations` takes Mongo ids and **bypasses authorization** (part 10, step 8): by default every mutation of the chain has full access. In the example the currencies are read with the `resolverOptions` of the custom mutation, so a user who may not see a currency cannot replace it; pass `resolverOptions` to a chain item to restrict the mutation itself.
- **Read before the chain, write inside it.** All mutations of the chain are prepared first and all their writes are executed together at the end. So a mutation of the chain does not see the writes of the previous ones: it cannot find an entity created earlier in the same chain ([where-compound-one.md](../where-compound-one.md) WC16), and the ids a mutation needs must be known before the call. To link entities created in one chain, create them by one mutation with nested `create` (part 2) 📖.
- The order of the items does not change what is written when they touch the same documents in a compatible way: the example gives the same result with `deleteEntity` first ✅.
- Without `transactions: true` the chain still works, but is not atomic (step 1).

### Step 4. Requirements

- **A replica set or a sharded cluster.** A standalone `mongod` does not support transactions (MongoDB rule); for development run a single-node replica set, e.g. `mongod --replSet rs0` and `rs.initiate()` once, or `MongoMemoryReplSet` of `mongodb-memory-server` in tests.
- **Collections and indexes.** Before it first uses the model of an entity the library creates its collection and syncs its indexes, outside of any transaction; with `transactions: true` it syncs all entities once, before the first transaction ([mongoose-models.md](../mongoose-models.md) MM6, MM8). Still, call **`initMongooseModels`** on the start of the application, after connecting:

  ```ts
  import { initMongooseModels } from 'graphql-fns';

  await mongoose.connect(process.env.MONGODB_URI!);
  await initMongooseModels(mongoose.connection, generalConfig); // all tangible entities (+ counters)
  ```

  - Index problems show up at the start, not in the first requests: if an index cannot be created (e.g. existing documents violate a new unique index), it throws `Failed to sync indexes of "City" entity (collection "city_things"), not created: "name_1_country_1": E11000 duplicate key error …` ✅; the same error is returned to every request that needs the model.
  - Syncing **drops** the indexes of a collection that are not in the config: the entity config is the source of truth, so an index disappears from MongoDB when its `index` / `unique` / `uniqueCompoundIndexes` / `weight` is removed from the config ✅. Do not create indexes of these collections by hand. Indexes are dropped before the missing ones are created, which is another reason to sync on the start, before any write 📖.
  - Only the collections of the tangible entities of the config (`<name>_things`) and `counter_variables` are synced. Any other collection of the database is never touched, whatever indexes it has: collections of other libraries (e.g. `user`, `session` of better-auth), own collections of the application, collections of entities removed from the config ✅ ([mongoose-models.md](../mongoose-models.md) MM13).
  - Call it again after the database is dropped by the driver (`connection.db.dropDatabase()`) 📖.

  Details: [mongoose-models.md](../mongoose-models.md).

### Step 5. The cost

- Transactions are slower and hold locks until the commit; concurrent mutations of the same documents conflict and are retried (step 2).
- `counter: true` (part 4) makes every create of the entity write one and the same counter document: with transactions concurrent creates of the entity always conflict on it 📖.
- A transaction has MongoDB limits (by default 60 seconds and 16 MB of changes): very large `createMany…` / `…Filtered…` mutations should be split into chunks (part 1, step 6).

### Step 6. Optimistic locking: `lockedData`

A transaction protects one mutation, not "read, think, write" across requests. For that `workOutMutations` accepts `lockedData: { args, result }` in a mutation: before writing it repeats the query `X` / `Xs` with `args` and compares the answer with `result`; if the data has changed since it was read, the chain fails and nothing is written 📖. For lists give `args` a `sort`, the answers are compared by position ([schema-and-resolvers-analysis.md](../schema-and-resolvers-analysis.md) §4).

### Checklist

- [ ] data consistency matters (links, children, several collections per mutation) → `transactions: true` on a replica set;
- [ ] `initMongooseModels` called on the start of the application, with or without transactions;
- [ ] several standard mutations that must succeed together → one `workOutMutations` call in a hand-written resolver (a custom mutation, or an explicitly set resolver of a representation mutation), reads and the permission check before it;
- [ ] big bulk mutations split into chunks; `counter` avoided on entities created concurrently.

---

[← Part 10](10-authorization.md) · [Contents](README.md)
