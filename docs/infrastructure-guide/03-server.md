## Part 3. The server

### Step 1. The MongoDB connection

```ts
// src/data/mongooseConnection.ts
import mongoose from 'mongoose';
import type { Connection } from 'mongoose';

const { MONGODB_URI } = process.env;

// kept on "globalThis": Next.js bundles "instrumentation.ts" and every route separately,
// so a module-level variable would give each bundle its own connection
const store = globalThis as { __mongooseConnection?: Promise<Connection> };

const mongooseConnection = (): Promise<Connection> => {
  if (!MONGODB_URI) {
    throw new Error('Define the MONGODB_URI environment variable in ".env.local"!');
  }

  store.__mongooseConnection ??= mongoose.createConnection(MONGODB_URI).asPromise();

  return store.__mongooseConnection;
};

export default mongooseConnection;
```

- One connection per process. The **promise** is stored, so concurrent first calls wait for the same connection instead of opening several.
- `globalThis` instead of a module variable: a bundler may put a copy of a module into every server chunk. The library keeps its own cache of synced indexes on `globalThis` for the same reason, keyed by the connection object ([mongoose-models.md](../mongoose-models.md), MM7), so one shared connection also means "indexes are synced once" ✅. It also survives the hot reload of the dev server.
- `createConnection`, not `mongoose.connect`: the library registers its models on the connection it is given ([mongoose-models.md](../mongoose-models.md), MM5), the default connection of `mongoose` stays free.

### Step 2. The Yoga instance

```ts
// src/data/yoga.ts
import 'server-only';

import type { Connection } from 'mongoose';
import { createSchema, createYoga } from 'graphql-yoga';

import mongooseConnection from './mongooseConnection';
import { resolvers, typeDefs } from './typeDefsAndResolvers';

const yoga = createYoga({
  schema: createSchema<{ mongooseConn: Connection }>({ typeDefs, resolvers }),

  // the path of "src/app/graphql/route.ts"
  graphqlEndpoint: '/graphql',

  // Yoga has to create the responses Next.js expects
  fetchAPI: { Response },

  graphiql: process.env.NODE_ENV !== 'production',

  // graphql-fns resolvers take the connection from "context.mongooseConn"
  context: async () => ({ mongooseConn: await mongooseConnection() }),
});

export default yoga;
```

**The context** is the contract between the server and the library:

| Key | Needed |
|---|---|
| `mongooseConn` | always: every generated resolver reads the connection from `context.mongooseConn` ✅ |
| `pubsub` | when the schema has subscriptions, in the context of **every** call ([part 9 of the guide to the configs](../configs-guide/09-subscriptions.md#step-3-the-context-pubsub)); not needed with `exclude: { Subscription: true }` ✅ |
| anything else | for your own code: Yoga adds `request` (the `Request` with its headers and cookies) and `params`; the whole context is passed to `getUserAttributes(context, token)`, to the callbacks of calculated fields, to the resolvers of custom actions and to the manually created resolvers |

Other settings:

- `graphqlEndpoint` must be the path of the route (step 3): Yoga answers only requests to it.
- `graphiql`: in development `http://localhost:3000/graphql` opens GraphiQL, handy to load the first data with `createManyCountries` ✅.
- In a production build Yoga masks the messages of errors thrown by resolvers (the client gets `Unexpected error.`, the original error goes to the server log) ✅. It concerns the library's own errors too (validation, unique indexes, …). To show a message to the client, throw a `GraphQLError` from your code or configure `maskedErrors` of Yoga.

### Step 3. The route handler

```ts
// src/app/graphql/route.ts
import yoga from '@/data/yoga';

export const GET = (request: Request) => yoga.handleRequest(request, {});
export const POST = (request: Request) => yoga.handleRequest(request, {});
```

That is the whole HTTP layer ✅: `POST /graphql` for the operations of the browser, `GET /graphql` for GraphiQL. The second argument of `handleRequest` is a server context merged into the GraphQL context.

### Step 4. Collections and indexes on the start

```ts
// src/instrumentation.ts
// Next.js calls "register" once, when a server instance starts and before it handles requests
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { initMongooseModels } = await import('graphql-fns');
  const { default: generalConfig } = await import('@/data/graphql-fns.general.config');
  const { default: mongooseConnection } = await import('@/data/mongooseConnection');

  await initMongooseModels(await mongooseConnection(), generalConfig);
}
```

`initMongooseModels` creates the collection of every tangible entity and brings its indexes in line with the config: creates the missing ones, drops the ones that are no longer in the config ([mongoose-models.md](../mongoose-models.md), MM12, MM13). On an empty database the example gets ✅:

```
city_things:    _id_, name_1, country_1, createdAt_1, updatedAt_1
country_things: _id_, code_1, name_1, population_1, createdAt_1, updatedAt_1
```

- Without this file nothing breaks: the library syncs a model lazily, the first time a resolver needs it. The start-up call only moves that work (and its possible failure, e.g. a unique index over existing duplicates) from the first requests of users to the start of the server.
- The dynamic `import()`s and the `NEXT_RUNTIME` check keep Mongoose out of the Edge bundle of the instrumentation file.
- Collections that are not in the config are never touched, so the database can be shared with other libraries.

### Step 5. Check

```bash
yarn dev
```

In GraphiQL (`http://localhost:3000/graphql`) ✅:

```graphql
mutation {
  createManyCountries(data: [
    { code: "UA", name: "Ukraine", population: 41000000 }
    { code: "PL", name: "Poland", population: 37600000 }
  ]) { id code }
}

mutation ($ua: ID!) {
  createManyCities(data: [
    { name: "Kyiv", country: { connect: $ua } }
    { name: "Lviv", country: { connect: $ua } }
  ]) { id name country { code } }
}

{ Countries(sort: { sortBy: [population_DESC] }) { code population cities { name } } }
```

`$ua` is the `id` of Ukraine returned by the first mutation (a global id).

### Checklist

- [ ] one connection per process, stored on `globalThis`, created with `createConnection`;
- [ ] `mongooseConn` (and `pubsub` if the schema has subscriptions) in the Yoga context;
- [ ] `graphqlEndpoint` equals the path of the route handler;
- [ ] `initMongooseModels` in `instrumentation.ts`, guarded by `NEXT_RUNTIME === 'nodejs'`.

---

[← Part 2](02-schema.md) · [Contents](README.md) · [Part 4 →](04-relay.md)
