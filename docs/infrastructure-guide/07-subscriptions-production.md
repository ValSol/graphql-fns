## Part 7. Subscriptions in production

The goal of this part: the application of [part 6](06-subscriptions-local.md) runs as several server processes behind a reverse proxy, an event published by any of them reaches every subscriber it should reach, and a client that lost its stream reads again what it missed. Verified with two `next start` processes behind nginx with HTTP/2 and Redis ✅.

```
                                   ┌──► next start :3001 ──┐
browser ── HTTPS, HTTP/2 ──► nginx ┤   (Yoga, graphql-fns) ├──► MongoDB
  one HTTP/2 connection,           └──► next start :3002 ──┤
  one stream per subscription        (Yoga, graphql-fns)   │
                                                           ▼
                              pubsub.publish("updated-Country", …) ──► Redis ──► every process
                                                                                 that has subscribers
```

New and changed files:

```
.env.local                                    changed: REDIS_URL
src/
  data/
    pubsub.ts                                 changed: createPubSub over Redis
    yoga.ts                                   changed: "X-Accel-Buffering: no" for the event streams
  relay/
    environment.ts                            changed: the transport depends on the protocol; reconnect listeners
  components/
    Countries.tsx                             changed: reads the query again after a reconnect
nginx.conf                                    new: the reverse proxy (outside the application)
```

Verified with Redis 7.4, ioredis 5.11, @graphql-yoga/redis-event-target 3.0, nginx 1.27, Chrome 154, the rest as in [part 6](06-subscriptions-local.md) and the [contents](README.md).

**The version of the library.** This part needs graphql-fns **0.1.2-beta.1169 or later**. Earlier versions send no `updatedX` event about an entity that enters or leaves the scope of a subscriber (step 7), and versions before 0.1.2-beta.1167 also throw on a subscription of a role whose `subscribePayloadFilters` return `null` (step 7), never match `wherePayload` / `subscribePayloadFilters` by a relational field when the ids of the event are `ObjectId`s, never match them by a date when the payload went through JSON (step 2), keep a closed subscription subscribed to the PubSub until the next event of its channel (step 8), and reject filter functions in the type of `composeServersideConfig`.

### Step 1. Packages

```bash
yarn add @graphql-yoga/redis-event-target ioredis@^5
```

| Package | Why |
|---|---|
| `@graphql-yoga/redis-event-target` | an event target for `createPubSub` that publishes and receives the events through Redis |
| `ioredis` | the Redis client; `@graphql-yoga/redis-event-target` 3.0 asks for `ioredis@^5` as a peer dependency, a plain `yarn add ioredis` installs 6 |

### Step 2. A PubSub shared by the processes

The PubSub of part 6 lives in the memory of the process: an event published by a mutation on process A never reaches a subscriber on process B. Replace its event target with Redis, keeping the `globalThis` pattern:

```ts
// src/data/pubsub.ts
import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import { createPubSub } from '@graphql-yoga/subscription';
import type { PubSub } from '@graphql-yoga/subscription';
import { Redis } from 'ioredis';
import { mongo } from 'mongoose';

type GraphqlFnsPubSub = PubSub<Record<string, [payload: Record<string, unknown>]>>;

const { REDIS_URL } = process.env;

const createSharedPubSub = (): GraphqlFnsPubSub => {
  if (!REDIS_URL) {
    throw new Error('Define the REDIS_URL environment variable in ".env.local"!');
  }

  return createPubSub({
    // a connection in the subscriber mode cannot publish, hence two clients
    eventTarget: createRedisEventTarget({
      publishClient: new Redis(REDIS_URL),
      // without the ready check: a SUBSCRIBE sent while the client connects puts the connection into
      // the subscriber mode, the check (INFO) then fails, and the subscription is lost
      subscribeClient: new Redis(REDIS_URL, { enableReadyCheck: false }),
      // Extended JSON keeps the Dates and ObjectIds of the payload, plain JSON makes strings of them
      serializer: mongo.BSON.EJSON,
    }),
  });
};

// kept on "globalThis" as in part 6: one PubSub (and one pair of Redis connections) per process
const store = globalThis as { __pubsub?: GraphqlFnsPubSub };

const pubsub = (store.__pubsub ??= createSharedPubSub());

export default pubsub;
```

```bash
# .env.local
MONGODB_URI=mongodb://127.0.0.1:27017/my-app
REDIS_URL=redis://127.0.0.1:6379
```

`yoga.ts` does not change: it imports the same `pubsub` and puts it into the context of every call.

**The serializer.** The event target turns every payload into a string. The payload of graphql-fns is the entity as it was read from MongoDB, with `Date`s and `ObjectId`s ([calculated-fields.md](../calculated-fields.md) CF26). The default `JSON` turns them into strings. The filters of events accept both forms (relational ids are compared as strings, dates as `Date`s), so with either serializer the same events are delivered ✅:

| Subscription, event published on A, received on B | `JSON` (the default) | `mongo.BSON.EJSON` |
|---|---|---|
| `createdMessage(wherePayload: { createdAt_gt: "2020-01-01T00:00:00.000Z" })` | delivered | delivered |
| `updatedConversation(wherePayload: { updatedAt_gt: "2020-01-01T00:00:00.000Z" })` | delivered | delivered |
| `createdConversation(wherePayload: { client: $id })` | delivered | delivered |
| `createdMessage(wherePayload: { waiting: true })` (an async calculated field) | delivered | delivered |

EJSON (MongoDB Extended JSON, exported by `mongoose` as `mongo.BSON.EJSON`) writes `{"$date": …}` and `{"$oid": …}` and reads them back as a `Date` and an `ObjectId` ✅, so the payload on B is the same as on A. It matters for your code that reads the node on the subscriber's side, e.g. the `asyncFunc` of a calculated field computed for every subscriber ([calculated-fields.md](../calculated-fields.md) CF27): with `JSON` it would get strings where one process gives `Date`s and `ObjectId`s 📖.

**Check: an event from A reaches B.** Start two processes of the production build (`yarn build`, then `next start -p 3001` and `next start -p 3002`). Subscribe on B:

```bash
curl -N http://localhost:3002/graphql \
  -H 'Accept: text/event-stream' -H 'Content-Type: application/json' \
  -d '{"query":"subscription { updatedCountry { node { code population updatedAt } previousNode { population } updatedFields } }"}'
```

and update the country on A (`updateCountry(whereOne: { code: "UA" }, data: { population: 41000000 })` sent to `http://localhost:3001/graphql`). The stream on B prints ✅:

```
:

event: next
data: {"data":{"updatedCountry":{"node":{"code":"UA","population":41000000,"updatedAt":"2026-10-04T20:37:11.540Z"},"previousNode":{"population":43000000},"updatedFields":["population"]}}}
```

The calculated fields of the payload survive the round trip ✅: the async `participantIds` and `waiting` of the support chat (step 7) are computed by the publishing process and filter the events on the receiving one, with the same results as in one process.

- `enableReadyCheck: false` on the subscribing client is required ✅. ioredis writes `SUBSCRIBE` to the socket as soon as the TCP connection is open, before its own handshake: the command is allowed while Redis loads its data. When the first subscription of a fresh process arrives in that moment, the reply puts the connection into the subscriber mode, then the handshake (`CLIENT SETINFO`) and the ready check (`INFO`) are rejected: the process logs `[ioredis] Unhandled error event: Error: Connection in subscriber mode, only subscriber commands may be used`, the client recovers by reconnecting and the subscription is gone (`PUBSUB NUMSUB` → `0`), so its subscriber never receives anything. With `ioredis` alone: a `subscribe` on the `connect` event gives `NUMSUB 0` and that error by default, `NUMSUB 1` with `enableReadyCheck: false`. With the application it happened to the first subscription after `next start` now and then; with the option, 5 of 5 fresh starts delivered the events and logged no error. The ready check only waits for a Redis that is still loading its dataset, which a Pub/Sub connection does not need. `lazyConnect: true` is no remedy: the same error appeared with it.
- `yarn build` passes without a running Redis, but prints `[ioredis] Unhandled error event: Error: connect ECONNREFUSED` while it collects the page data ✅: the build imports the routes, and the clients try to connect. The messages are harmless.
- Several applications on one Redis share the channels (`updated-Country` and so on, step 8); give each application its own Redis. A database number does not separate them: Redis Pub/Sub ignores it 📖.

### Step 3. The transport behind a load balancer

The single connection mode of part 6 reserves a stream with `PUT /graphql/stream`, opens it with `GET`, and adds every subscription with `POST`. The reserved streams are kept in the memory of the process that answered the `PUT` (`streams` in the handler of `graphql-sse`) 📖. A `GET` that reaches the other process finds no stream and is answered like a request without a token ✅:

```
PUT  x-upstream: 127.0.0.1:3002
GET  HTTP/2 400  x-upstream: 127.0.0.1:3001 {"errors":[{"message":"Missing query"}]}
```

(`x-upstream` was added by nginx for this check.) In a browser it is worse than a random failure ✅: HTTP/2 sends all requests of the tab over one connection, a round robin proxy alternates them between the processes, so `GET` never reaches the process of `PUT`. The client retries, gets `400` again, and the other tab stays stale:

```
before: UA Ukraine: 41000000 (Kyiv) | UA Ukraine: 41000000 (Kyiv)
mutation response: 68 ms
after:  UA Ukraine: 41001000 (Kyiv) | UA Ukraine: 41000000 (Kyiv)
tab1 PUT /graphql/stream 201 127.0.0.1:3002
tab1 GET /graphql/stream 400 127.0.0.1:3001
tab2 PUT /graphql/stream 201 127.0.0.1:3001
tab2 GET /graphql/stream 400 127.0.0.1:3002
…
```

Two ways out:

| | Single connection mode + sticky sessions | Distinct connections + HTTP/2 |
|---|---|---|
| Client | `url: '/graphql/stream', singleConnection: true` (part 6) | `url: '/graphql'` |
| Streams per tab | one | one per subscription |
| State on the server | the reserved streams | none: a subscription is one `POST` whose response is the stream |
| Proxy | must send all requests of a client to one process (`ip_hash`, a cookie, …) | any balancing |
| Limit | — | the concurrent streams of one HTTP/2 connection (nginx: `http2_max_concurrent_streams`, 128 by default 📖), shared by all tabs of the origin |
| Verified | ✅ with `ip_hash`: both tabs updated | ✅ 4 tabs × 3 subscriptions, 12 streams spread over both processes: the mutation answered in 202 ms, all 4 tabs updated |

**Recommendation: distinct connections over HTTP/2.** The limit of 6 connections that made part 6 choose the single connection mode is a limit of HTTP/1.1; over HTTP/2 a stream per subscription is cheap, and with no state on the server any process can serve any request. Keep the single connection mode for HTTP/1.1, i.e. `next dev`. The client picks the mode by the protocol of the page:

```ts
// src/relay/environment.ts (the parts that change)

// HTTP/2 (or HTTP/3) to the browser: a stream per subscription, each one a single request that any
// instance of the server can serve; HTTP/1.1 ("next dev"): one stream per tab, as in part 6
const createSseClient = (): Client<boolean> => {
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

  return ['h2', 'h3'].includes(navigation?.nextHopProtocol)
    ? createClient({ url: '/graphql', on })
    : createClient({ url: '/graphql/stream', singleConnection: true, on });
};

// created on the first subscription
let sseClient: Client<boolean> | undefined;

const subscribe: SubscribeFunction = (request, variables) =>
  Observable.create<GraphQLResponse>((sink) => {
    const client = (sseClient ??= createSseClient()); // was: createClient({ url: '/graphql/stream', singleConnection: true })

    // … client.subscribe as in part 6
  });
```

(`on` is defined in step 6.) Behind nginx with HTTP/2 the Network panel shows only `POST /graphql`, three of them pending (the streams); on `http://localhost:3001` (HTTP/1.1) the same build uses `PUT`, `GET` and `POST /graphql/stream` as in part 6 ✅. The server keeps `useGraphQLSSE()` and `app/graphql/stream/route.ts` for that case.

If the proxy in front of the application speaks only HTTP/1.1 to browsers, stay with the single connection mode and make the sessions sticky (step 4).

### Step 4. The reverse proxy

```nginx
# nginx.conf (the "server" part; for a local check the certificate is self-signed)
upstream app {
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
}

server {
  listen 8443 ssl;
  http2 on;
  server_name localhost;

  ssl_certificate     /etc/nginx/certs/localhost.crt;
  ssl_certificate_key /etc/nginx/certs/localhost.key;

  location / {
    proxy_pass http://app;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # the event streams must reach the browser at once
    proxy_buffering off;
    # longer than the 12 s between the pings of Yoga
    proxy_read_timeout 1h;
  }
}
```

A self-signed certificate for `localhost`:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj /CN=localhost \
  -addext subjectAltName=DNS:localhost -keyout localhost.key -out localhost.crt
```

Browsers speak HTTP/2 only over TLS, so the certificate is needed even locally; Chrome opens `https://localhost:8443` after the warning is accepted (Playwright: `ignoreHTTPSErrors: true`).

What each setting does, measured with a subscription through the proxy and a mutation sent at 1 s ✅:

| Setting | Result |
|---|---|
| as above | `0.1 s` status 200 and the first ping, `1.1 s` the event, `12.1 s`, `24.1 s` pings, open at `26 s` when the check stopped |
| without `proxy_buffering off` | nothing in 15 s, not even the status: nginx buffers the response of the upstream |
| without `proxy_buffering off`, the application sends `X-Accel-Buffering: no` (below) | the same as the first row |
| `proxy_read_timeout 5s` | the event at `1.1 s`, then `TypeError: terminated` at `6.1 s`; nginx logs `upstream timed out` |
| without `proxy_read_timeout` (60 s by default) | the stream stays open, the pings of every 12 s keep it alive |
| with `proxy_http_version 1.1` and `proxy_set_header Connection ""` | the same as the first row: the event streams do not need them (they enable keep-alive connections to the upstream 📖) |

`proxy_buffering off` is the simplest switch if you write the nginx config. If you do not (a hosting with a proxy built on nginx), let the application turn the buffering off for its event streams:

```ts
// src/data/yoga.ts (the parts that change)
import { createSchema, createYoga } from 'graphql-yoga';
import type { Plugin } from 'graphql-yoga';

// nginx (and the proxies built on it) must not buffer the event streams
const useNoProxyBuffering = (): Plugin => ({
  onResponse({ response }) {
    if (response.headers.get('content-type')?.startsWith('text/event-stream')) {
      response.headers.set('X-Accel-Buffering', 'no');
    }
  },
});

const yoga = createYoga({
  // …
  plugins: [useGraphQLSSE(), useNoProxyBuffering()], // was: [useGraphQLSSE()]
  // …
});
```

The header is set on the streams of both modes (`/graphql` and `GET /graphql/stream`) ✅. Yoga itself does not send it.

**Sticky sessions**, only for the single connection mode behind a balancer:

```nginx
upstream app {
  ip_hash;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
}
```

With `ip_hash` all requests of a tab reached one process and both tabs were updated ✅. `ip_hash` balances by the address of the client: behind another proxy or NAT many users come from one address and land on one process; balancing by a cookie is the alternative 📖.

### Step 5. Where it can run

A subscription is an HTTP response that stays open as long as the page, and the events reach it from Redis. The server therefore has to be a **long-lived Node.js process** that may keep a response open for hours: `next start` (or any Node server that runs the route handlers), several of them behind a proxy, in containers or on virtual machines. That is the setup verified in this part ✅.

**Stopping a process.** On `SIGTERM` `next start` stops accepting connections and waits for the open requests to finish (`server.close()` in `start-server.js` of Next.js 📖). An event stream never finishes: with one tab open the process was still alive 44 s after `SIGTERM` and exited only when the browser was closed ✅. Meanwhile it kept delivering events to its streams. In a deployment the orchestrator kills the process after its grace period (`docker stop`: 10 s, Kubernetes: 30 s by default 📖); the streams then break and the clients reconnect to another process (step 6). So:

- a rolling update of several processes keeps the subscriptions (the clients reconnect, the events of the break are read again as in step 6), but every stopped process holds the update for the whole grace period;
- do not end the streams "gracefully" from a `SIGTERM` handler: a stream that the server completes is a completed subscription for `graphql-sse`, which does not reconnect it 📖 (only network errors are retried).

**Serverless platforms** limit the duration of a function, and a stream is a function call that does not end. On Vercel a function runs 300 s by default and at most 300 s on the Hobby plan, 800 s on Pro and Enterprise (30 minutes in a beta) ([Vercel: configuring maximum duration](https://vercel.com/docs/functions/configuring-functions/duration)) 📖: every stream would be cut at least every few minutes, each open tab would hold a function instance, and the PubSub must be external (step 2) because the instances share no memory. Not verified here.

### Step 6. Breaks of the stream: reading what was missed

The PubSub is "fire and forget": an event is delivered to the subscribers connected at the moment of the publication, nothing is stored. While a stream is broken (its process stopped, the network of the client dropped, the proxy closed it) the events are lost, and nothing tells the client which ones it missed.

`graphql-sse` reconnects by itself after a network error: up to 5 attempts (`retryAttempts`), with delays of 1, 2, 4, 8, 16 s plus 0.3–3 s at random (`retry`) 📖. In the scenario below the tab is served by process 3001, which is killed; a change is made on 3002 during the break; 3001 is started again ✅:

```
  4.9 s  tab: UA Ukraine: 41000000 (Kyiv)
  5.1 s  3001 stopped with SIGKILL
  5.6 s  UA population := 42000000 (on 3002)
  6.5 s  tab subscribes: subscription CountriesDeletedSubscription
  6.5 s  tab console: Failed to load resource: the server responded with a status of 502 ()
  …
  7.7 s  3001 restarting
  9.6 s  tab subscribes: subscription CountriesUpdatedSubscription
 10.4 s  tab subscribes: subscription CountriesDeletedSubscription
 10.5 s  tab subscribes: subscription CountriesCreatedSubscription
 19.7 s  tab: UA Ukraine: 41000000 (Kyiv)
 19.8 s  UA population := 43000000 (on 3002)
 21.3 s  tab: UA Ukraine: 43000000 (Kyiv)
```

The subscriptions are back, but `42000000` was never shown. The client knows when it reconnected: `createClient({ on: { connected(reconnected) } })` is called with `true` after a retry. Let the network layer pass that on:

```ts
// src/relay/environment.ts (the parts that change)

// the events published while a stream is broken are lost; the client reconnects by itself, and
// these listeners let the components read again what they show
const reconnectListeners = new Set<() => void>();

export const onSubscriptionsReconnected = (listener: () => void) => {
  reconnectListeners.add(listener);

  return () => {
    reconnectListeners.delete(listener);
  };
};

const on = {
  connected: (reconnected: boolean) => {
    if (reconnected) reconnectListeners.forEach((listener) => listener());
  },
};

// … createSseClient as in step 3: both clients get "on"
```

and let the component read its query again:

```tsx
// src/components/Countries.tsx (the parts that change)
import { useEffect, useMemo } from 'react';
import {
  fetchQuery,
  graphql,
  useMutation,
  usePreloadedQuery,
  useRelayEnvironment,
  useSubscription,
} from 'react-relay';

import { onSubscriptionsReconnected } from '@/relay/environment';
// … the other imports as in part 6

export default function Countries({ preloadedQuery }: Props) {
  // … as in part 6, after the "useSubscription"s:

  // after a break of the streams: read the query again, the response replaces the list in the store
  const { variables } = preloadedQuery;
  useEffect(
    () =>
      onSubscriptionsReconnected(() => {
        fetchQuery<CountriesQuery>(environment, query, variables).subscribe({});
      }),
    [environment, variables],
  );

  // … the same JSX
}
```

The same scenario, with a country created during the break as well ✅:

```
  5.3 s  UA population := 42000000 (on 3002)
  5.4 s  XX created (on 3002)
  7.4 s  3001 restarting
  8.8 s  tab POST /graphql query CountriesQuery
  9.7 s  tab POST /graphql query CountriesQuery
 11.0 s  tab POST /graphql query CountriesQuery
 19.4 s  tab: UA Ukraine: 42000000 (Kyiv); XX in the list: true
```

- `fetchQuery` goes to the network (it passes `force: true`, so the response cache of part 4 is not consulted 📖) and writes the response into the store. The connection is read without `after`, so Relay replaces its edges: a country created during the break appears ✅, a deleted one disappears the same way 📖, and `Stats`, which no event updates, is fresh too.
- Every subscription reconnects on its own, so the query is read once per subscription: three times here, in both modes (HTTP/2 through nginx and HTTP/1.1 directly) ✅. Debounce the listener if the query is expensive.
- After 5 failed attempts the subscription ends with an error and is not restarted 📖: a break longer than about 33–46 s (e.g. the only process is down) needs a reload of the page, or a larger `retryAttempts` with a `retry` that caps the delay.
- A break between a process and Redis is not seen by the client at all: its stream stays open, ioredis reconnects and subscribes again (`autoResubscribe`), the events in between are lost 📖.

**Reading from the last known point instead of everything.** A list that only grows (the messages of a chat) does not have to be read whole: remember the `createdAt` of the newest item and read what came after it ✅:

```graphql
query ($since: DateTime!) {
  Messages(where: { createdAt_gt: $since }, sort: { sortBy: [createdAt_ASC] }) { text createdAt }
}
```

With `$since` = the `createdAt` of the second of five messages it returns the last three. The cursors of `…ThroughConnection` can serve the same purpose for a connection sorted by creation 📖. Changed and deleted items are not caught this way.

### Step 7. Who receives an event: a support chat

Without authorization every subscriber gets every event ([part 6](06-subscriptions-local.md#what-this-setup-does-not-cover)). [Part 10 of the guide to the configs](../configs-guide/10-authorization.md#step-7-subscriptions) gives the tools: `filters` restrict queries and mutations, `subscribePayloadFilters` the events, and both are functions of the user attributes returned by `getUserAttributes` (`{ role, id, … }`). The catch: `subscribePayloadFilters` are applied to the payload in memory and may use only the fields of the entity itself, no lookups such as `conversation_: { … }`. When the right to see an entity depends on another entity, put that dependency into a **calculated field computed on the publishing side** and filter by it.

The example is a support chat: a client opens a conversation, consultants take it, a supervisor sees everything and may reassign it.

```ts
// src/data/graphql-fns.general.config.ts (the entities of the chat)
{
  name: 'User',
  textFields: [
    { name: 'name', unique: true, required: true },
    { name: 'role', required: true }, // "client" | "consultant" | "supervisor"
  ],
},
{
  name: 'Conversation',
  booleanFields: [{ name: 'closed' }],
  relationalFields: [
    { name: 'client', configName: 'User', oppositeName: 'clientConversations', required: true, index: true },
    { name: 'consultant', configName: 'User', oppositeName: 'consultantConversations', index: true },
  ],
},
{
  name: 'Message',
  // computed when the event is published, available to the filters of events
  allowedCalculatedWithAsyncFuncFieldNames: ['participantIds', 'waiting'],
  textFields: [{ name: 'text', required: true }],
  relationalFields: [
    { name: 'conversation', configName: 'Conversation', oppositeName: 'messages', required: true, index: true },
    { name: 'author', configName: 'User', oppositeName: 'messages', index: true },
  ],
  calculatedFields: [
    // the client and the consultant of the conversation: who receives the events of the message
    { name: 'participantIds', calculatedType: 'textFields', array: true, async: true },
    // the conversation has no consultant yet: the events go to all consultants
    { name: 'waiting', calculatedType: 'booleanFields', async: true },
  ],
},
```

```ts
// src/data/graphql-fns.serverSide.config.ts (the parts of the chat)
import { composeServersideConfig } from 'graphql-fns';
import type { InvolvedFilter, ServersideConfig, SimplifiedEntityFilters } from 'graphql-fns';

// one query for the conversations of all messages (asyncFunc gets raw documents)
const getConversations = async (context: any, entityOrEntities: any) => {
  const messages = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];

  const conversations = await context.mongooseConn.db
    .collection('conversation_things')
    .find(
      { _id: { $in: messages.map(({ conversation }: any) => conversation) } },
      { projection: { client: 1, consultant: 1 } },
    )
    .toArray();

  return new Map<string, { client?: unknown; consultant?: unknown }>(
    conversations.map((conversation: any) => [String(conversation._id), conversation]),
  );
};

const filters: SimplifiedEntityFilters = {
  // … the other entities
  Conversation: ({ role, id }): InvolvedFilter[] | null => {
    switch (role) {
      case 'supervisor':
        return [];
      case 'consultant':
        return [{ consultant: id }, { consultant_exists: false }]; // own ones and the queue
      case 'client':
        return [{ client: id }];
      default:
        return null;
    }
  },
  Message: ({ role, id }): InvolvedFilter[] | null => {
    switch (role) {
      case 'supervisor':
        return [];
      case 'consultant':
        return [
          { conversation_: { consultant: id } },
          { conversation_: { consultant_exists: false } },
        ];
      case 'client':
        return [{ conversation_: { client: id } }];
      default:
        return null;
    }
  },
};

// events are filtered in memory: no lookups ("conversation_"), the calculated fields of the payload instead
const subscribePayloadFilters: SimplifiedEntityFilters = {
  // … the other entities
  Conversation: ({ role, id }): InvolvedFilter[] | null => {
    switch (role) {
      case 'supervisor':
        return [];
      case 'consultant':
        return [{ consultant: id }, { consultant_exists: false }];
      case 'client':
        return [{ client: id }];
      default:
        return null;
    }
  },
  Message: ({ role, id }): InvolvedFilter[] | null => {
    switch (role) {
      case 'supervisor':
        return [];
      case 'consultant':
        return [{ participantIds: id }, { waiting: true }];
      case 'client':
        return [{ participantIds: id }];
      default:
        return null;
    }
  },
};

const calculatedFields: ServersideConfig['calculatedFields'] = {
  Message: {
    participantIds: {
      fieldsToUseNames: ['conversation'],
      asyncFunc: async (args, resolverCreatorArg, { context }, entityOrEntities) =>
        getConversations(context, entityOrEntities),
      func: (args, data, resolverArg, conversations) => {
        const { client, consultant } = conversations.get(String(data.conversation)) ?? {};

        return [client, consultant].filter(Boolean).map(String);
      },
    },
    waiting: {
      fieldsToUseNames: ['conversation'],
      asyncFunc: async (args, resolverCreatorArg, { context }, entityOrEntities) =>
        getConversations(context, entityOrEntities),
      func: (args, data, resolverArg, conversations) =>
        !conversations.get(String(data.conversation))?.consultant,
    },
  },
};

const serversideConfig: ServersideConfig = composeServersideConfig(generalConfig, {
  getUserAttributes: async (context: any) => {
    // … the user of the request, e.g. from a session cookie
    return user ? { roles: [user.role], id: String(user._id) } : { roles: ['guest'] };
  },
  containedRoles: { guest: [], client: [], consultant: [], supervisor: [] },
  inventoryByRoles: {
    guest: { name: 'guest' },
    client: { name: 'client' },
    consultant: { name: 'consultant' },
    supervisor: { name: 'supervisor' },
  },
  filters,
  subscribePayloadFilters,
  calculatedFields,
});
```

- `participantIds` and `waiting` are `async` and listed in `allowedCalculatedWithAsyncFuncFieldNames`, so they are computed **once per event, by the process that publishes it**, from the state of the conversation at that moment, and travel in the payload ([calculated-fields.md](../calculated-fields.md) CF9, CF26). The filter of every subscriber then compares a stored value, without a query to MongoDB.
- `{ participantIds: id }` matches when the array contains the id: the filters of events are MongoDB queries run in memory (mingo).
- The `switch` functions need the return type `InvolvedFilter[] | null`: without it TypeScript infers a union of object literals that does not fit `SimplifiedEntityFilters`.
- `null` (the role `guest` here) denies: a subscription is accepted and sends nothing ([part 10 of the guide to the configs, step 8](../configs-guide/10-authorization.md#step-8-what-a-client-sees-on-denial)).

Five users, every one subscribed on process B to `createdConversation`, `updatedConversation` and `createdMessage`; the mutations are made on process A ✅ (the deliveries with `node: null` / `previousNode: null` were checked on one process, see below):

| Action | `createdConversation` | `updatedConversation` | `createdMessage` |
|---|---|---|---|
| cli1 starts a conversation | cli1, con1, con2, sup | | |
| cli1 writes (no consultant yet) | | | cli1, con1, con2, sup |
| con1 takes the conversation | | cli1, con1, sup; con2 with `node: null` | |
| con1 replies | | | cli1, con1, sup |
| sup reassigns it to con2 | | cli1, sup; con1 with `node: null`; con2 with `previousNode: null` | |
| cli1 writes | | | cli1, con2, sup |
| sup writes | | | cli1, con2, sup |
| con1 tries to write | | | nobody: the mutation is denied (the server logs `Cannot return null for non-nullable field Mutation.createMessage.`, the client gets the masked `Unexpected error.`) |

cli2 receives nothing. After the reassignment con1 is cut off at once: the next message is computed with `participantIds` = [cli1, con2]. The queries agree with the events: con1 sees no conversation and no message afterwards, con2 and sup see all four messages.

**Entering and leaving.** Every state of an `updatedX` event is checked separately: the event is delivered if at least one of them passes the filters of the subscriber, the other one comes as `null`, and `updatedFields` lists all changed fields ([part 9 of the guide to the configs, step 4](../configs-guide/09-subscriptions.md#step-4-filters-wherepayload-and-whichupdated)). For the conversation, with `updatedConversation { previousNode { consultant { name } } node { consultant { name } } updatedFields }` ✅ (one process with the Redis PubSub of step 2):

| Change of the conversation | con1 | con2 | cli1, sup |
|---|---|---|---|
| con1 takes it (no consultant → con1) | both states | `previousNode` (no consultant), `node: null`: gone from the queue | both states |
| reassigned con1 → con2 | `previousNode` (con1), `node: null`: taken away | `previousNode: null`, `node` (con2): a new conversation | both states |

`updatedFields` is `["consultant"]` for everybody. A consultant never receives a state of the conversation it may not see (con2 does not learn from this event who had the conversation before, con1 does not learn to whom it went, only that `consultant` changed).

The list of conversations of a consultant follows from `updatedConversation` alone. Relay directives cannot be conditional (`@deleteEdge` on `previousNode` would also fire when both states come), so the subscription gets an `updater` 📖:

```ts
useSubscription<ConversationsUpdatedSubscription>(
  useMemo(
    () => ({
      subscription: updatedSubscription, // updatedConversation { previousNode { id } node { id … } }
      variables: {},
      updater: (store, data) => {
        const { node, previousNode } = data!.updatedConversation;
        const connection = store.get(connectionId);

        if (!connection) return;

        if (!node && previousNode) {
          ConnectionHandler.deleteNode(connection, previousNode.id); // left the scope
        } else if (node && !previousNode) {
          const record = store.getRootField('updatedConversation').getLinkedRecord('node')!;
          const edge = ConnectionHandler.createEdge(store, connection, record, 'ConversationEdge');

          ConnectionHandler.insertEdgeAfter(connection, edge); // entered the scope
        }
        // both states: Relay updates the record by its "id"
      },
    }),
    [connectionId],
  ),
);
```

### Step 8. Scale

The library publishes to one channel per entity and kind of event: `created-Message`, `updated-Conversation`, … ✅ (`redis-cli PUBSUB CHANNELS` shows them). There is no channel per conversation or per room. The consequences:

- Redis delivers every event of an entity to every process that has at least one subscriber of that entity ✅: each process holds one Redis subscription per channel (five subscribers of `createdMessage` on one process: `PUBSUB NUMSUB created-Message` → `1`) and fans the event out in memory.
- In the process, the event goes through the filter of **every** subscriber of the channel (`wherePayload`, `whichUpdated`, `subscribePayloadFilters`), and the payload is resolved for every subscriber that passes (its selection, the calculated fields not computed on publication) 📖. A busy chat with thousands of open conversations costs thousands of in-memory filter runs per message on every process.
- What is cheap: the async calculated fields of step 7 are computed once per event, not per subscriber ([calculated-fields.md](../calculated-fields.md) CF26).
- A closed subscription costs nothing: when a client disconnects, its iterator leaves the PubSub at once, and a channel without subscribers is unsubscribed in Redis ✅ (`PUBSUB CHANNELS` shows `updated-Country` while a `curl` subscription is open and nothing a second after it is closed; nothing either after the browser of step 9 is closed).

For a moderate number of subscribers this is fine. At a large scale the way out is narrower channels of your own (a manually created mutation that calls `pubsub.publish` with, say, a channel per conversation, and a manually created subscription field that subscribes to it); not verified here 📖.

### Step 9. Check

```bash
yarn build
npx next start -p 3001 &
npx next start -p 3002 &
# Redis and nginx with the config of step 4, e.g. in Docker:
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name nginx --network host \
  -v "$PWD/nginx:/etc/nginx/conf.d:ro" -v "$PWD/certs:/etc/nginx/certs:ro" nginx:1.27-alpine
```

Open `https://localhost:8443` in two tabs and press `+1000` in one of them (here the tabs were driven by Playwright) ✅:

```
protocol: h2
before: UA Ukraine: 41000000 (Kyiv) | UA Ukraine: 41000000 (Kyiv)
mutation response: 151 ms
after:  UA Ukraine: 41001000 (Kyiv) | UA Ukraine: 41001000 (Kyiv)
tab1 POST /graphql 200
tab1 POST /graphql 200
tab1 POST /graphql 200
tab2 POST /graphql 200
tab2 POST /graphql 200
tab2 POST /graphql 200
tab1 POST /graphql 200
```

Three subscriptions per tab, then the mutation; the streams of the tabs land on both processes, the event reaches all of them through Redis. With `curl` subscribe on one process and mutate on the other as in step 2. To see a break, stop the process of a tab (`fuser -k 3001/tcp`), make a change on the other one, start it again: the tab reads its query again (step 6).

### Checklist

- [ ] graphql-fns 0.1.2-beta.1169 or later;
- [ ] the PubSub on `globalThis` uses `createRedisEventTarget` with two ioredis clients, the subscribing one with `enableReadyCheck: false`, and the `mongo.BSON.EJSON` serializer; `REDIS_URL` in the environment;
- [ ] HTTP/2 between the browser and the proxy, the client uses distinct connections (`url: '/graphql'`) under HTTP/2 and the single connection mode only under HTTP/1.1; the single connection mode behind a balancer only with sticky sessions;
- [ ] the proxy does not buffer the event streams (`proxy_buffering off` or `X-Accel-Buffering: no`) and does not time them out in less than the 12 s between the pings;
- [ ] long-lived Node processes; the grace period of a deployment is the time a stopped process holds its streams;
- [ ] every component that shows data kept up to date by subscriptions reads it again after a reconnect;
- [ ] who may see an event that depends on another entity: an async calculated field in `allowedCalculatedWithAsyncFuncFieldNames` + `subscribePayloadFilters` by it; entering and leaving the scope comes as an `updatedX` event with `previousNode: null` / `node: null`;
- [ ] every event of an entity passes the filters of all its subscribers in every process: fine for moderate numbers.

---

[← Part 6](06-subscriptions-local.md) · [Contents](README.md)
