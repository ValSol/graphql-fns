## Part 5. The hand-written part of the schema: `manuallyCreatedTypeDefs` and `manuallyCreatedResolverComposers`

Not every field of an API is "an action on entity X". A dashboard with numbers from several collections, the current user, a search across entities, an operation with a result shape of its own: such fields are written by hand and merged with the generated schema. The two names are a **convention of the application**, not keys of a config:

| Name | What it is |
|---|---|
| `manuallyCreatedTypeDefs` | a string of SDL: your own types, inputs and enums, and `type Query { … }` / `type Mutation { … }` with your fields |
| `manuallyCreatedResolverComposers` | `{ Query, Mutation }`, where every key is a field name and every value a **composer**: a function `(generalConfig, serversideConfig) => resolver` |

The library contributes one function, `composeManuallyCreatedResolvers`, which turns the composers into resolvers; the merge with the generated part is done by `@graphql-tools/merge` ([part 2](02-schema.md), step 2).

### Custom action or manually created field?

The library has its own way to add queries and mutations: custom actions ([part 7 of the guide to the configs](../configs-guide/07-custom-actions.md)). The difference:

| | Custom action | Manually created field |
|---|---|---|
| SDL | generated for every entity from `ActionSignatureMethods` | written by hand, once |
| Resolver | a creator in `serversideConfig.Query` / `Mutation`, called per entity | a composer, called once |
| `inventory` / `inventoryByRoles` | apply | not consulted |
| Authorization of the library | yes, the filters of the user arrive in the 5th argument | **no** |
| Arguments: global ids → Mongo ids | yes | **no** |
| Result: Mongo ids → global ids | yes | **no** |

Use a custom action when the operation belongs to an entity (or to several entities in the same way) and should obey the roles and filters of the config. Use a manually created field when it spans entities, returns a shape of its own, or reads the caller in its own way.

### Step 1. The type definitions

```ts
// src/data/manuallyCreatedTypeDefs.ts
const manuallyCreatedTypeDefs = `#graphql
type Stats {
  countries: Int!
  cities: Int!
}

type Query {
  Stats: Stats!
}

type Mutation {
  growCountry(id: ID!, by: Int!): Country
}`;

export default manuallyCreatedTypeDefs;
```

- The SDL may use everything the generated schema contains, by name: entity types (`Country` ✅), their inputs (`CountryWhereInput`, `CountryCreateInput`), enums (`<enumName>Enumeration`), the scalars (`DateTime`), `PageInfo`, geospatial types. Open `src/schema.graphql` to see the names.
- `type Query { … }` and `type Mutation { … }` are written as plain definitions (not `extend type`): `mergeTypeDefs` merges them with the generated ones ✅.
- It is a template string, so repetitive parts can be generated from the same constants the rest of the application uses (`${names.map((name) => `  ${name}: Int!`).join('\n')}`).
- A **virtual** entity gets into the generated schema only if something generated uses it. To return one from a manually created field, list it in `generalConfig.manualyUsedEntities` ([part 7, step 5](../configs-guide/07-custom-actions.md#step-5-types-for-your-own-schema-parts-manualyusedentities)).
- `#graphql` in the first line only turns on the syntax highlighting of editors.

### Step 2. The composers

```ts
// src/data/manuallyCreatedResolverComposers/Query/Stats.ts
import { composeQueryResolver, createInfoEssence } from 'graphql-fns';
import type { ActionResolver, GeneralConfig, ServersideConfig } from 'graphql-fns';

// no restrictions: a manually created resolver decides about the access itself
const resolverOptions = { involvedFilters: { inputOutputFilterAndLimit: [[]] as [[]] } };

const Stats = (generalConfig: GeneralConfig, serversideConfig: ServersideConfig): ActionResolver => {
  // the composer is called once, when the schema is built
  const countCountries = composeQueryResolver('Country_Count', generalConfig, serversideConfig);
  const countCities = composeQueryResolver('City_Count', generalConfig, serversideConfig);

  const info = createInfoEssence({ projection: { _id: 1 } });

  // the resolver is called for every request
  return async (parent, args, context) => {
    const [countries, cities] = await Promise.all([
      countCountries(null, {}, context, info, resolverOptions),
      countCities(null, {}, context, info, resolverOptions),
    ]);

    return { countries, cities };
  };
};

export default Stats;
```

```ts
// src/data/manuallyCreatedResolverComposers/Query/index.ts
import Stats from './Stats';

const Query = { Stats };

export default Query;
```

```ts
// src/data/manuallyCreatedResolverComposers/Mutation/index.ts
import growCountry from './growCountry';

const Mutation = { growCountry };

export default Mutation;
```

```ts
// src/data/manuallyCreatedResolverComposers/index.ts
import Mutation from './Mutation';
import Query from './Query';

const manuallyCreatedResolverComposers = { Query, Mutation };

export default manuallyCreatedResolverComposers;
```

A composer is a closure in two levels:

- the **outer** function gets `(generalConfig, serversideConfig)` and runs once, when `typeDefsAndResolvers.ts` is imported. Prepare there everything that does not depend on a request: the resolvers of the library, entity configs, projections;
- the **inner** function is an ordinary GraphQL resolver `(parent, args, context, info)`. `context` is the context of Yoga ([part 3](03-server.md), step 2): `context.mongooseConn`, `context.request`, and whatever you added.

The key in `Query` / `Mutation` must be the name of the field in the SDL. A field without a composer gets no resolver (it returns `null`, or an error for a non-null type); a composer without a field makes the creation of the schema fail (`Query.NoSuchField defined in resolvers, but not in schema`) ✅.

One file per field, grouped in folders when there are many (`Query/geo/…`, `Mutation/files/…`), and `index.ts` files that map field names to composers: the structure scales to dozens of fields.

### Step 3. `composeManuallyCreatedResolvers`

```ts
const manuallyCreatedResolvers = composeManuallyCreatedResolvers(
  manuallyCreatedResolverComposers,
  generalConfig,
  serversideConfig,
);
// { Query: { Stats: [resolver] }, Mutation: { growCountry: [resolver] } }
```

All it does ✅:

- calls every composer of `Query` and `Mutation` with `(generalConfig, serversideConfig)`;
- keeps the results that are not empty: a composer may return `null` to switch its resolver off (e.g. by an environment variable);
- returns `{ Query, Mutation }`. Other keys are ignored: no `Subscription`, no resolvers of the fields of your own types. If you need those, add one more object to `mergeResolvers([...])`.

**The resolvers are not wrapped in anything.** What the composer returns is what Yoga calls: no authorization, no conversion of ids, no `inventory`. Step 4 is about what follows from that.

The TypeScript type of the first argument requires both `Query` and `Mutation`; pass `Mutation: {}` if there are no manually created mutations.

**Name collisions** with the generated part, for `mergeTypeDefs([manual, generated])` / `mergeResolvers([manual, generated])` ✅:

- the same field name with a different type: `yarn schema` fails with `Unable to merge GraphQL type "Query": Field "…" already defined with a different type`;
- the same field name with the same type: no error, the arguments are merged and the resolver of the **later** item wins, i.e. the generated one; the manually created resolver is silently dropped.

So give manually created fields names the library never generates. The generated names are built from the entity names (`Country`, `Countries`, `CountryCount`, `CountriesThroughConnection`, `createCountry`, …): a field name that is not an action on an entity name is safe.

### Step 4. What a manually created resolver does itself

```ts
// src/data/manuallyCreatedResolverComposers/Mutation/growCountry.ts
import {
  composeQueryResolver,
  createInfoEssence,
  createUpdateEntityMutationResolver,
  fromGlobalId,
  transformAfter,
} from 'graphql-fns';
import type { ActionResolver, GeneralConfig, ServersideConfig } from 'graphql-fns';

const resolverOptions = { involvedFilters: { inputOutputFilterAndLimit: [[]] as [[]] } };

const growCountry = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): ActionResolver => {
  const { Country } = generalConfig.allEntityConfigs;

  const getCountry = composeQueryResolver('Country', generalConfig, serversideConfig);

  const updateCountry = createUpdateEntityMutationResolver(
    Country,
    generalConfig,
    serversideConfig,
    true, // "inAnyCase": create the resolver whatever "inventory" says
  )!;

  return async (parent, args, context, info) => {
    const { id: globalId, by } = args as { id: string; by: number };

    // arguments come as the client sent them: "id" is a global id
    const { _id: id, entityName } = fromGlobalId(globalId);

    if (entityName !== 'Country') return null;

    const country = await getCountry(
      null,
      { whereOne: { id } },
      context,
      createInfoEssence({ projection: { population: 1 } }), // the fields the resolver itself needs
      resolverOptions,
    );

    if (!country) return null;

    const updatedCountry = await updateCountry(
      null,
      { whereOne: { id }, data: { population: (country.population ?? 0) + by } },
      context,
      info, // the fields the client selected
      resolverOptions,
    );

    // the result goes to the client as it is returned: turn mongo ids into global ids
    return transformAfter({}, updatedCountry, Country, null);
  };
};

export default growCountry;
```

```graphql
mutation { growCountry(id: "NmFiY2…OkNvdW50cnk6", by: 1000) { id population cities { name country { code } } } }
```

✅ returns the country with the new `population`, its global `id` and its cities.

The resolver works with the database through the **resolvers of the library**, not through Mongoose directly: they apply the defaults, `updatedAt`, links between entities, calculated fields and transactions exactly as the generated schema does. Called from code they are raw ([resolver-decorators.md](../resolver-decorators.md)), so the manually created resolver does the rest:

| Concern | What to do |
|---|---|
| **Ids in** | Arguments are not converted. Decode a global id with `fromGlobalId(id)` → `{ _id, entityName, representationKey }` and pass `_id` to the library resolvers; check `entityName` if the id must be of a certain entity. A broken id gives `_id: null` ✅. |
| **Reading** | `composeQueryResolver(key, generalConfig, serversideConfig)`, the keys: `'Country'` (one), `'Countries'` (list), `'Country_Count'`, `'Country_ThroughConnection'`, `'Country_DistinctValues'`. The arguments are the ones of the generated query (`whereOne`, `where`, `sort`, `pagination`, …), with Mongo ids. |
| **Writing** | the exported `create…MutationResolver(entityConfig, generalConfig, serversideConfig, true)`, or `workOutMutations` for several mutations in one transaction ([part 11](../configs-guide/11-transactions.md#step-3-several-standard-mutations-in-one-transaction-workoutmutations)). Called this way they publish no subscription events ([part 6, step 8](06-subscriptions-local.md#step-8-a-manually-created-mutation-publishes-only-if-told-to)). |
| **Selected fields** | the 4th argument of a library resolver: the real `info`, when the selection of the client applies to the result (as in `updateCountry` above: the field returns `Country`), or `createInfoEssence({ projection: { field: 1 } })`, when the resolver needs certain fields for its own logic. |
| **Filters** | the 5th argument, `{ involvedFilters: { inputOutputFilterAndLimit } }`, is applied as given: `[[]]` means "no restriction", `null` "no access", `[[filter1, filter2]]` leaves the entities that match `filter1` **or** `filter2` (filters are written like `where`, with Mongo ids), `[filters, limit]` also caps the number of returned entities 📖. Nobody computes it for you (see "Authorization" below). |
| **Ids out** | Library resolvers return Mongo ids. Before returning an **entity** (a type generated from an entity config), run it through `transformAfter(args, item, entityConfig, generalConfig)`; for a list, map it over the items. A plain object of your own type (`Stats`) is returned as it is. |

What happens without `transformAfter` ✅:

- `id` reaches the client as a Mongo id (`6abc…`), not the global id the generated queries return for the same entity: Relay treats it as a different record, and `node(id)` / `whereOne: { id }` do not accept it;
- the link fields of the returned entity fail: `{ RawCountry { cities { name } } }` throws `Field "undefined" not found in "City" entity in filter`.

The arguments of `transformAfter`:

- `args`: the value of `args.token` is stored in the returned entity (`_token`) and passed to the resolvers of its link fields, which authorize nested data with it. Pass `{ token }` if your authorization uses the `token` argument, `{}` if it reads the user from the context (cookies) only;
- `entityConfig`: the config of the returned type;
- `generalConfig`: `null` for an entity of `allEntityConfigs`; the general config for a config of a representation (`composeRepresentationConfigByName`), so that the global ids carry the representation key ([resolver-decorators.md](../resolver-decorators.md#4-transformafter-results)).

### Authorization

A manually created resolver is **public** until it checks the caller itself, whatever `getUserAttributes`, `inventoryByRoles` and `filters` say in the server-side config: those are applied only to the generated and custom actions ([part 10 of the guide to the configs](../configs-guide/10-authorization.md)) 📖. Decide for every field explicitly:

- **public**: no check;
- **signed in / a certain role**: get the user the same way the library does, `await serversideConfig.getUserAttributes(context, token)`, and return `null` or throw for the wrong `roles`;
- **the same data restrictions as the generated actions**: compose the filter of the user for the entity and pass it as `inputOutputFilterAndLimit` instead of `[[]]`. If the field is an action on an entity after all, a custom action gives this for free.

`[[]]` in `resolverOptions` is "full access": write it only below the check, or in a field that is public by design.

### Adding a field: the procedure

1. Add the field, and the types it needs, to `manuallyCreatedTypeDefs`. Reuse generated types instead of redeclaring them.
2. Write the composer and register it in `Query/index.ts` or `Mutation/index.ts` under the name of the field.
3. Decide who may call it and check that in the resolver.
4. Decode global ids of the arguments; return entities through `transformAfter`.
5. `yarn schema && yarn relay`: the field is in `src/schema.graphql`, and the components can use it in their `graphql` tags like any generated field ([part 4](04-relay.md), step 5).

### Checklist

- [ ] the field name in the SDL equals the key of the composer and does not collide with a generated name;
- [ ] everything independent of a request is prepared in the outer function of the composer;
- [ ] database work goes through the resolvers of the library, with `involvedFilters` passed explicitly;
- [ ] ids of arguments decoded with `fromGlobalId`, returned entities passed through `transformAfter`;
- [ ] the access is checked in the resolver itself;
- [ ] a virtual entity used only here is listed in `manualyUsedEntities`.

---

[← Part 4](04-relay.md) · [Contents](README.md) · [Part 6 →](06-subscriptions-local.md)
