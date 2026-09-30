## Part 2. From the configs to `schema.graphql`

### Step 1. The two configs

The smallest pair that gives something to show: two entities with a link, no subscriptions ([why](../configs-guide/01-plain-arrays.md#step-5-build-the-schema-and-the-server)).

```ts
// src/data/graphql-fns.general.config.ts
import { composeAllEntityConfigs } from 'graphql-fns';
import type { GeneralConfig, SimplifiedEntityConfig } from 'graphql-fns';

const entityConfigs: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    textFields: [
      { name: 'code', unique: true, required: true },
      { name: 'name', required: true, index: true },
    ],
    intFields: [{ name: 'population', index: true }],
  },
  {
    name: 'City',
    textFields: [{ name: 'name', required: true, index: true }],
    relationalFields: [
      { name: 'country', configName: 'Country', oppositeName: 'cities', index: true },
    ],
  },
];

const generalConfig: GeneralConfig = {
  allEntityConfigs: composeAllEntityConfigs(entityConfigs),
  inventory: { name: 'main', exclude: { Subscription: true } },
};

export default generalConfig;
```

```ts
// src/data/graphql-fns.serverSide.config.ts
import type { ServersideConfig } from 'graphql-fns';

const serversideConfig: ServersideConfig = {};

export default serversideConfig;
```

Where the two files may be imported:

| File | May be imported by | Must not import |
|---|---|---|
| `graphql-fns.general.config.ts` | server code, client components, scripts | anything server-only (the database, secrets, `server-only`) |
| `graphql-fns.serverSide.config.ts` | server code, scripts | `server-only`, `next/*` (see step 3) |

### Step 2. `typeDefsAndResolvers.ts`: one place where the schema is assembled

```ts
// src/data/typeDefsAndResolvers.ts
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { composeManuallyCreatedResolvers, composeTypeDefsAndResolvers } from 'graphql-fns';

import generalConfig from './graphql-fns.general.config';
import serversideConfig from './graphql-fns.serverSide.config';
import manuallyCreatedResolverComposers from './manuallyCreatedResolverComposers';
import manuallyCreatedTypeDefs from './manuallyCreatedTypeDefs';

const { typeDefs: generatedTypeDefs, resolvers: generatedResolvers } = composeTypeDefsAndResolvers(
  generalConfig,
  serversideConfig,
);

const manuallyCreatedResolvers = composeManuallyCreatedResolvers(
  manuallyCreatedResolverComposers,
  generalConfig,
  serversideConfig,
);

export const typeDefs = mergeTypeDefs([manuallyCreatedTypeDefs, generatedTypeDefs]);
export const resolvers = mergeResolvers([manuallyCreatedResolvers, generatedResolvers]);
```

- `composeTypeDefsAndResolvers` returns the generated `typeDefs` (a string of SDL) and `resolvers` (an object `{ DateTime, Node, Query, Mutation, Country, City, … }`).
- The manually created part is described in [part 5](05-manually-created.md). A project that has none (yet) exports the generated pair as it is:

  ```ts
  export const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);
  ```

- `mergeTypeDefs` merges the two `type Query { … }` (and `type Mutation { … }`) into one and returns a `DocumentNode`; `mergeResolvers` merges the resolver objects key by key ✅.
- Both the server ([part 3](03-server.md)) and the schema script (step 3) import this module, so they cannot disagree.

### Step 3. `schemaComposer.ts`: the schema as a file

Relay compiles the operations of the client against a schema file, so the schema is printed into one:

```ts
// src/schemaComposer.ts
import { writeFileSync } from 'node:fs';
import { print } from 'graphql';

import { typeDefs } from './data/typeDefsAndResolvers';

writeFileSync('src/schema.graphql', print(typeDefs));
```

`yarn schema` (`tsx src/schemaComposer.ts`) writes about 400 lines of SDL for the two entities ✅. Without the manually created part `typeDefs` is already a string: `writeFileSync('src/schema.graphql', typeDefs)`.

The script runs in plain Node.js, outside Next.js, and executes everything `typeDefsAndResolvers.ts` imports: the configs, the resolvers of custom actions, the callbacks of calculated fields, the resolver composers. Hence the rules for those modules:

- no `import 'server-only'`: outside Next.js that package throws on import ✅. Put it into the modules only the server imports (`yoga.ts`, `src/relay/serverNetworkFetch.ts`);
- no `next/headers`, `next/cache` and the like at the top level of a module;
- nothing that needs the database or an environment variable **at import time**. Connect and read variables inside functions: that is why `mongooseConnection.ts` ([part 3](03-server.md)) checks `MONGODB_URI` when it is called, not when it is imported, and `yarn schema` needs neither `.env.local` nor a running MongoDB ✅.

An error in a config (a wrong field name, an unknown `configName`, a colliding action name, …) is thrown by `composeAllEntityConfigs` / `composeTypeDefsAndResolvers`, i.e. `yarn schema` fails with it before the application starts.

### Step 4. What Relay finds in the generated schema

```graphql
interface Node {
  id: ID!
}

type Country implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  code: String!
  name: String!
  population: Int
  cities(where: CityWhereInput, sort: CitySortInput, pagination: PaginationInput): [City!]!
  citiesThroughConnection(where: CityWhereInput, sort: CitySortInput, after: String, before: String, first: Int, last: Int): CityConnection!
  citiesCount(where: CityWhereInput): Int!
  citiesDistinctValues(where: CityWhereInput, options: CityDistinctValuesOptionsInput!): [String!]!
}

type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

type Query {
  node(id: ID!): Node
  Country(whereOne: CountryWhereOneInput!, token: String): Country
  Countries(where: CountryWhereInput, sort: CountrySortInput, pagination: PaginationInput, token: String): [Country!]!
  CountriesThroughConnection(where: CountryWhereInput, sort: CountrySortInput, after: String, before: String, first: Int, last: Int, token: String): CountryConnection!
  # …
}
```

The schema follows the conventions Relay builds on ✅:

- every tangible entity implements `Node`, and its `id` is a **global id**: `base64("<mongo id>:<entity name>:<representation key>")` ([resolver-decorators.md](../resolver-decorators.md#2-global-ids)). Relay normalizes its store by this `id`, so an entity returned by a mutation updates every place that shows it (part 4, step 6);
- `node(id: ID!)` returns any entity by its global id ✅ (what `@refetchable` fragments use);
- `…ThroughConnection` queries and fields take `first` / `after` / `last` / `before` and return `edges { cursor node }` + `pageInfo`, the shape `@connection` and `usePaginationFragment` expect.

### Checklist

- [ ] the general config imports nothing server-side; the server-side config and everything it imports can be loaded by a plain Node.js script;
- [ ] the schema is assembled in one module, imported by both the server and the schema script;
- [ ] `yarn schema` after every change of a config or of the manually created type definitions, then `yarn relay`.

---

[← Part 1](01-packages-and-scripts.md) · [Contents](README.md) · [Part 3 →](03-server.md)
