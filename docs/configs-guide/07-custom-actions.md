## Part 7. Custom queries and mutations, virtual entities

When the standard actions are not enough, you add your own. Like calculated fields, a custom action is split between the two configs: its **signature** goes to the general config (`generalConfig.custom`), its **resolver** to the server-side config (`serversideConfig.Query` / `Mutation`). The examples extend the entities of part 2 (`Currency`, `Country` with `population`, `euMember` and the relational `currency`, `City` with `population` and the relational `country`); they were run on MongoDB with subscriptions excluded by `inventory` ✅.

Two examples:

- `CountrySummary(where)`: a query that returns a computed object with links to countries and cities;
- `importCountries(data)`: a mutation that loads countries with the currency given by its code (part 2, step 4, done on the server).

### Step 1. Virtual entities: types that exist only in the API

The result of `CountrySummary` is not stored anywhere, so it is described by an entity config with `type: 'virtual'`:

```ts
{
  name: 'CountrySummary',
  type: 'virtual',
  intFields: [{ name: 'total', required: true }, { name: 'euMembers', required: true }],
  childFields: [
    { name: 'mostPopulous', configName: 'Country' },
    { name: 'topCities', configName: 'City', array: true },
  ],
}
```

```graphql
type CountrySummary {
  total: Int!
  euMembers: Int!
  mostPopulous: Country
  topCities: [City!]!
}
```

✅ A virtual entity has no collection, no `id` / `createdAt` / `updatedAt` and no generated actions. Besides regular fields it may have **`childFields`**, only in virtual entities: fields that return a tangible (or another virtual) entity as a whole, with all its link fields available to the client (`topCities { name country { code } }`). The reserved field names of part 1 are allowed in virtual entities 📖.

A virtual type appears in the schema only if something uses it: a custom action (below), a calculated field with `calculatedType: 'virtualFields'` (part 6), or `generalConfig.manualyUsedEntities` (step 5).

### Step 2. Signatures in the general config

A custom action is described once, generically, and applied to every tangible entity; `specificName` decides for which entities it exists (an empty string means "not for this entity"):

```ts
// custom.ts
import type { ActionSignatureMethods, ObjectSignatureMethods } from 'graphql-fns';

export const entitySummary: ActionSignatureMethods = {
  name: 'entitySummary',
  specificName: ({ name }) => (name === 'Country' ? 'CountrySummary' : ''),
  argNames: () => ['where'],
  argTypes: ({ name }) => [`${name}WhereInput`],
  involvedEntityNames: ({ name }) => ({ inputOutputEntity: name, outputCityEntity: 'City' }),
  type: ({ name }) => `${name}Summary!`,
  config: ({ name }, generalConfig) => generalConfig.allEntityConfigs[`${name}Summary`],
};

export const entityImportInput: ObjectSignatureMethods = {
  name: 'entityImportInput',
  specificName: ({ name }) => (name === 'Country' ? 'CountryImportInput' : ''),
  fieldNames: () => ['code', 'name', 'population', 'currencyCode'],
  fieldTypes: () => ['String!', 'String', 'Int', 'String'],
};

export const importEntities: ActionSignatureMethods = {
  name: 'importEntities',
  specificName: ({ name }) => (name === 'Country' ? 'importCountries' : ''),
  argNames: () => ['data'],
  argTypes: ({ name }) => [`[${name}ImportInput!]!`],
  involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
  type: ({ name }) => `[${name}!]!`,
  config: (entityConfig) => entityConfig,
};
```

Generated ✅:

```graphql
input CountryImportInput { code: String! name: String population: Int currencyCode: String }

CountrySummary(where: CountryWhereInput): CountrySummary!                    # in Query
importCountries(data: [CountryImportInput!]!): [Country!]!                   # in Mutation
```

| Method | Meaning |
|---|---|
| `name` | the general name; it must contain `entity` / `Entity` / `entities` / `Entities` |
| `specificName` | the name in the schema for this entity, or `''`; it must equal `name` with the entity name substituted (`entitySummary` → `CountrySummary`, `importEntities` → `importCountries`), otherwise the schema composition throws 📖 |
| `argNames`, `argTypes` | the arguments; types may be scalars, enums, geospatial inputs, any generated input (`CountryWhereInput`, `CountryCreateInput`, …) and custom inputs from `custom.Input` |
| `type` | the returned GraphQL type |
| `config` | the entity config of the returned type (`null` for a scalar); it tells the library how to convert the result (step 4) |
| `involvedEntityNames` | the tangible entities the action reads or writes, for authorization and the conversion of ids (step 3) |

`custom.Input` (`ObjectSignatureMethods`) describes input types with `fieldNames` / `fieldTypes` the same way.

**The whole `graphql-fns.general.config.ts`** with the entities, the virtual entity of step 1 and the custom declarations:

```ts
import { composeAllEntityConfigs, composeCustom } from 'graphql-fns';
import type { GeneralConfig, SimplifiedEntityConfig } from 'graphql-fns';

// the signatures above, e.g. kept in "./custom.ts"
import { entityImportInput, entitySummary, importEntities } from './custom';

const entityConfigs: SimplifiedEntityConfig[] = [
  { name: 'Currency', textFields: [{ name: 'code', unique: true, required: true }] },
  {
    name: 'Country',
    textFields: [{ name: 'code', unique: true, required: true }, { name: 'name' }],
    intFields: [{ name: 'population', index: true }],
    booleanFields: [{ name: 'euMember', index: true }],
    relationalFields: [{ name: 'currency', configName: 'Currency', oppositeName: 'countries', index: true }],
  },
  {
    name: 'City',
    textFields: [{ name: 'name' }],
    intFields: [{ name: 'population', index: true }],
    relationalFields: [{ name: 'country', configName: 'Country', oppositeName: 'cities', index: true }],
  },
  {
    name: 'CountrySummary', // the result of the custom query "entitySummary"
    type: 'virtual',
    intFields: [{ name: 'total', required: true }, { name: 'euMembers', required: true }],
    childFields: [
      { name: 'mostPopulous', configName: 'Country' },
      { name: 'topCities', configName: 'City', array: true },
    ],
  },
];

const generalConfig: GeneralConfig = {
  allEntityConfigs: composeAllEntityConfigs(entityConfigs),
  custom: composeCustom({
    Input: [entityImportInput],
    Query: [entitySummary],
    Mutation: [importEntities],
  }),
  inventory: { name: 'main', exclude: { Subscription: true } },
};

export default generalConfig;
```

✅ This is the config the examples of this part were run with.

`composeCustom` only turns the arrays into objects keyed by the general names and checks that the names are valid and unique across `Input`, `Query` and `Mutation`; the same `custom` can be written by hand:

```ts
custom: {
  Input: { entityImportInput },
  Query: { entitySummary },
  Mutation: { importEntities },
},
```

The keys of `custom.Query` / `custom.Mutation` are the general names by which the resolvers are found in `serversideConfig.Query` / `Mutation` (step 4) and by which `inventory` refers to the actions.

Custom actions are subject to `inventory` under their general names: `exclude: { Query: { entitySummary: true } }` 📖. They get no `token` argument automatically ✅: add it to `argNames` / `argTypes` if your authorization needs it.

### Step 3. `involvedEntityNames`

Keys: `inputOutputEntity` (read and returned), `inputEntity` (only read), `outputEntity` (only returned), and any other `output…Entity` key (`outputCityEntity`) for additional returned entities. The library checks them:

- every tangible entity reachable through `childFields` of a returned virtual entity must be listed as `inputOutputEntity` or `output…Entity`; without `outputCityEntity: 'City'` the schema composition fails with `Child tangible entity: "City" of custom config "CountrySummary" not found in "involvedEntityNames"!` ✅;
- for every key the resolver gets a filter of the current user in the 5th argument: `inputOutputEntity` → `resolverOptions.involvedFilters.inputOutputFilterAndLimit`, `outputCityEntity` → `…outputCityFilterAndLimit` ✅. Without authorization they are "no restriction" (`[[]]`) ✅; with authorization (part 10) they carry the user's filters and limits, or `null` if the user has no access.

### Step 4. Resolvers in the server-side config

A resolver is created per entity by a function under the **general name** of the action:

```ts
import { composeQueryResolver, createCreateManyEntitiesMutationResolver, createInfoEssence } from 'graphql-fns';

const serversideConfig: ServersideConfig = {
  Query: {
    entitySummary: (entityConfig, generalConfig, serversideConfig) =>
      async (parent, args, context, info, resolverOptions) => {
        const countries = await composeQueryResolver('Countries', generalConfig, serversideConfig)(
          null,
          { where: args.where, sort: { sortBy: ['population_DESC'] } },
          context,
          createInfoEssence({ projection: { code: 1, population: 1, euMember: 1 } }),
          resolverOptions, // the filter of "inputOutputEntity"
        );

        const topCities = await composeQueryResolver('Cities', generalConfig, serversideConfig)(
          null,
          {
            where: { country_in: countries.map(({ id }) => id) },
            sort: { sortBy: ['population_DESC'] },
            pagination: { first: 2 },
          },
          context,
          createInfoEssence({ projection: { name: 1, population: 1, country: 1 } }),
          { involvedFilters: { inputOutputFilterAndLimit: resolverOptions.involvedFilters.outputCityFilterAndLimit } },
        );

        return {
          total: countries.length,
          euMembers: countries.filter(({ euMember }) => euMember).length,
          mostPopulous: countries[0] ?? null,
          topCities,
        };
      },
  },

  Mutation: {
    importEntities: (entityConfig, generalConfig, serversideConfig) =>
      async (parent, { data }, context, info, resolverOptions) => {
        const codes = [...new Set(data.map(({ currencyCode }) => currencyCode).filter(Boolean))];

        const currencies = await composeQueryResolver('Currencies', generalConfig, serversideConfig)(
          null,
          { where: { code_in: codes } },
          context,
          createInfoEssence({ projection: { code: 1 } }),
          { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
        );

        const idByCode = Object.fromEntries(currencies.map(({ id, code }) => [code, id]));

        const unknown = codes.filter((code) => !idByCode[code]);
        if (unknown.length) throw new TypeError(`Unknown currencies: ${unknown.join(', ')}`);

        return createCreateManyEntitiesMutationResolver(entityConfig, generalConfig, serversideConfig, true)(
          null,
          {
            data: data.map(({ currencyCode, ...rest }) =>
              currencyCode ? { ...rest, currency: { connect: idByCode[currencyCode] } } : rest,
            ),
          },
          context,
          info,
          resolverOptions,
        );
      },
  },
};
```

How the resolver talks to the rest of the library ✅:

- **ids**: the resolver works with Mongo ids only. Its arguments arrive converted (`where: { currency: "<global id>" }` comes as the Mongo id), and its result is converted back by `config`: `id` and link fields of the returned entities, including the entities inside `childFields` of a virtual result, become global ids. Return raw objects, as the standard resolvers return them.
- **standard resolvers** are the building blocks: `composeQueryResolver('<Entity>' | '<Entities>' | '<Entity>_Count' | '<Entity>_Existences' | '<Entity>_ManyDistinctValues' | '<Entity>_ThroughConnection' | …)` for queries, the exported `create…MutationResolver(entityConfig, generalConfig, serversideConfig, true)` and `workOutMutations` for writes (several standard mutations in one transaction: [part 11, step 3](11-transactions.md#step-3-several-standard-mutations-in-one-transaction-workoutmutations)). Called from code they are raw: Mongo ids in and out, an `info` (the one of the custom resolver, or `createInfoEssence({ projection })` for the fields you need) and `resolverOptions` with `involvedFilters` as the 5th argument ([resolver-decorators.md](../resolver-decorators.md)).
- `importCountries` with an unknown code fails with the resolver's error and writes nothing ✅.

### Step 5. Types for your own schema parts: `manualyUsedEntities`

A virtual entity that no generated or custom action uses is not in the schema. If you write part of the schema by hand (your own `typeDefs` merged with the generated ones, and resolvers composed e.g. by `composeManuallyCreatedResolvers`) and need such a type there, list it in `generalConfig.manualyUsedEntities: [{ name: 'CountryBadge' }]`: the type is then added to the generated `typeDefs` ✅. An entity that is already in the schema must not be listed (it throws) 📖. The hand-written part of a schema is described in the [infrastructure guide, part 5](../infrastructure-guide/05-manually-created.md).

### Checklist

- [ ] a result that is not stored → a virtual entity (`type: 'virtual'`), links to stored entities through `childFields`;
- [ ] the signature (`ActionSignatureMethods`, custom inputs `ObjectSignatureMethods`) in `generalConfig.custom` via `composeCustom`; `specificName` = `name` with the entity name, `''` for the other entities;
- [ ] every returned tangible entity in `involvedEntityNames` (`inputOutputEntity` / `output…Entity`), and the matching `involvedFilters` passed to the standard resolvers you call;
- [ ] the resolver creator under the general name in `serversideConfig.Query` / `Mutation`; Mongo ids inside, raw objects out;
- [ ] a `token` argument added by hand if authorization needs it.

---

[← Part 6](06-calculated-fields.md) · [Contents](README.md) · [Part 8 →](08-representations.md)
