## Part 1. Arrays of objects → collections → GraphQL

### Starting point

```ts
const countries = [
  { code: 'UA', name: 'Ukraine', population: 41000000, area: 603628.5, euMember: false,
    continent: 'EUROPE', languages: ['uk'], independenceDate: '1991-08-24T00:00:00.000Z' },
  { code: 'PL', name: 'Poland', population: 37600000, area: 312696.0, euMember: true,
    continent: 'EUROPE', languages: ['pl'], independenceDate: '1918-11-11T00:00:00.000Z' },
];

const currencies = [
  { code: 'UAH', name: 'Hryvnia', symbol: '₴' },
  { code: 'PLN', name: 'Zloty', symbol: 'zł' },
];
```

### Step 1. One array = one entity

Every array becomes one **tangible** entity config (the default `type`), i.e. one MongoDB collection. Name rules (checked by `composeAllEntityConfigs`, it throws otherwise) ✅:

- **singular**, PascalCase: `Country`, not `Countries` (the plural is derived with `pluralize`: `Country` → `Countries`, `Currency` → `Currencies`);
- no `_` (underscore);
- not `DateTime`, `Node`, `node`, `PageInfo`;
- unique across the config.

### Step 2. Map every property to a field kind

Look at the values of each property and pick the matching array of the entity config:

| Values in the source array | Field kind | Example declaration |
|---|---|---|
| strings | `textFields` | `{ name: 'name' }` |
| integers | `intFields` | `{ name: 'population' }` |
| non-integer numbers | `floatFields` | `{ name: 'area' }` |
| `true` / `false` | `booleanFields` | `{ name: 'euMember' }` |
| dates (`Date` or ISO string) | `dateTimeFields` | `{ name: 'independenceDate' }` |
| strings from a fixed set | `enumFields` + `enums` | `{ name: 'continent', enumName: 'Continent' }` |
| arrays of any of the above | same kind + `array: true` | `{ name: 'languages', array: true }` |

References to other arrays are covered in [part 2](02-relations.md) (`relationalFields`, `duplexFields`, `filterFields`), nested objects and GeoJSON in [part 3](03-nested-objects-and-geodata.md) (`embeddedFields`, `geospatialFields`).

Do not declare `id`, `createdAt`, `updatedAt`: every entity gets them automatically ✅. If your source objects have their own `id` (a key from another system), store it in a separate field, e.g. `textFields: [{ name: 'externalId', unique: true }]`.

**Field names.** A general rule worth following: a field with `array: true` has a **plural** name (`languages`, `names`, `cities`), a field without it has a **singular** one (`name`, `currency`, `capital`, `territory`). It applies to every field kind, including the `oppositeName` of a relational field (the added field is always an array: `countries`, `neighbourOfCountries`) and the halves of a duplex link (`Country.cities` ↔ `City.country`). The reader of the schema then sees at once whether a field returns one value or a list. Names checked by `composeAllEntityConfigs` (it throws otherwise) 📖:

- no `_` (underscore);
- not `id`, `createdAt`, `updatedAt`, `counter`, `connect`, `create`, `pageInfo`, `in`, `nin`, `ne`, `gt`, `gte`, `lt`, `lte`, `re` (allowed only in virtual entities);
- no endings `ThroughConnection`, `GetOrCreate`, `DistinctValues`; an array field must not end with `Count`, a filter field with `Stringified` (these suffixes are used by the generated fields);
- unique within the entity, including the fields added to it as opposites of relational links.

Field options that matter already for plain data:

| Option | Effect |
|---|---|
| `required: true` | non-null in the GraphQL type and in `…CreateInput` ✅ |
| `unique: true` | unique Mongo index; the field appears in `…WhereOneInput` (fetch / update / delete a single entity by it) ✅ |
| `index: true` | Mongo index; the field appears in `…WhereInput` (filters) and in `…SortEnum` ✅ |
| `default` | value used when the field is absent on create |
| `array: true` | list field; for arrays `nullable: true` allows `null` instead of `[]` |
| `weight` (`textFields`) | includes the field into the text index with this weight ([below](#full-text-search-weight)) |
| `freeze: true` | the field can be set on create but not changed by update |

> **Main rule:** you can filter and sort only by fields with `index: true` (or `unique: true` for filtering). Without an index the field is still stored and returned, but it is absent from `where` and `sort` ✅. So mark as `index: true` every field you plan to filter or sort by.

#### Full-text search: `weight`

Example (a `description` text field is added to `Country`, `names` is an embedded array of translations from part 3):

```ts
textFields: [
  { name: 'code', unique: true, required: true },
  { name: 'name', weight: 10 },
  { name: 'description', weight: 1 },
],
```

`weight` on a text field includes it in the text index of the collection with this weight; text fields of embedded entities ([part 3](03-nested-objects-and-geodata.md)) are included too, with the path (`names.text`), and the embedded field needs no `index` for that ✅. MongoDB allows one text index per collection, so the library creates one index `TextIndex` over all weighted fields ✅.

Although the index is common, `weight` is set on each text field: it is what puts the field into the index. The entity then gets the `search: String` argument in `Xs`, `XsThroughConnection`, `XsByUnique`, `XCount`, `XCounts`, `XDistinctValues`, `updateFiltered…`, `deleteFiltered…` ✅:

```graphql
{
  Countries(search: "poland") { code }        # PL (in "name", weight 10), then SK and UA (in "description")
  Countries(search: "Ukraina") { code }       # UA: found in names.text
  CountryCount(search: "poland")
  Countries(search: "poland", where: { code_in: ["UA", "PL"] }) { code }
}
```

- Without `sort` the result is ordered by relevance (`textScore`, i.e. by the weights) ✅; an explicit `sort` replaces that order ✅.
- The search is MongoDB `$text`: by words with stemming, not by substrings. For substrings use `x_re` of an indexed field (step 7).

### Step 3. `graphql-fns.general.config.ts`

```ts
import { composeAllEntityConfigs } from 'graphql-fns';
import type { Enums, GeneralConfig, SimplifiedEntityConfig } from 'graphql-fns';

const enums: Enums = {
  Continent: ['AFRICA', 'ASIA', 'EUROPE'],
};

const entityConfigs: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    textFields: [
      { name: 'code', unique: true, required: true },
      { name: 'name', required: true, index: true },
      { name: 'languages', array: true },
    ],
    intFields: [{ name: 'population', index: true }],
    floatFields: [{ name: 'area' }],
    booleanFields: [{ name: 'euMember', index: true }],
    enumFields: [{ name: 'continent', enumName: 'Continent', index: true }],
    dateTimeFields: [{ name: 'independenceDate' }],
  },
  {
    name: 'Currency',
    textFields: [
      { name: 'code', unique: true, required: true },
      { name: 'name' },
      { name: 'symbol' },
    ],
  },
];

const generalConfig: GeneralConfig = {
  allEntityConfigs: composeAllEntityConfigs(entityConfigs, enums),
  enums,
};

export default generalConfig;
```

What happens here:

- you write **simplified** configs (`SimplifiedEntityConfig`: field declarations without `type`, references by `configName`); `composeAllEntityConfigs` turns them into full `EntityConfig`s, validates names and enums, and adds the auxiliary virtual configs (`CountryConnection`, `CountryEdge`, payloads of subscriptions, …);
- `enums` is passed twice: to `composeAllEntityConfigs` (to check `enumName`s) and to `generalConfig` (to generate `ContinentEnumeration` in the schema and the Mongo enum validation). The GraphQL enum is named `<enumName>Enumeration` ✅;
- no `inventory` means "all standard actions for all entities", subscriptions included (see step 7). If you do not need subscriptions, exclude them — then no `pubsub` is needed in the context (see step 5):

  ```ts
  const generalConfig: GeneralConfig = {
    allEntityConfigs: composeAllEntityConfigs(entityConfigs, enums),
    enums,
    inventory: { name: 'main', exclude: { Subscription: true } },
  };
  ```

### Step 4. `graphql-fns.serverSide.config.ts`

For plain data nothing is required, the file can be as small as:

```ts
import type { ServersideConfig } from 'graphql-fns';

const serversideConfig: ServersideConfig = {};

export default serversideConfig;
```

The `serversideConfig` argument of `composeTypeDefsAndResolvers` is optional, so you may omit the file until you need calculated fields, authorization (`getUserAttributes`, `inventoryByRoles`, `filters`, …), `staticLimits` or `transactions: true` (requires a replica set). Those are the subject of later parts.

### Step 5. Build the schema and the server

```ts
import mongoose from 'mongoose';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { composeTypeDefsAndResolvers } from 'graphql-fns';

import generalConfig from './graphql-fns.general.config';
import serversideConfig from './graphql-fns.serverSide.config';

const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);

export const schema = makeExecutableSchema({ typeDefs, resolvers });

const mongooseConn = await mongoose.connect(process.env.MONGODB_URI!);

// pass it to Apollo / Yoga / graphql-ws …
export const context = () => ({ mongooseConn });
```

The resolvers take the connection from `context.mongooseConn` ✅. A complete setup with GraphQL Yoga in a Next.js application: [infrastructure guide, part 3](../infrastructure-guide/03-server.md).

`context.pubsub` is needed **whenever the schema has subscriptions**, and without `inventory` it always has them: besides the subscription resolvers, the mutations `createX`, `updateX`, `deleteX` and `pushIntoX` publish the `createdX` / `updatedX` / `deletedX` events ✅. So:

- subscriptions excluded by `inventory` (step 3) → `({ mongooseConn })` is enough ✅;
- otherwise → `({ mongooseConn, pubsub })` with `pubsub` imported from `graphql-fns` (an in-process PubSub; for several server instances pass your own implementation with the same interface).

> With subscriptions in the schema and no `pubsub` in the context these mutations fail with `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!` **before** any write, so the database is not changed ✅. `createManyX`, `updateManyX`, `…Filtered…` and `deleteManyX` do not publish events and work without `pubsub`.

### Step 6. Load the arrays into the collections

**A. Through GraphQL (recommended)** — goes through all the library logic: validation, enums, default values, `createdAt`/`updatedAt`, ids, subscriptions:

```graphql
mutation LoadCountries($data: [CountryCreateInput!]!) {
  createManyCountries(data: $data) { id code }
}
```

```ts
import { graphql } from 'graphql';

const result = await graphql({
  schema,
  source: LOAD_COUNTRIES,
  variableValues: { data: countries },
  contextValue: { mongooseConn },
});
```

Dates may be `Date` objects or ISO strings; enum values are the strings from `enums` ✅. For large arrays split them into chunks of a few hundred objects per mutation.

> The library creates the collection and the indexes of an entity before it first uses its model, so unique indexes hold from the very first write ✅. On the start of an application call `initMongooseModels` once, to create them all in advance and to learn about index problems at once ([part 11, step 4](11-transactions.md#step-4-requirements); details: [mongoose-models.md](../mongoose-models.md)).

**B. Directly through Mongoose** — for a one-time seed of big arrays:

```ts
import { initMongooseModels } from 'graphql-fns';

const models = await initMongooseModels(mongooseConn, generalConfig);

await models.Currency.insertMany(currencies);
```

`initMongooseModels` returns the models the resolvers use (keyed by entity name), with their collections and indexes already created ([mongoose-models.md](../mongoose-models.md) MM12). The model of `Currency` is `Currency_Thing`, its collection `currency_things` ✅; the schema (fields, indexes, `timestamps`) is built from the same entity config by `createThingSchema`. Documents inserted this way are immediately visible through the GraphQL API ✅. This way skips the library's own create logic (no subscriptions, no processing of relations): for relations see [part 2, step 4](02-relations.md#step-4-load-the-arrays).

### Step 7. What you get

For every tangible entity (shown for `Country`, `Currency` is the same) ✅:

**Queries**

| Query | Purpose |
|---|---|
| `Country(whereOne)` | one entity by `id` or a `unique` field |
| `Countries(where, sort, pagination)` | list |
| `CountriesThroughConnection(where, sort, first, after, last, before)` | Relay connection |
| `CountriesByUnique(where)` | list by arrays of `id`s / unique values, preserving order |
| `CountryCount(where)` | number of entities |
| `CountryCounts(where, restrictedWhere)` | several numbers in one query: one per item of `restrictedWhere` within `where` ([entity-counts.md](../entity-counts.md)) |
| `CountryDistinctValues(where, options)` | distinct values of an indexed or unique text / enum field |
| `node(id)` | any entity by its global id |

**Mutations**: `createCountry`, `createManyCountries`, `updateCountry`, `updateManyCountries`, `updateFilteredCountries`, `updateFilteredCountriesReturnScalar`, `deleteCountry`, `deleteManyCountries`, `deleteFilteredCountries`, `deleteFilteredCountriesReturnScalar`, and `pushIntoCountry` (append to array fields — generated only if the entity has array fields, so there is no `pushIntoCurrency`).

**Subscriptions**: `createdCountry`, `updatedCountry`, `deletedCountry`.

Examples ✅:

```graphql
{
  Country(whereOne: { code: "UA" }) { name population }

  Countries(
    where: { euMember: false, population_gt: 1000000, name_re: [{ pattern: "^U", flags: "i" }] }
    sort: { sortBy: [name_ASC] }
    pagination: { skip: 0, first: 20 }
  ) { id code name continent createdAt }

  CountryCount(where: { continent: EUROPE })

  # [all not EU, not EU in Europe, not EU with population > 10M]
  CountryCounts(
    where: { euMember: false }
    restrictedWhere: [{}, { continent: EUROPE }, { population_gt: 10000000 }]
  )

  CountriesThroughConnection(first: 10) {
    edges { node { code } }
    pageInfo { hasNextPage endCursor }
  }
}

mutation {
  updateCountry(whereOne: { code: "PL" }, data: { population: 38000000 }) { population }
  deleteCurrency(whereOne: { code: "PLN" }) { code }
}
```

Operators of `where` for an indexed field `x`: `x` (equality), `x_in`, `x_nin`, `x_ne`, `x_gt`, `x_gte`, `x_lt`, `x_lte`, `x_re` (text and enum fields), `x_exists`; boolean fields have only `x`, `x_ne`, `x_exists`; conditions combine with `AND`, `OR`, `NOR` ✅. A `unique` field is filtered by `x_in`, `x_nin`, … but not by plain equality — for one entity use `whereOne` ✅.

`id`s in the API are global ids (base64 of `<mongoId>:Country:`), not raw Mongo `_id`s ✅. Use them as they are returned.

### Checklist

- [ ] one entity per array, name singular PascalCase without `_`;
- [ ] each property declared in the field kind that matches its values; no `id` / `createdAt` / `updatedAt`;
- [ ] array fields named in the plural, the others in the singular;
- [ ] full-text search → `weight` on the text fields to search in (nested ones included); relevance order unless `sort` is given;
- [ ] `index: true` on every field you will filter or sort by, `unique: true` on natural keys;
- [ ] `required: true` only where every source object has the value (otherwise the create fails);
- [ ] every `enumName` present in `enums`, `enums` passed both to `composeAllEntityConfigs` and to `generalConfig`;
- [ ] context of every GraphQL call contains `mongooseConn`, plus `pubsub` unless subscriptions are excluded by `inventory`.

---

[Contents](README.md) · [Part 2 →](02-relations.md)
