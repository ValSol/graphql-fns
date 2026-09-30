## Part 6. Calculated fields

A calculated field is computed when it is read and is never stored. It is the first feature of this guide that needs **both** configs: the shape of the field goes to `graphql-fns.general.config.ts` (safe for the client), the functions go to `graphql-fns.serverSide.config.ts`. This part is a short walkthrough; all details, the edge cases and the design are in [calculated-fields.md](../calculated-fields.md) (§0 "How to use"), upgrading an older project in [migration.md](../migration.md). As before, subscriptions are excluded by `inventory`.

### Step 1. Declare the fields in the general config

```ts
{
  name: 'Country',
  textFields: [{ name: 'code', unique: true, required: true }, { name: 'name' }],
  intFields: [{ name: 'population' }],
  floatFields: [{ name: 'area' }],
  embeddedFields: [{ name: 'names', configName: 'Translation', array: true }],   // part 3
  relationalFields: [{ name: 'currency', configName: 'Currency', oppositeName: 'countries', index: true }],
  calculatedFields: [
    { name: 'density', calculatedType: 'floatFields' },
    { name: 'localName', calculatedType: 'textFields', inputTypes: { lang: 'String!' } },
    { name: 'largestCity', calculatedType: 'textFields', async: true },
    { name: 'sameCurrencyCountries', calculatedType: 'filterFields', configName: 'Country', array: true },
  ],
}
```

| Property | Meaning |
|---|---|
| `calculatedType` | the kind of the value: `booleanFields`, `dateTimeFields`, `intFields`, `floatFields`, `textFields`, `enumFields` (+ `enumName`), `geospatialFields` (+ `geospatialType`), `embeddedFields` (+ `configName` of an embedded config), `virtualFields` (+ `configName` of a `type: 'virtual'` config, an object type that exists only in the API), `filterFields` (+ `configName` of a tangible entity) |
| `array` | a list of such values |
| `inputTypes` | arguments of the field: `{ lang: 'String!' }` → `localName(lang: String!): String` ✅ |
| `async: true` | the field has an `asyncFunc` (step 3) |

Generated fields ✅:

```graphql
density: Float
localName(lang: String!): String
largestCity: String
sameCurrencyCountries(where, sort, pagination): [Country!]!   # + …ThroughConnection, …Count, …DistinctValues
```

A calculated field is read-only: it is not in `…CreateInput` / `…UpdateInput`, not in `…WhereInput` and not in `sort` ✅, and nothing is written to MongoDB ✅. To filter or sort by a value, store it in a regular field.

### Step 2. Write the functions in the server-side config

```ts
const serversideConfig: ServersideConfig = {
  calculatedFields: {
    Country: {
      density: {
        fieldsToUseNames: ['population', 'area'],
        func: (args, data) => (data.population && data.area ? data.population / data.area : null),
      },
      localName: {
        fieldsToUseNames: ['names', 'name'],
        func: (args, data) => data.names?.find(({ lang }) => lang === args.lang)?.text ?? data.name,
      },
      // step 3
      largestCity: { asyncFunc: …, func: … },
      // step 4
      sameCurrencyCountries: { fieldsToUseNames: ['currency'], func: … },
    },
  },
};
```

- The callbacks are keyed by entity name and field name; `composeTypeDefsAndResolvers` rejects callbacks of unknown entities / fields, `fieldsToUseNames` that are not fields of the entity, and `async` without `asyncFunc` (or the reverse) 📖.
- `func(args, data, resolverArg, asyncFuncResult, index)` returns the value. `args` are the arguments of this field (`{ lang: 'pl' }`); aliases with different arguments work: `pl: localName(lang: "pl") en: localName(lang: "en")` ✅.
- `data` is the raw entity from MongoDB: ids are Mongo ids, not global ones ✅, and only the fetched fields are there. **`fieldsToUseNames`** lists the fields the function needs: they are added to the Mongo projection even if the client does not request them ✅.

### Step 3. Async fields: one call for the whole list

`asyncFunc(args, resolverCreatorArg, resolverArg, entityOrEntities)` runs **once per root query**: with the array of all entities for list queries, with one entity for single-entity queries ✅. It is the place for one database query instead of one per entity. `func` then picks the value of its entity from the result:

```ts
largestCity: {
  asyncFunc: async (args, resolverCreatorArg, { context }, entityOrEntities) => {
    const countries = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];

    const cities = await context.mongooseConn.connection.db
      .collection('city_things')
      .find({ country: { $in: countries.map(({ _id }) => _id) } })
      .sort({ population: -1 })
      .toArray();

    const largestByCountry = new Map<string, string>();
    cities.forEach(({ country, name }) => {
      if (!largestByCountry.has(String(country))) largestByCountry.set(String(country), name);
    });

    return largestByCountry;
  },
  func: (args, data, resolverArg, largestByCountry) => largestByCountry.get(String(data.id)) ?? null,
},
```

✅ `Countries { largestCity }` for 3 countries calls `asyncFunc` once; nested lists (`Currency { countries { largestCity } }`) get their own call.

`asyncFunc` works with raw MongoDB data: its entities are the fetched documents as they are, with `_id` ✅, which is what a query to MongoDB needs. `data` of `func` has the same Mongo id as `id` ✅.

### Step 4. Calculated filter fields

A calculated `filterFields` field works like a filter field of part 2, but its selector is built by `func` from the entity: `func` returns the filter as a JSON string with Mongo ids ✅:

```ts
sameCurrencyCountries: {
  fieldsToUseNames: ['currency'],
  func: (args, data) =>
    JSON.stringify(
      data.currency
        ? { currency: String(data.currency), id_nin: [String(data.id)] } // the same currency, except itself
        : { id_in: [] },                                               // nothing
    ),
},
```

```graphql
{ Countries { code sameCurrencyCountries { code } sameCurrencyCountriesCount } }
# DE → [AT], AT → [DE], UA → []   ✅
```

The fields used in the selector must be available for filtering in the target entity (here `currency` has `index: true`).

### Step 5. Where the values appear

- In every query and in the results of mutations (`updateCountry(…) { density largestCity }`) ✅.
- In subscriptions: see [calculated-fields.md](../calculated-fields.md) §0 (`allowedCalculatedWithAsyncFuncFieldNames`).
- Resolvers called from your own code (`composeQueryResolver(…)`, mutation resolvers, `workOutMutations`) return calculated values only with `materializeCalculatedFields: true` in their options; otherwise the values are computed only when the result goes through GraphQL ([calculated-fields.md](../calculated-fields.md) §0).

### Checklist

- [ ] the declaration (`calculatedFields` of the entity) in the general config, the functions (`serversideConfig.calculatedFields`) in the server-side config;
- [ ] `fieldsToUseNames` lists every stored field the function reads;
- [ ] per-entity database queries go to `asyncFunc` (+ `async: true`), one query for the whole list (it gets raw documents, with `_id`);
- [ ] calculated filter fields return a JSON selector with Mongo ids over fields filterable in the target;
- [ ] values needed for filtering or sorting are stored in regular fields, not calculated.

---

[← Part 5](05-inventory.md) · [Contents](README.md) · [Part 7 →](07-custom-actions.md)
