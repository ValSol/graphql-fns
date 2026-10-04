# Setting up the infrastructure: Next.js + GraphQL Yoga + Relay

> How to wire `graphql-fns` into an application: from the two configs to a page that renders data. The example is a Next.js (App Router) project with GraphQL Yoga as the server and Relay as the client. All parts are listed in the [Contents](#contents).
> Describes graphql-fns 0.1.2-beta.1165.
> Marks: ✅ verified by running the example project of this guide (Next.js 16.3, graphql-yoga 5.24, react-relay / relay-compiler 21.0, graphql 17, mongoose 9.10, MongoDB 8.0; for subscriptions graphql-sse 2.6, @graphql-yoga/plugin-graphql-sse 3.24; in production @graphql-yoga/redis-event-target 3.0, ioredis 5.11, Redis 7.4, nginx 1.27); 📖 conclusion from reading the code only.

The guide is about the **plumbing** around the library. What to write inside the configs is the subject of the [guide to the configs](../configs-guide/README.md); here they stay as small as possible.

## The pipeline in one picture

```
src/data/graphql-fns.general.config.ts      src/data/graphql-fns.serverSide.config.ts
        │                                           │
        └──────────────┬────────────────────────────┘
                       ▼
     composeTypeDefsAndResolvers(generalConfig, serversideConfig)
                       │   → generated typeDefs + resolvers
src/data/manuallyCreatedTypeDefs.ts ────────────┤
src/data/manuallyCreatedResolverComposers/ ─────┤   composeManuallyCreatedResolvers(…)
                       ▼
        src/data/typeDefsAndResolvers.ts
        mergeTypeDefs / mergeResolvers (@graphql-tools/merge)
                       │
        ┌──────────────┴───────────────────────────┐
        ▼                                          ▼
src/data/yoga.ts (createYoga)             src/schemaComposer.ts ("yarn schema")
  ├─ src/app/graphql/route.ts               writes src/schema.graphql
  │    "/graphql" for the browser                  │
  └─ src/relay/serverNetworkFetch.ts               ▼
       in-process calls from               relay-compiler ("yarn relay")
       Server Components                    writes src/__generated__/
```

Two consequences:

1. `src/schema.graphql` and `src/__generated__/` are **outputs**. After a change of a config or of the manually created type definitions run `yarn schema`, then `yarn relay`.
2. One Yoga instance serves both the browser (through the route handler) and the Server Components (called in the same process), so both get the same schema, context and authorization.

## The files of the example

```
relay.config.json
next.config.ts
.env.local                                    MONGODB_URI; REDIS_URL (part 7)
nginx.conf                                    part 7, outside the application
src/
  schemaComposer.ts                           "yarn schema"
  instrumentation.ts                          syncs collections and indexes on the start
  schema.graphql                              generated
  __generated__/                              generated
  data/
    graphql-fns.general.config.ts
    graphql-fns.serverSide.config.ts
    manuallyCreatedTypeDefs.ts
    manuallyCreatedResolverComposers/
      index.ts
      Query/    index.ts  Stats.ts
      Mutation/ index.ts  growCountry.ts
    typeDefsAndResolvers.ts
    mongooseConnection.ts
    pubsub.ts                                 parts 6, 7
    yoga.ts
  relay/
    environment.ts
    serverNetworkFetch.ts
    loadSerializableQuery.ts
    serializablePreloadedQuery.ts
    useSerializablePreloadedQuery.ts
  app/
    graphql/route.ts
    graphql/stream/route.ts                   part 6
    layout.tsx
    Providers.tsx
    page.tsx
  components/
    Countries.tsx
```

## Contents

| Part | Topic | Files |
|---|---|---|
| [1](01-packages-and-scripts.md) | Packages, scripts, TypeScript and Git settings | `package.json`, `tsconfig.json`, `.gitignore`, `.env.local` |
| [2](02-schema.md) | From the configs to `schema.graphql` | `graphql-fns.*.config.ts`, `typeDefsAndResolvers.ts`, `schemaComposer.ts` |
| [3](03-server.md) | The server: MongoDB connection, Yoga, the route handler, the start of the application | `mongooseConnection.ts`, `yoga.ts`, `app/graphql/route.ts`, `instrumentation.ts` |
| [4](04-relay.md) | The client: Relay compiler and environment, preloading in Server Components, mutations | `relay.config.json`, `next.config.ts`, `src/relay/*`, `app/*`, `components/*` |
| [5](05-manually-created.md) | The hand-written part of the schema | `manuallyCreatedTypeDefs.ts`, `manuallyCreatedResolverComposers/` |
| [6](06-subscriptions-local.md) | Subscriptions in one process: a shared PubSub, GraphQL over SSE, subscriptions in Relay | `pubsub.ts`, `yoga.ts`, `app/graphql/stream/route.ts`, `relay/environment.ts`, `components/Countries.tsx` |
| [7](07-subscriptions-production.md) | Subscriptions in production: Redis PubSub, the transport behind a load balancer, nginx, reconnects, authorization of events, scale | `pubsub.ts`, `yoga.ts`, `relay/environment.ts`, `components/Countries.tsx`, `nginx.conf` |

Not covered: serverless deployment of subscriptions, authentication (an example: [better-auth-integration.md](../better-auth-integration.md)), caching of server-side requests.
