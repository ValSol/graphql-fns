## Part 6. Subscriptions: a local setup

The goal of this part: two tabs of a browser on your machine show the same list, and a change made in one of them (or by any other client) appears in the other without a reload ✅. Everything runs in one process of `next dev`: no Redis, no separate WebSocket server. What the library generates for subscriptions, how to filter them and who receives them is the subject of [part 9 of the guide to the configs](../configs-guide/09-subscriptions.md); here is the plumbing around it.

```
tab A   useMutation ─── POST /graphql ──────────► Yoga ─► updateCountry / growCountry / …
                                                                   │ after the write
                                                                   ▼
                                             pubsub.publish("updated-Country", …)
                                                                   │ in memory, the same process
                                                                   ▼
tab B   useSubscription ◄── GET /graphql/stream ◄── Yoga ◄── pubsub.subscribe("updated-Country")
        (one SSE stream per tab)
```

New and changed files:

```
src/
  data/
    graphql-fns.general.config.ts             changed: subscriptions are no longer excluded
    pubsub.ts                                 new
    yoga.ts                                   changed: "pubsub" in the context, the SSE plugin
    manuallyCreatedResolverComposers/
      Mutation/growCountry.ts                 changed: publishes "updatedCountry"
  relay/
    environment.ts                            changed: subscriptions in the network layer
  app/
    graphql/stream/route.ts                   new
  components/
    Countries.tsx                             changed: three subscriptions
```

Verified with graphql-sse 2.6 and @graphql-yoga/plugin-graphql-sse 3.24, the rest as in the [contents](README.md).

### Step 1. Packages

```bash
yarn add graphql-sse @graphql-yoga/plugin-graphql-sse
```

| Package | Why |
|---|---|
| `graphql-sse` | the client of the browser: the subscriptions of Relay go through it (step 6) |
| `@graphql-yoga/plugin-graphql-sse` | the server side of the "single connection mode" of GraphQL over SSE (step 4) |

`@graphql-yoga/subscription` (`createPubSub`) is already installed as a peer dependency of `graphql-fns` ([part 1](01-packages-and-scripts.md)).

The transport is Server-Sent Events, not WebSockets: an SSE stream is an ordinary HTTP response, so a route handler of Next.js serves it as it serves `POST /graphql`, while a WebSocket needs an upgrade of the connection that route handlers do not support.

### Step 2. Turn the subscriptions on

```ts
// src/data/graphql-fns.general.config.ts
const generalConfig: GeneralConfig = {
  allEntityConfigs: composeAllEntityConfigs(entityConfigs),
  inventory: { name: 'main' }, // was: { name: 'main', exclude: { Subscription: true } }
};
```

`yarn schema && yarn relay`: `src/schema.graphql` gets `type Subscription` with `createdCountry`, `updatedCountry`, `deletedCountry` and the same three for `City` ✅.

From now on every GraphQL call needs `pubsub` in its context, not only the subscriptions: the publishing mutations check it before they write ([part 9 of the guide to the configs, step 3](../configs-guide/09-subscriptions.md#step-3-the-context-pubsub)).

### Step 3. One PubSub per process

```ts
// src/data/pubsub.ts
import { createPubSub } from '@graphql-yoga/subscription';
import type { PubSub } from '@graphql-yoga/subscription';

type GraphqlFnsPubSub = PubSub<Record<string, [payload: Record<string, unknown>]>>;

// kept on "globalThis" for the same reason as the MongoDB connection: Next.js bundles routes and
// Server Components separately, and an event must reach the subscribers whatever bundle published it
const store = globalThis as { __pubsub?: GraphqlFnsPubSub };

const pubsub = (store.__pubsub ??= createPubSub());

export default pubsub;
```

The library exports a ready `pubsub`, but it is a module-level variable of the library, and Next.js may put several copies of the library into the server bundles ([part 3, step 1](03-server.md#step-1-the-mongodb-connection)). A publisher and a subscriber that use different copies never meet ✅: in a production build a `createCountry` executed by a Server Component (through `yoga.fetch`, as `serverNetworkFetch` does) was **not** delivered to an open subscription, while the same mutation through `POST /graphql` was. With the PubSub on `globalThis` both are delivered ✅.

### Step 4. The server

```ts
// src/data/yoga.ts
import 'server-only';

import type { Connection } from 'mongoose';
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { createSchema, createYoga } from 'graphql-yoga';

import mongooseConnection from './mongooseConnection';
import pubsub from './pubsub';
import { resolvers, typeDefs } from './typeDefsAndResolvers';

const yoga = createYoga({
  schema: createSchema<{ mongooseConn: Connection; pubsub: typeof pubsub }>({ typeDefs, resolvers }),

  graphqlEndpoint: '/graphql',

  fetchAPI: { Response },

  graphiql: process.env.NODE_ENV !== 'production',

  // serves the "single connection mode" of GraphQL over SSE at "/graphql/stream"
  plugins: [useGraphQLSSE()],

  context: async () => ({ mongooseConn: await mongooseConnection(), pubsub }),
});

export default yoga;
```

```ts
// src/app/graphql/stream/route.ts
import yoga from '@/data/yoga';

const handler = (request: Request) => yoga.handleRequest(request, {});

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
```

- `pubsub` goes into the type parameter of `createSchema` too: without it `tsc` reports that the context returned by `context` does not match the context of the schema (`Property 'pubsub' is missing …`) ✅.
- The plugin answers the requests to the path `/graphql/stream` (its default `endpoint`); the second route handler is that path. The client uses all four methods (step 6), so the route exports all four.

Yoga has now **two** transports for subscriptions:

| Mode | Endpoint | Streams per subscriber | Used by |
|---|---|---|---|
| distinct connections, built into Yoga | `/graphql` with `Accept: text/event-stream` | one per subscription | `curl`, GraphiQL (step 5) |
| single connection, the plugin | `/graphql/stream` | one per browser tab, whatever the number of subscriptions | the application (step 6) |

Why the application needs the second one ✅: a browser opens at most 6 HTTP/1.1 connections to one host, **shared by all tabs**, and `next dev` / `next start` speak HTTP/1.1. A page with three subscriptions in the distinct mode holds three connections for good; with two such tabs open, the `POST /graphql` of a mutation waited in the queue of the browser and got no response in 15 seconds. With one stream per tab the same mutation took about 200 ms.

The distinct mode alone (`createClient({ url: '/graphql' })` in step 6, without the plugin and the second route) is enough while all open tabs of the origin together hold fewer than 6 streams and leave a connection for queries and mutations: one tab with three subscriptions works ✅, two such tabs already do not. Use it for a page with a single subscription that is rarely open in several tabs; otherwise use the single connection mode.

### Step 5. Check the server with `curl`

Before the client exists, subscribe from a terminal through the distinct mode:

```bash
curl -N http://localhost:3000/graphql \
  -H 'Accept: text/event-stream' -H 'Content-Type: application/json' \
  -d '{"query":"subscription { updatedCountry { node { code population } previousNode { population } updatedFields } }"}'
```

and run `updateCountry(whereOne: { code: "UA" }, data: { population: 5 }) { population }` in GraphiQL. The stream prints ✅:

```
:

event: next
data: {"data":{"updatedCountry":{"previousNode":{"population":41000000},"updatedFields":["population"],"node":{"code":"UA","population":5}}}}

:
```

`:` is a ping, sent at the start and every 12 seconds. GraphiQL (`http://localhost:3000/graphql`) uses the same transport for subscriptions 📖.

### Step 6. The client: subscriptions in the network layer

```ts
// src/relay/environment.ts (the parts that change)
import { createClient } from 'graphql-sse';
import type { Client } from 'graphql-sse';
import { Environment, Network, Observable, QueryResponseCache, RecordSource, Store } from 'relay-runtime';
import type {
  FetchFunction,
  GraphQLResponse,
  RequestParameters,
  SubscribeFunction,
  Variables,
} from 'relay-runtime';

// … IS_SERVER, CACHE_TTL, networkFetch as in part 4

// one client, so one event stream, per browser tab; created on the first subscription
let sseClient: Client<true> | undefined;

const subscribe: SubscribeFunction = (request, variables) =>
  Observable.create<GraphQLResponse>((sink) => {
    const client = (sseClient ??= createClient({ url: '/graphql/stream', singleConnection: true }));

    return client.subscribe<GraphQLResponse>(
      { operationName: request.name, query: request.text!, variables },
      {
        next: (value) => sink.next(value as GraphQLResponse),
        error: (error) => sink.error(error instanceof Error ? error : new Error(String(error))),
        complete: () => sink.complete(),
      },
    );
  });

// … responseCaches, getResponseCache

function createEnvironment() {
  // … responseCache, fetchResponse as in part 4

  const environment = new Environment({
    network: Network.create(fetchResponse, subscribe), // was: Network.create(fetchResponse)
    store: new Store(RecordSource.create()),
    isServer: IS_SERVER,
  });

  // …
}
```

- `client.subscribe` returns the function that stops the subscription; Relay calls it when the component unmounts.
- The client is created on the first subscription. `useSubscription` subscribes in an effect, which does not run during the server render, so the server never opens a stream 📖.
- `singleConnection: true` makes the requests of step 4 ✅: on the first subscription `PUT /graphql/stream` reserves a stream, `GET /graphql/stream` opens it (it stays pending in the Network panel), then every subscription is a short `POST /graphql/stream`. A stopped subscription is a `DELETE` 📖. Mutations and queries still go to `POST /graphql`.
- The requests are same-origin `fetch`es, so they carry the cookies of the page, and `getUserAttributes(context)` sees the user of a subscription as it does for a query 📖.

### Step 7. Subscriptions in a component

Relay applies a subscription payload to its store like a mutation response. Updated entities need nothing else; new and deleted ones have to be put into or taken out of a list, which needs the list to be a `@connection`:

```tsx
// src/components/Countries.tsx (the parts that change)
import { useMemo } from 'react';
import {
  graphql,
  useMutation,
  usePreloadedQuery,
  useRelayEnvironment,
  useSubscription,
} from 'react-relay';

import type { CountriesCreatedSubscription } from '@/__generated__/CountriesCreatedSubscription.graphql';
import type { CountriesDeletedSubscription } from '@/__generated__/CountriesDeletedSubscription.graphql';
import type { CountriesUpdatedSubscription } from '@/__generated__/CountriesUpdatedSubscription.graphql';
// … the other imports as in part 4

const query = graphql`
  query CountriesQuery($first: Int!) {
    Stats {
      countries
      cities
    }
    CountriesThroughConnection(first: $first, sort: { sortBy: [population_DESC] })
      @connection(key: "Countries_CountriesThroughConnection") {
      __id
      edges {
        node {
          id
          code
          name
          population
          cities {
            id
            name
          }
        }
      }
    }
  }
`;

// a changed country is found in the store by its global "id" and updated in place
const updatedSubscription = graphql`
  subscription CountriesUpdatedSubscription {
    updatedCountry {
      node {
        id
        code
        name
        population
      }
    }
  }
`;

// a new country is appended to the connection of the query
const createdSubscription = graphql`
  subscription CountriesCreatedSubscription($connections: [ID!]!) {
    createdCountry {
      node @appendNode(connections: $connections, edgeTypeName: "CountryEdge") {
        id
        code
        name
        population
        cities {
          id
          name
        }
      }
    }
  }
`;

// a deleted country is removed from the connection of the query
const deletedSubscription = graphql`
  subscription CountriesDeletedSubscription($connections: [ID!]!) {
    deletedCountry {
      node {
        id @deleteEdge(connections: $connections)
      }
    }
  }
`;

export default function Countries({ preloadedQuery }: Props) {
  // … queryRef, usePreloadedQuery, useMutation as in part 4

  const connectionId = CountriesThroughConnection.__id;

  // the configs must keep their identity between renders, otherwise Relay resubscribes
  useSubscription<CountriesUpdatedSubscription>(
    useMemo(() => ({ subscription: updatedSubscription, variables: {} }), []),
  );
  useSubscription<CountriesCreatedSubscription>(
    useMemo(
      () => ({ subscription: createdSubscription, variables: { connections: [connectionId] } }),
      [connectionId],
    ),
  );
  useSubscription<CountriesDeletedSubscription>(
    useMemo(
      () => ({ subscription: deletedSubscription, variables: { connections: [connectionId] } }),
      [connectionId],
    ),
  );

  // … the same JSX as in part 4
}
```

| Event | What updates the store |
|---|---|
| `updatedCountry` | the global `id` of `node`: Relay merges the selected fields into the record it already has ✅ |
| `createdCountry` | `@appendNode` creates an edge of type `CountryEdge` (the name from `src/schema.graphql`) in the connection given by `__id` ✅ |
| `deletedCountry` | `@deleteEdge` removes the edge from that connection ✅ |

- `@connection` on a field of a query that is not paginated is allowed; `__id` gives the id of the connection record that `@appendNode` / `@deleteEdge` need. The `first` / `after` / `pageInfo` the directive requires are all in the generated `…ThroughConnection` ([part 2, step 4](02-schema.md#step-4-what-relay-finds-in-the-generated-schema)).
- Not `@deleteRecord` for the deletion ✅: it removes the record from the store but leaves its edge in the connection, with `node: null`, and the render fails with `Cannot read properties of null (reading 'id')`.
- `node` and `previousNode` of `updatedCountry` are nullable: with `wherePayload` or restrictions of the user, a country that enters or leaves the filtered set comes with the other state as `null` ([part 9 of the guide to the configs, step 4](../configs-guide/09-subscriptions.md#step-4-filters-wherepayload-and-whichupdated)). Here neither is used, so both states always come; a list with such filters is kept in sync by an `updater` ([part 7, step 7](07-subscriptions-production.md#step-7-who-receives-an-event-a-support-chat)).
- A subscriber receives its own changes too: tab A gets the `updatedCountry` of its own `+1000`. That is harmless, the data is the same as in the mutation response.
- What stays stale: `Stats` (it is not an entity, no event updates it); the order of the list (Relay does not re-sort a connection: a grown country keeps its place, a new one is appended at the end); the cities (there is no subscription to `City` events here). Refetch the query when that matters.
- Only `createX`, `updateX`, `deleteX` publish events; bulk mutations do not ([part 9 of the guide to the configs, step 2](../configs-guide/09-subscriptions.md#step-2-which-mutations-publish)).

### Step 8. A manually created mutation publishes only if told to

With steps 1–7 the button `+1000` updated tab A (from the mutation response) but **not** tab B ✅: `growCountry` of [part 5](05-manually-created.md) calls the update resolver of the library directly, and a direct call does not publish. `withSubscriptionReport` makes it publish as the generated `updateCountry` does:

```ts
// src/data/manuallyCreatedResolverComposers/Mutation/growCountry.ts (the parts that change)
import {
  composeQueryResolver,
  createInfoEssence,
  createUpdateEntityMutationResolver,
  fromGlobalId,
  transformAfter,
  withSubscriptionReport,
} from 'graphql-fns';
import type {
  ActionResolver,
  GeneralConfig,
  ServersideConfig,
  TangibleEntityConfig,
} from 'graphql-fns';

// … resolverOptions as in part 5

const growCountry = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): ActionResolver => {
  const Country = generalConfig.allEntityConfigs.Country as TangibleEntityConfig;

  // … getCountry as in part 5

  // publishes "updatedCountry" as the generated "updateCountry" does
  const updateCountry = withSubscriptionReport(
    createUpdateEntityMutationResolver(Country, generalConfig, serversideConfig, true)!,
    'updated',
    Country,
    generalConfig,
  );

  // … the resolver as in part 5: "updateCountry(null, { whereOne, data }, context, info, resolverOptions)"
};
```

`withSubscriptionReport(resolver, kind, entityConfig, generalConfig)` wraps a raw `create…` / `update…` / `delete…` mutation resolver; `kind` is `'created'`, `'updated'` or `'deleted'`. The wrapped resolver is called as before, with the `info` of the client. It repeats what the decorators of a generated mutation do ([resolver-decorators.md](../resolver-decorators.md)):

1. **`subscriptionEntityNames`** in the 5th argument switches the publishing on (`{ subscriptionUpdatedEntityName: 'Country' }` here). It is added only if the subscription is allowed by `inventory`, as for the generated mutations ([inventory.md](../inventory.md), IN14); otherwise nothing is published and no `pubsub` is required 📖.
2. **All fields in the 4th argument** for `'updated'` and `'deleted'`. The entity is read with the projection of `info`; with the `info` of the client only the selected fields would be read, and the event would be wrong ✅: `updatedFields: ["code", "name", "population"]` instead of `["population"]`. The helper reads all fields and keeps the selection of the client for the result: the mutation still returns what the client asked for ✅.

After this `+1000` in tab A reaches tab B, with complete `previousNode` / `node` and `updatedFields: ["population"]` ✅.

For a chain of mutations in `workOutMutations` ([part 11 of the guide to the configs](../configs-guide/11-transactions.md#step-3-several-standard-mutations-in-one-transaction-workoutmutations)) the same two arguments come from `composeSubscriptionReportArgs`, together with `returnReport: true` ✅:

```ts
await workOutMutations(
  [
    {
      actionGeneralName: 'updateEntity',
      entityConfig: Country,
      args: { whereOne: { id }, data: { population } },
      ...composeSubscriptionReportArgs('updated', Country, generalConfig, info, resolverOptions), // info & resolverOptions
      returnResult: true,
      returnReport: true,
    },
  ],
  { generalConfig, serversideConfig, context },
);
```

### Step 9. Check

```bash
yarn dev
```

Open `http://localhost:3000` in two tabs of the same browser and run the mutations in GraphiQL or with `curl` ✅:

| Action | Result in the other tab |
|---|---|
| `+1000` in tab A | the population of the country changes |
| `createCountry` | the country is appended to the list in both tabs |
| `updateCountry(… data: { name: "Deutschland" })` | the name changes |
| `deleteCountry` | the row disappears |

The Network panel of a tab shows `PUT`, `GET` (pending: the stream) and three `POST` to `/graphql/stream`, then only `POST /graphql` for the mutations. The same scenario passes after `yarn build && yarn start`, and in `next dev` after an edit of a server module (the open streams keep receiving the events) ✅.

### What this setup does not cover

- **One process.** The PubSub is in the memory of the process, and so are the streams reserved by the single connection mode: `PUT`, `GET` and `POST` of a tab have to reach the same process 📖. Several instances of the server, `node` cluster or a serverless platform need a shared PubSub ([part 9 of the guide to the configs, step 3](../configs-guide/09-subscriptions.md#step-3-the-context-pubsub)) and a transport whose requests reach the process that holds the stream.
- **HTTP/1.1.** One stream per tab still counts against the 6 connections of the browser; with many tabs of the same origin open they can exhaust them 📖. HTTP/2 (usual behind a production reverse proxy) multiplexes the requests over one connection and lifts the limit.
- **Authorization.** Without `inventoryByRoles` / `subscribePayloadFilters` every subscriber gets every event ([part 10 of the guide to the configs](../configs-guide/10-authorization.md)).

All three are the subject of [part 7](07-subscriptions-production.md).

### Checklist

- [ ] `exclude: { Subscription: true }` removed, `yarn schema && yarn relay` run;
- [ ] one PubSub per process, on `globalThis`, in the context of every call and in the type parameter of `createSchema`;
- [ ] `useGraphQLSSE()` in the plugins of Yoga, `src/app/graphql/stream/route.ts` exports `GET`, `POST`, `PUT`, `DELETE`;
- [ ] the network layer of Relay gets a `subscribe` function backed by one `graphql-sse` client with `singleConnection: true`;
- [ ] lists that must react to created and deleted entities are `@connection`s, updated by `@appendNode` / `@deleteEdge` with the `__id` of the connection;
- [ ] manually created mutations that should notify subscribers wrap the resolvers of the library in `withSubscriptionReport` (`composeSubscriptionReportArgs` + `returnReport: true` in `workOutMutations`).

---

[← Part 5](05-manually-created.md) · [Contents](README.md) · [Part 7 →](07-subscriptions-production.md)
