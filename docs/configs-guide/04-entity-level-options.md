## Part 4. Entity-level options

Options set on the entity config itself, not on a field. As before, the examples were run with subscriptions excluded by `inventory` and `({ mongooseConn })` as the context.

```ts
const entityConfigs: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    counter: true,
    interfaces: ['Named'],
    textFields: [{ name: 'code', unique: true, required: true }, { name: 'name' }],
  },
  {
    name: 'City',
    interfaces: ['Named'],
    uniqueCompoundIndexes: [['name', 'country']],
    textFields: [{ name: 'name' }],
    relationalFields: [{ name: 'country', configName: 'Country', oppositeName: 'cities', index: true }],
  },
];

const generalConfig: GeneralConfig = {
  allEntityConfigs: composeAllEntityConfigs(entityConfigs),
  interfaces: { Named: ['name'] },
  inventory: { name: 'main', exclude: { Subscription: true } },
};
```

### `uniqueCompoundIndexes`: uniqueness of a combination of fields

A city name is not unique by itself, but it is unique within a country. `uniqueCompoundIndexes: [['name', 'country']]` creates the unique Mongo index `{ name: 1, country: 1 }` ✅. Several combinations are allowed. `composeAllEntityConfigs` checks every combination: at least 2 existing fields, no arrays, and only fields of the kinds text, int, float, dateTime, relational and duplex; e.g. an enum or boolean field throws ✅ ([where-compound-one.md](../where-compound-one.md) WC1). `uniqueCompoundIndexes: []` throws too ✅. The fields of a combination need no `index: true` of their own: in the example `name` has none ✅.

`index: true` is still needed on a field of a combination if you filter by it: a field appears in `…WhereInput` only with its own `index` / `unique` ✅. In the example `country` has `index: true` for `where: { country: … }` and for the opposite field `Country.cities`, which finds the cities by `country`. MongoDB could serve a query by `name` alone with the prefix of the compound index `{ name: 1, country: 1 }`, but to get `name` into `where` you have to add `index: true`, i.e. one more separate index.

- A second `Kyiv` in Ukraine fails with `E11000 duplicate key error … index: name_1_country_1` ✅; `Novyi Svit` in Ukraine and in Poland is allowed ✅.
- An absent field is indexed as `null`: two entities that both lack the same field of a combination (with equal other fields) collide too ✅. With `[['postcode', 'country']]` two cities of one country without `postcode` cannot exist, so put only always-filled fields into a combination.

**Selecting one entity by a combination: `whereCompoundOne`.** Every action that selects one entity by a unique key takes `whereCompoundOne: CityWhereCompoundOneInput` next to `whereOne`, and `whereOne` becomes optional ✅:

| Action | Argument |
|---|---|
| query `City` | `whereCompoundOne` |
| `updateCity`, `deleteCity`, `deleteCityWithChildren` | `whereCompoundOne` |
| `deleteManyCities`, `deleteManyCitiesWithChildren` | `whereCompoundOne: [CityWhereCompoundOneInput!]` |
| `updateManyCities` | `whereCompoundOneAndData: [CityWhereCompoundOneAndDataInput!]`, items `{ whereCompoundOne, data }` |
| `copyCity`, `copyCityWithChildren` | `whereCompoundTarget` next to `whereTarget` (the entity copied **into**); the source is still selected by `whereKeyToSource` |
| `copyManyCities`, `copyManyCitiesWithChildren` | `sourceAndCompoundTargetAndData` / `sourceAndCompoundTarget`, items `{ whereKeyToSource, whereCompoundTarget, data? }` |

```graphql
{ City(whereCompoundOne: { name: "Novyi Svit", country: "<id of PL>" }) { name country { code } } }

mutation {
  updateCity(whereCompoundOne: { name: "Kyiv", country: "<id of UA>" }, data: { population: 2950000 }) { id }
}
```

- `CityWhereCompoundOneInput` has the fields of all combinations of the entity, all optional; relational and duplex fields take global ids ✅.
- Pass **exactly** the fields of one combination: `{ name: "Kyiv" }` alone, fields of two combinations or `…_exists` are rejected ✅. A field with `null` counts as present and matches an absent value, which is the way to address an entity without that field ✅.
- Pass either `whereOne` or `whereCompoundOne`, not both ✅.
- Not found and not allowed behave as with `whereOne`: `updateX` / `deleteX` fail on the non-null result, `…Many…` return `null` ✅.
- Representations keep `whereCompoundOne` only if they keep **all** fields of **all** combinations of the entity; otherwise their actions take `whereOne` only (part 8) ✅.

Details: [where-compound-one.md](../where-compound-one.md).

### `counter: true`: sequential number

The entity gets the field `counter: Int!`: 1, 2, 3, … in the order of creation, per entity ✅.

- Numbers are not reused: after deleting the entity with `counter: 4` the next one gets `5` ✅. The current value is kept in the collection `counter_variables` as `{ _id: 'Country', seq: 5 }` ✅.
- `counter` cannot be set or changed (it is not in `…CreateInput` / `…UpdateInput`) ✅, has a unique Mongo index ✅, can be filtered by `counter_in`, `counter_nin`, `counter_ne`, `counter_gt`, `counter_gte`, `counter_lt`, `counter_lte` ✅, but is **not** in `…WhereOneInput` and **not** in `sort` ✅.
- **Directly through Mongoose** (part 1, step 6 B) you have to assign `counter` yourself (the field is `required` and `unique` in the Mongoose schema) and then set `seq` in `counter_variables` to the last assigned value (the model is `Counter_Variable` of the result of `initMongooseModels`), otherwise the next `create…` gets a number that is already used 📖.

> ⚠️ **Use `counter` only when a sequential number is a real requirement** (numbers of invoices, orders, tickets shown to people). MongoDB has no auto-increment: the library emulates it with a separate counter document, which is a workaround with known costs, not a natural MongoDB pattern:
>
> - every `create…` of the entity makes an extra write to one and the same document `counter_variables.{_id: 'Country'}` 📖; under concurrent creates it is a hot spot, and with `transactions: true` concurrent creates conflict on it (`WriteConflict`) and are retried 📖;
> - without transactions the counter is incremented before the entities are written, so a failed create leaves a gap in the numbers 📖; numbers are not reused after deletes either ✅, so `counter` is unique and growing, but not gapless;
> - it does not scale to sharded collections well (one global counter document).
>
> For identity and ordering you do not need it: `id` is unique, and `createdAt` (indexed, available in `sort`) gives the order of creation ✅.

### `interfaces`: common GraphQL interfaces

`generalConfig.interfaces` declares interfaces and their fields, `interfaces` of an entity lists what it implements ✅:

```graphql
interface Named {
  name: String
}
type Country implements Node & Named { … }
type City implements Node & Named { … }
```

- The fields of an interface must exist in every implementing entity with **exactly the same** GraphQL type and arguments (e.g. `name` must not be `required` in one entity and optional in another), otherwise `composeTypeDefsAndResolvers` throws 📖.
- An interface name follows the rules of entity names (singular, not an entity name, not `Node` / `DateTime` / `PageInfo`) 📖.
- The standard API does not return interfaces, so the benefit is on the client: common fragments work for all implementing types ✅:

  ```graphql
  { node(id: "…") { ... on Named { name } } }
  ```

### Checklist

- [ ] natural keys made of several always-filled fields → `uniqueCompoundIndexes`; select by them with `whereCompoundOne` (exactly the fields of one combination);
- [ ] `counter: true` only if a human-readable sequential number is really required (for order use `createdAt`); when writing directly to MongoDB, maintain `counter_variables`;
- [ ] shared fragments on the client → `generalConfig.interfaces` + `interfaces` of the entities, with identical field types.

---

[← Part 3](03-nested-objects-and-geodata.md) · [Contents](README.md) · [Part 5 →](05-inventory.md)
