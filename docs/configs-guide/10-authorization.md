## Part 10. Authorization and limits

Authorization lives entirely in the server-side config. It decides per request which actions a user may call (by roles) and which entities these actions may see or change (by filters). The design and the risks are in [schema-and-resolvers-analysis.md](../schema-and-resolvers-analysis.md) §11, an integration with an authentication library in [better-auth-integration.md](../better-auth-integration.md). The example below continues the countries: `Country`, `City` (with `published`, `population` and the relational `country`) and a `User` entity; it was run on MongoDB with subscriptions excluded ✅.

### Step 1. The whole server-side config

```ts
import { addChildActions, composeServersideConfig } from 'graphql-fns';

// generalConfig: Country, City, and
// { name: 'User', textFields: [{ name: 'email', unique: true, required: true }],
//   filterFields: [{ name: 'cityFilter', configName: 'City', array: true }] },
// inventory: { name: 'main', exclude: { Subscription: true } }

const serversideConfig = composeServersideConfig(generalConfig, {
  getUserAttributes: async (context, token) =>
    (await findUserBySessionToken(token ?? context.sessionToken)) ?? // { roles, id } of a signed-in user
    { roles: ['guest'], id: GUEST_USER_ID }, // "id": a service guest User record, needed because of personalFilters (step 5)

  containedRoles: {
    guest: [],
    user: ['guest'],
    editor: ['user', 'guest'],
    admin: ['editor', 'user', 'guest'],
  },

  inventoryByRoles: {
    guest: addChildActions(
      { name: 'guest', include: { Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] } } },
      generalConfig,
    ),
    user: { name: 'user', include: { Query: { entityCount: ['City'] } } },
    editor: { name: 'editor', include: { Mutation: { updateEntity: ['City'] } } },
    admin: { name: 'admin', exclude: { Subscription: true } },
  },

  filters: {
    Country: () => [],
    User: ({ role }) => (role === 'admin' ? [] : null),
    City: ({ role }) => {
      switch (role) {
        case 'admin':
        case 'editor':
          return [];
        case 'user':
        case 'guest':
          return [{ published: true }];
        default:
          return null;
      }
    },
  },

  personalFilters: { City: ['User', 'id', 'cityFilter'] },
  skipPersonalFilter: (entityName, { roles }) => roles.includes('admin'),

  staticLimits: { City: 3 },
});
```

Always build the server-side config with **`composeServersideConfig`**: it validates everything below at startup (missing callbacks, roles that do not match, unknown actions and entities, filters of the wrong shape) and prepares the filters for the resolvers.

### Step 2. Who is the user: `getUserAttributes`

`getUserAttributes(context, token?)` returns `{ roles: string[], id?: string, …other attributes }`:

- `roles` is required; the other attributes are passed to the `filters` functions. `id` is the id of a `User` record of graphql-fns and is needed only for `personalFilters` (step 5): a user without it gets no access to entities with a personal filter, everything else works ✅.
- `token` is the `token: String` argument that every generated root query and mutation has: `Cities(token: "…")` is authorized by that token instead of the context ✅. Subscriptions and `node` have no `token`: the user comes from the context only. Prefer cookies or the `Authorization` header in the context; a token in arguments ends up in request bodies and logs.
- It is called once per context and token, even for many resolvers of one request (`a: Cities b: Countries { cities }` → 1 call) ✅. So create the context per request, which Apollo, Yoga and `graphql-ws` do.
- **Anonymous users**: return a role for them (`{ roles: ['guest'] }`), not `null`: with roles or filters configured a `null` breaks the request 📖. With `personalFilters` add the id of a service guest `User` record (step 5).

### Step 3. What a user may call: `containedRoles` and `inventoryByRoles`

- `containedRoles` lists **every** role and the roles it contains: `editor: ['user', 'guest']` means an editor may do everything a user and a guest may. It is required together with `inventoryByRoles` ✅.
- `inventoryByRoles` gives every role an inventory of the same shape as `generalConfig.inventory` (part 5). A user may call an action if **any** of the user's roles (with the contained ones) allows it: bob (`user`) gets `CityCount` from `user` and `Cities` from `guest` ✅.
- A role inventory can only narrow the general one: every action and entity of a role must exist in `generalConfig.inventory`. `admin: { name: 'admin' }` means "all actions" including subscriptions, so with subscriptions excluded in the general inventory it fails: `Subscription "createdEntity" of "admin" role not found in general inventory!` ✅. Write `admin: { name: 'admin', exclude: { Subscription: true } }`.
- Relation fields are child actions of the target entity (part 5, step 3): wrap a role inventory in `addChildActions` if its users need them, or leave them out on purpose.
- A role that is not in `containedRoles` grants nothing 📖: a new role of the authentication system exposes no data until it is described here.

### Step 4. What a user may see and change: `filters`

For every entity, a function of `{ role, …userAttributes }` is called for every role of the user:

| Result | Meaning |
|---|---|
| `[]` | the role gives full access to the entity |
| `[where1, where2, …]` | the role gives access to the entities matching **any** of the conditions (`…WhereInput` of the entity, Mongo ids) |
| `null` | the role gives no access |

The results of the user's roles are combined with OR. The conditions apply to every action: lists and counts see only the allowed entities, single-entity queries and mutations find only them, child fields too ✅. In the example guests and users see only published cities (`Cities`: Kyiv, Lviv, Warsaw; `CityCount: 3`), editors and admins all of them ✅.

Rules checked by `composeServersideConfig` ✅:

- with `filters`, **every entity** used by any role inventory must have a function, otherwise `Entity name "Country" not found in "filters" but used in: inventory "guest", …`; entities without restrictions get `() => []`;
- the functions are called at startup for every role with test attributes, so they must not throw for known roles; return `null` in the `default` branch.

### Step 5. Per-user filters: `personalFilters`

A personal filter is stored in the database, in a filter field (part 2) of the graphql-fns `User` entity, and can be changed per user without changing the code:

```ts
personalFilters: { City: ['User', 'id', 'cityFilter'] },   // [user entity, pointer, filter field]
skipPersonalFilter: (entityName, { roles }) => roles.includes('admin'),
```

- `['User', 'id', 'cityFilter']`: take the `User` record with `id = userAttributes.id` and use its `cityFilter` for `City`; `cityFilter` must be an **array** filter field of `User` ✅.
- `['User', 'group', 'cityFilter']`: take the `User` record, follow its field `group` (a scalar relational or duplex field) and use `cityFilter` of the record it points to (an array filter field there): a filter shared by a group of users ✅.
- It is combined with the role filters by AND ✅: alice is an `editor` (all cities) with `cityFilter: { country: <UA> }`, so she sees and updates only Ukrainian cities (Draft UA, Kyiv, Lviv); `updateCity` of Warsaw is denied ✅. bob (`user`, `cityFilter: {}`) sees the published cities ✅. Child fields are restricted the same way (`Countries { cities }`) ✅.
- `skipPersonalFilter` switches it off, e.g. for admins; the `User` record is then not read and may be absent ✅.

What the stored value means ✅:

| The `User` record and its filter field | Access to the entity |
|---|---|
| `{}` (`cityFilter: {}` in the mutation) | no personal restriction, only the role filters |
| a where filter (`{ country: <UA> }`) | the role filters AND this filter |
| empty (not set / `null`) | none |
| no `User` record, no pointed record | none |
| no `id` in `userAttributes` (e.g. a guest) | none (checked **before** `skipPersonalFilter`) |

"None" means no access even if the role filters give full access (`[]`) ✅. `composeServersideConfig` checks the shape of the tuples at startup (entities, pointer, filter fields) 📖.

**So every user who must see such entities needs an `id` and a `User` record**, the guest included ✅ ([personal-filters.md](../personal-filters.md) PF5, PF7, PF14):

- create the `User` record when a user is created (for better-auth: [better-auth-integration.md](../better-auth-integration.md) §5);
- for anonymous users create one service guest `User` record with `cityFilter: {}` and return its id, `{ roles: ['guest'], id: GUEST_USER_ID }`: the guest then sees what the `guest` role filters allow (the published cities); a guest without `id` or without that record sees no cities at all (`Cities: []`, `Countries { cities: [] }`) ✅, while entities without a personal filter stay available;
- `id` is checked before `skipPersonalFilter` by design: a `skipPersonalFilter` written for users with an `id` must not open anything to attributes without it.

Personal filters do not apply to subscription events: use `subscribePayloadFilters` (step 7) 📖.

### Step 6. Constant restrictions: `staticFilters` and `staticLimits`

- `staticLimits: { City: 3 }` caps every list of cities at 3 items for everybody, whatever `pagination` asks for (`pagination: { first: 10 }` → 3 items) ✅. Counts are not capped: `CityCount` is 5 ✅.
- `staticFilters: { City: { published: true } }` adds a constant condition to every action on the entity, for every role, on top of the role and personal filters 📖. Use it for rules that hold for everybody (e.g. soft-deleted records).

### Step 7. Subscriptions

`filters` and personal filters do not apply to events. With `filters` and subscriptions available, `composeServersideConfig` requires `subscribePayloadFilters` of the same shape: `Not found "subscribePayloadFilters" to use with "filters" for subscriptions: "City"!` ✅. They are applied to the payload of every event and may use only fields of the entity itself. A subscription is authorized once, when the client subscribes (part 9, step 6).

### Step 8. What a client sees on denial

There is no "access denied" error by design ✅:

- a single-entity query returns `null`, a list `[]`, a count `0`, a child field `null` / `[]`, a subscription sends nothing;
- a mutation of a denied entity or action returns `null`, which the non-null result turns into `Cannot return null for non-nullable field Mutation.updateCity.` ✅; nothing is written.

The client cannot tell "not found" from "not allowed". Two things are left to your code 📖:

- custom resolvers (part 7) are called even on denial, with `null` in `resolverOptions.involvedFilters`: check it and return `null` / `[]`;
- `workOutMutations` and resolvers called from code with `involvedFilters: { inputOutputFilterAndLimit: [[]] }` bypass authorization: call them only from trusted server code.

### Checklist

- [ ] the server-side config is built with `composeServersideConfig`;
- [ ] `getUserAttributes` returns a role for anonymous users (e.g. `guest`), never `null`; with `personalFilters` also the id of a service guest `User` record;
- [ ] every role is in `containedRoles` and `inventoryByRoles`; role inventories fit into the general one (exclude subscriptions if they are excluded there); `addChildActions` where relation fields are needed;
- [ ] `filters` cover every entity used by the roles; `[]` full access, `null` none; no exceptions for known roles;
- [ ] with `personalFilters` every user who must see such entities, the guest included, has an `id` and a `User` record (`{}` for no personal restriction); no `id`, an empty filter field or a missing record means no access;
- [ ] `subscribePayloadFilters` next to `filters` when subscriptions are available;
- [ ] custom resolvers check `involvedFilters` for `null`.

---

[← Part 9](09-subscriptions.md) · [Contents](README.md) · [Part 11 →](11-transactions.md)
