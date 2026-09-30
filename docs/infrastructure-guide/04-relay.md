## Part 4. The client: Relay

The goal of this part: a Server Component runs a query **in the server process**, the page arrives with the data in its HTML, and the browser does not ask for the same data again ✅.

### Step 1. The compiler: `relay.config.json` and `next.config.ts`

```json
{
  "src": "./src",
  "language": "typescript",
  "schema": "./src/schema.graphql",
  "artifactDirectory": "./src/__generated__",
  "eagerEsModules": true
}
```

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    relay: {
      src: './',
      language: 'typescript',
      artifactDirectory: 'src/__generated__',
      eagerEsModules: true,
    },
  },
};

export default nextConfig;
```

Two tools read the `graphql` tags, and they must agree on `artifactDirectory`:

- `relay-compiler` (`yarn relay`) checks every tag against `src/schema.graphql` and writes `<OperationName>.graphql.ts` into `src/__generated__/`: the text of the operation and its TypeScript types;
- the compiler of Next.js (`compiler.relay`) replaces every tag in the bundle with an import of that file.

An operation must be named after its module: in `Countries.tsx` the names start with `Countries` and end with `Query` / `Mutation` / `Subscription` (`CountriesQuery`, `CountriesGrowMutation`), otherwise `relay-compiler` reports an error.

### Step 2. The environment

```ts
// src/relay/environment.ts
import { Environment, Network, QueryResponseCache, RecordSource, Store } from 'relay-runtime';
import type { FetchFunction, GraphQLResponse, RequestParameters, Variables } from 'relay-runtime';

const IS_SERVER = typeof window === 'undefined';
const CACHE_TTL = 5 * 1000; // enough to hand a preloaded response over to "usePreloadedQuery"

export async function networkFetch(
  request: RequestParameters,
  variables: Variables,
): Promise<GraphQLResponse> {
  const resp = await fetch('/graphql', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: request.text, variables }),
  });

  const json = await resp.json();

  // GraphQL reports errors in the "errors" property of a response with the status 200
  if (Array.isArray(json.errors)) {
    throw new Error(`Error in "${request.name}": ${JSON.stringify(json.errors)}`);
  }

  return json;
}

// the responses preloaded by Server Components, one cache per environment
const responseCaches = new WeakMap<Environment, QueryResponseCache>();

export const getResponseCache = (environment: Environment) => responseCaches.get(environment);

function createEnvironment() {
  const responseCache = new QueryResponseCache({ size: 100, ttl: CACHE_TTL });

  const fetchResponse: FetchFunction = async (params, variables, cacheConfig) => {
    const cacheKey = params.id ?? params.cacheID;

    if (params.operationKind === 'query' && !cacheConfig.force) {
      const fromCache = responseCache.get(cacheKey, variables);

      if (fromCache != null) return fromCache;
    }

    return networkFetch(params, variables);
  };

  const environment = new Environment({
    network: Network.create(fetchResponse),
    store: new Store(RecordSource.create()),
    isServer: IS_SERVER,
  });

  responseCaches.set(environment, responseCache);

  return environment;
}

let clientEnvironment: Environment | undefined;

// the browser keeps one environment; the server creates a new one for every render,
// so the data of one visitor never gets to another
export function getCurrentEnvironment() {
  if (IS_SERVER) return createEnvironment();

  clientEnvironment ??= createEnvironment();

  return clientEnvironment;
}
```

The network layer looks into the response cache before it goes to the network; step 4 is what fills that cache.

```tsx
// src/app/Providers.tsx
'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';

import { getCurrentEnvironment } from '@/relay/environment';

export default function Providers({ children }: { children: ReactNode }) {
  const environment = useMemo(() => getCurrentEnvironment(), []);

  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>;
}
```

```tsx
// src/app/layout.tsx
import type { ReactNode } from 'react';

import Providers from './Providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 3. Running a query on the server, in process

A Server Component could `fetch` its own `/graphql`, but that is an HTTP request of the server to itself. Yoga can be called directly instead:

```ts
// src/relay/serverNetworkFetch.ts
import 'server-only';

import { headers } from 'next/headers';
import type { GraphQLResponse, RequestParameters, Variables } from 'relay-runtime';

import yoga from '@/data/yoga';

// Yoga checks only the path against its "graphqlEndpoint", the host is never contacted
const IN_PROCESS_URL = 'http://in-process/graphql';

// the server-side counterpart of "networkFetch": executes an operation against the same Yoga
// instance that serves "/graphql", without an HTTP request to the own origin
export default async function serverNetworkFetch(
  request: RequestParameters,
  variables: Variables,
): Promise<GraphQLResponse> {
  // the cookies of the page request, so resolvers see the same user as for a call from the browser
  const cookie = (await headers()).get('cookie');

  const resp = await yoga.fetch(IN_PROCESS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ query: request.text, variables }),
  });

  const json = await resp.json();

  if (Array.isArray(json.errors)) {
    throw new Error(`Error in "${request.name}": ${JSON.stringify(json.errors)}`);
  }

  return json;
}
```

- `yoga.fetch` runs the whole pipeline of Yoga (parsing, validation, the context of part 3, the resolvers) without a socket ✅.
- The cookies are forwarded so that `getUserAttributes(context)` finds the session in `context.request` exactly as for a request of the browser. Keep the user's token in an `httpOnly` cookie and **not** in the variables of a query: the variables of a preloaded query are serialized into the HTML of the page (step 4) 📖.
- `headers()` makes the page dynamic (rendered on every request), which is what a page that reads a database usually needs ✅. Caching of such calls (`unstable_cache` / `'use cache'`) is out of the scope of this guide; note only that whatever distinguishes users (the session cookie) then has to be a part of the cache key.

The result has to travel from a Server Component to a Client Component through props, so it is a plain object:

```ts
// src/relay/serializablePreloadedQuery.ts
import type { ConcreteRequest, GraphQLResponse, OperationType, VariablesOf } from 'relay-runtime';

// what a Server Component passes to a Client Component through props
export interface SerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType,
> {
  params: TRequest['params'];
  variables: VariablesOf<TQuery>;
  response: GraphQLResponse;
}
```

```ts
// src/relay/loadSerializableQuery.ts
import 'server-only';

import type { ConcreteRequest, OperationType, VariablesOf } from 'relay-runtime';

import type { SerializablePreloadedQuery } from './serializablePreloadedQuery';
import serverNetworkFetch from './serverNetworkFetch';

// executes a query in a Server Component and returns a result that can be passed through props
export default async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType,
>(
  params: TRequest['params'],
  variables: VariablesOf<TQuery>,
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
  const response = await serverNetworkFetch(params, variables);

  return { params, variables, response };
}
```

### Step 4. Handing the result over to Relay

```ts
// src/relay/useSerializablePreloadedQuery.ts
import { useMemo } from 'react';
import type { PreloadedQuery } from 'react-relay';
import type { ConcreteRequest, Environment, OperationType } from 'relay-runtime';

import { getResponseCache } from './environment';
import type { SerializablePreloadedQuery } from './serializablePreloadedQuery';

// turns the result of "loadSerializableQuery" into a "PreloadedQuery" of Relay and puts the
// response into the cache of the environment, where the network layer finds it
export default function useSerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType,
>(
  environment: Environment,
  { params, variables, response }: SerializablePreloadedQuery<TRequest, TQuery>,
): PreloadedQuery<TQuery> {
  const cacheKey = params.id ?? params.cacheID;

  useMemo(() => {
    getResponseCache(environment)?.set(cacheKey, variables, response);
  }, [environment, cacheKey, variables, response]);

  return {
    environment,
    fetchKey: cacheKey,
    fetchPolicy: 'store-or-network',
    isDisposed: false,
    name: params.name,
    kind: 'PreloadedQuery',
    variables,
    dispose: () => {},
  };
}
```

`usePreloadedQuery` then "fetches" the query through the network layer of step 2, which returns the cached response. That happens twice with the same props: during the server render of the Client Component (so the HTML contains the data) and during hydration in the browser (so no request is made) ✅.

### Step 5. A page

```tsx
// src/app/page.tsx (a Server Component)
import CountriesQueryNode from '@/__generated__/CountriesQuery.graphql';
import type { CountriesQuery } from '@/__generated__/CountriesQuery.graphql';
import Countries from '@/components/Countries';
import loadSerializableQuery from '@/relay/loadSerializableQuery';

export default async function Page() {
  const preloadedQuery = await loadSerializableQuery<typeof CountriesQueryNode, CountriesQuery>(
    CountriesQueryNode.params,
    { first: 10 },
  );

  return <Countries preloadedQuery={preloadedQuery} />;
}
```

```tsx
// src/components/Countries.tsx
'use client';

import { graphql, useMutation, usePreloadedQuery, useRelayEnvironment } from 'react-relay';

import type CountriesQueryNode from '@/__generated__/CountriesQuery.graphql';
import type { CountriesQuery } from '@/__generated__/CountriesQuery.graphql';
import type { CountriesGrowMutation } from '@/__generated__/CountriesGrowMutation.graphql';
import type { SerializablePreloadedQuery } from '@/relay/serializablePreloadedQuery';
import useSerializablePreloadedQuery from '@/relay/useSerializablePreloadedQuery';

const query = graphql`
  query CountriesQuery($first: Int!) {
    Stats {
      countries
      cities
    }
    CountriesThroughConnection(first: $first, sort: { sortBy: [population_DESC] }) {
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

const growMutation = graphql`
  mutation CountriesGrowMutation($id: ID!, $by: Int!) {
    growCountry(id: $id, by: $by) {
      id
      population
    }
  }
`;

interface Props {
  preloadedQuery: SerializablePreloadedQuery<typeof CountriesQueryNode, CountriesQuery>;
}

export default function Countries({ preloadedQuery }: Props) {
  const environment = useRelayEnvironment();

  const queryRef = useSerializablePreloadedQuery(environment, preloadedQuery);

  const { Stats, CountriesThroughConnection } = usePreloadedQuery<CountriesQuery>(query, queryRef);

  const [growCountry, isInFlight] = useMutation<CountriesGrowMutation>(growMutation);

  return (
    <main>
      <h1>
        {Stats.countries} countries, {Stats.cities} cities
      </h1>

      <ul>
        {CountriesThroughConnection.edges.map(({ node: { id, code, name, population, cities } }) => (
          <li key={id}>
            {code} {name}: {population} ({cities.map((city) => city.name).join(', ')}){' '}
            <button
              disabled={isInFlight}
              onClick={() => growCountry({ variables: { id, by: 1000 } })}
            >
              +1000
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- The query mixes a generated field (`CountriesThroughConnection`) with manually created ones (`Stats`, `growCountry`, [part 5](05-manually-created.md)): for the client there is no difference.
- The Server Component imports the **generated node** of the query (`CountriesQueryNode.params` holds its text), not the component's `graphql` tag, so it does not pull client code into the server render.
- ✅ The HTML of the page contains `2 countries, 2 cities` and the list; the browser makes **no** `POST /graphql` while loading the page.

### Step 6. Mutations

`useMutation` sends the operation with `networkFetch` to `/graphql`, nothing else is required. The button of the example ✅:

- makes one `POST /graphql` with `CountriesGrowMutation`;
- the response `{ id, population }` updates the row without a refetch: Relay finds the record in its store by the global `id` the mutation returned. This is why a mutation should select `id` and the changed fields, and why a manually created resolver must return the same global ids as the generated ones (part 5, step 4).

Generated mutations work the same way (`updateCountry(whereOne: { id: $id }, data: $data) { id name }`). What Relay cannot deduce is membership of lists: after `createCountry` or `deleteCountry` update the connection yourself (`@appendEdge` / `@deleteRecord` / an `updater`) or refetch the query.

### Rules that are not checked by the compiler

1. **The variables of the preload must equal the ones the client uses later.** The response is cached under the operation and its variables. If a component later loads the same query with differently composed variables (another key order does not matter, another value or a missing key does), Relay sees a different query and goes to the network. A property with the value `undefined` disappears when props are serialized, while Relay sends `null` for a declared variable: pass `null` explicitly for the variables that do not apply 📖.
2. **What the server render needs must be preloaded.** `networkFetch` calls the relative `/graphql`, which works only in the browser. A Client Component that, during the server render, starts a query that was not preloaded (e.g. `useLazyLoadQuery`) will fail on the server 📖: preload it in a Server Component, or start it only in the browser (in an effect or an event handler).
3. **To verify a page**, count the `POST /graphql` requests of the browser while it loads: for a page whose queries are all preloaded the answer is zero ✅.

### Checklist

- [ ] the same `artifactDirectory` in `relay.config.json` and `next.config.ts`;
- [ ] a new environment per server render, one environment in the browser;
- [ ] Server Components load data with `loadSerializableQuery` (in process), Client Components read it with `useSerializablePreloadedQuery` + `usePreloadedQuery`;
- [ ] the user's token travels in a cookie, not in the variables;
- [ ] mutations select `id` and the changed fields.

---

[← Part 3](03-server.md) · [Contents](README.md) · [Part 5 →](05-manually-created.md)
