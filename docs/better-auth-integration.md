# Integrating graphql-fns with better-auth

> The better-auth API was checked against the source code of the `better-auth@1.7.6` and `@better-auth/mongo-adapter@1.7.6` npm packages. The graphql-fns authorization mechanism itself is described in [schema-and-resolvers-analysis.md, §13](./schema-and-resolvers-analysis.md#13-user-authorization).

## 1. Principle

graphql-fns does not deal with sessions or passwords. It learns about the user from a single project function, `serversideConfig.getUserAttributes`:

```ts
getUserAttributes: (context, token?: string) => Promise<{ roles: string[]; id?: string; [key: string]: any }>
```

- `roles` is required. The other fields (`id`, `email`, `organizationId`…) are passed to `filters` functions next to `role`.
- `id` is needed for `personalFilters`: it is the id of a User entity record **in graphql-fns** (see §5).
- `token` is the value of the `token: String` argument of root queries, mutations and `node`.
- The library calls the function **once** per (`context`, `token`) pair and caches the result (B23). So `context` must be created per request.

The integration task: in `getUserAttributes`, get the better-auth session and turn it into `{ id, roles, … }`.

## 2. Mapping

| graphql-fns needs | better-auth | How to connect |
|---|---|---|
| Who the user is | `auth.api.getSession({ headers })` → `{ user, session }` or `null` | Call it in `getUserAttributes` |
| Headers from a Node `IncomingMessage` | `fromNodeHeaders` from `better-auth/node` | `fromNodeHeaders(context.req.headers)` |
| `roles: string[]` | `admin` plugin: `user.role` is a **string**, several roles are comma-separated (`"admin,user"`), `defaultRole` is `"user"` by default; `user.banned` | `user.role.split(',')` |
| Organization roles | `organization` plugin: `session.activeOrganizationId`, the member role (also comma-separated) via `auth.api.getActiveMember` (throws if there is no active organization) | Add member roles to `roles`, pass `organizationId` in the attributes for `filters` |
| The `token` argument | The `bearer` plugin reads `Authorization: Bearer <token>` | Turn `token` into the header |
| `id` | The MongoDB adapter stores `_id` as `ObjectId` and returns `id` as a 24-character hex string | Same format as in graphql-fns |
| Database load | `session.cookieCache`: the session in a signed cookie without a database lookup | Enable it |
| Guest | `getSession` → `null` | Return the `guest` role (§4) |

## 3. better-auth setup

```ts
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, bearer } from 'better-auth/plugins';

export const auth = betterAuth({
  database: mongodbAdapter(db), // db is a Db instance of the mongodb driver
  plugins: [admin(), bearer()],
  session: { cookieCache: { enabled: true, maxAge: 60 } },
  databaseHooks: {
    user: { create: { after: syncGraphqlFnsUser } }, // see §5
  },
});
```

## 4. `getUserAttributes`

```ts
import type { UserAttributes } from 'graphql-fns';
import { fromNodeHeaders } from 'better-auth/node';

const GUEST: UserAttributes = { id: null, roles: ['guest'] };

const getUserAttributes = async (context, token?: string): Promise<UserAttributes> => {
  const headers = fromNodeHeaders(context.req.headers);

  if (token) headers.set('authorization', `Bearer ${token}`);

  const result = await auth.api.getSession({ headers });

  if (!result || result.user.banned) return GUEST;

  const { user } = result;

  return {
    id: user.id,
    email: user.email,
    roles: (user.role ?? 'user').split(',').map((role) => role.trim()),
  };
};
```

There is no need to cache the result in the project: the library itself calls `getUserAttributes` once per request, even if the request touches hundreds of field resolvers. A failed call is not cached.

### 4.1. Organization roles

```ts
const organizationId = result.session.activeOrganizationId ?? null;

// without an active organization getActiveMember throws APIError (NO_ACTIVE_ORGANIZATION)
const member = organizationId ? await auth.api.getActiveMember({ headers }) : null;

return {
  id: user.id,
  organizationId,
  roles: [
    ...(user.role ?? 'user').split(','),
    ...(member ? member.role.split(',').map((role) => `org:${role}`) : []),
  ].map((role) => role.trim()),
};
```

The `org:` prefix separates global roles from organization roles when their names coincide (`admin`).

### 4.2. Roles setup in graphql-fns

```ts
const serversideConfig = composeServersideConfig(generalConfig, {
  getUserAttributes,

  containedRoles: {
    guest: [],
    user: ['guest'],
    admin: ['user', 'guest'],
  },

  inventoryByRoles: {
    guest: { name: 'guest', include: { Query: { entities: ['Post'], entity: ['Post'] } } },
    user: { name: 'user', include: { Mutation: { createEntity: ['Post'], updateEntity: ['Post'] } } },
    admin: { name: 'admin' }, // no include: all actions
  },

  filters: {
    Post: ({ role, id }) => {
      switch (role) {
        case 'admin':
          return [];
        case 'user':
          return [{ author: id }, { published: true }];
        case 'guest':
          return [{ published: true }];
        default:
          return null;
      }
    },
  },

  // required together with "filters" when subscriptions are available
  subscribePayloadFilters: {
    Post: ({ role, id }) => {
      switch (role) {
        case 'admin':
          return [];
        case 'user':
          return [{ author: id }, { published: true }];
        case 'guest':
          return [{ published: true }];
        default:
          return null;
      }
    },
  },
});
```

- Every role better-auth can issue must be in `containedRoles` and `inventoryByRoles` (`composeServersideConfig` checks that the keys match).
- graphql-fns ignores a role absent from `containedRoles`: it grants no access and does not break the request (B24). So a new role created in better-auth will not expose data until it is described in the config.
- At startup `filters` functions are called for every role from `containedRoles` with test attributes, so for known roles they must return a value rather than throw; return `null` in the `default` branch.

## 5. The User entity and `personalFilters`

`personalFilters` look up the **graphql-fns** User entity by `userAttributes.id`. graphql-fns stores it in the `user_things` collection (model `User_Thing`), while better-auth uses the `user` collection. A graphql-fns User record with the same id is needed.

The recommended way is the better-auth `databaseHooks.user.create.after` hook:

```ts
import { createThingSchema } from 'graphql-fns';

const syncGraphqlFnsUser = async (user) => {
  const UserThing =
    mongooseConn.models.User_Thing ||
    mongooseConn.model('User_Thing', createThingSchema(allEntityConfigs.User, enums));

  await UserThing.updateOne(
    { _id: user.id },
    { $setOnInsert: { _id: user.id, email: user.email } },
    { upsert: true },
  );
};
```

- Write directly to the model rather than through a generated mutation: the mutation goes through authorization, and inside the hook the user has no session yet.
- If User has duplex fields, fill them later with graphql-fns mutations so that the library maintains the back references.
- An alternative is to name the better-auth collection `user_things` via `user.modelName`. Not recommended: the graphql-fns mongoose schema does not know better-auth fields, and better-auth does not know graphql-fns fields.

## 6. Subscriptions

- Events are checked only by `subscribePayloadFilters` (`filters` do not apply to them), so with `filters` and available subscriptions `composeServersideConfig` requires `subscribePayloadFilters` (B27). They receive the same attributes as `filters` and are applied to the event payload, so they may use only fields of the entity itself.
- Authorization runs **once**, when subscribing. If a session is revoked or the user is banned, they keep receiving events until reconnecting. Close the user's WebSocket connections on sign-out or ban.
- Subscriptions have no `token` argument; the user is determined from `context` only. With `graphql-ws`, put the upgrade request headers or a token from `connectionParams` into `context`:

```ts
useServer(
  {
    schema,
    context: (ctx) => ({
      mongooseConn,
      pubsub,
      req: { headers: ctx.extra.request.headers },
      connectionToken: ctx.connectionParams?.token,
    }),
  },
  wsServer,
);
```

  and in `getUserAttributes` use `token ?? context.connectionToken` as the bearer token.
- The `context` function is called for every operation, so the `userAttributes` cache (B23) does not outlive a single subscription. Do not pass a static object shared by the whole connection as `context`: the attributes would be fixed for its whole lifetime.

## 7. Security

| Risk | Recommendation |
|---|---|
| The `token` argument ends up in the request body, logs and the persisted queries cache | For HTTP use a cookie or the `Authorization` header; use `token` only where a header is impossible |
| Access denial returns `null`, not an error | By design of the library; the client cannot tell "no access" from "not found" |
| Configuration errors (`Not found "getUserAttributes" callback…`) are sent to the client | Mask internal errors (`formatError` in Apollo, `maskedErrors` in graphql-yoga) |
| `getUserAttributes` returns `null` | With `filters` / `inventoryByRoles` this is a `TypeError` on every request. Always return at least `{ roles: ['guest'] }` |
| Banned user (`user.banned`) | better-auth does not create new sessions for them, but an existing session in `cookieCache` may live until `maxAge`. Check `banned` in `getUserAttributes`, as in §4 |
