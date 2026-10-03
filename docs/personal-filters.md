# Personal filters

> `serversideConfig.personalFilters` restrict access to an entity by a filter stored in the graphql-fns database for every user; `skipPersonalFilter` switches it off for some users.
> Identifiers: `PF…` facts. Marks: ✅ verified by running code or tests (`src/resolvers/utils/executeAuthorisation/composePersonalFilter/personalFilters.mtest.ts`); 📖 conclusion from reading the code only.

## 1. Shape

```ts
personalFilters?: {
  // [user entity name, pointer to the filter entity or "id", filter field name]
  [tangibleEntityName: string]: [string, string, string];
};
skipPersonalFilter?: (entityName: string, userAttributes: Record<string, any>) => boolean;
```

- `City: ['User', 'id', 'cityFilter']`: the filter is the `cityFilter` filter field of the `User` record with `id = userAttributes.id`.
- `City: ['User', 'group', 'cityFilter']`: the filter is the `cityFilter` filter field of the record the `group` field of that `User` record points to.

## 2. Startup checks (`composeServersideConfig`)

| ID | Fact |
|---|---|
| PF1 | 📖 `personalFilters` require `getUserAttributes`; `skipPersonalFilter` requires `personalFilters`. |
| PF2 | 📖 Every key must be an entity used by the inventory (`Found redundant entity … in "personalFilters"`); the user entity must exist and be tangible. |
| PF3 | 📖 With the pointer `id`, the filter field must be an **array** filter field of the user entity. With another pointer, it must be a scalar (not array) relational or duplex field of the user entity, and the filter field must be an array filter field of the entity it points to. |

## 3. Computing the filter (`composePersonalFilter`)

`executeAuthorisation` (and `executeNodeAuthorisation` for `node`) calls `composePersonalFilter` once per request action for every involved entity that has a personal filter; the result (`personalCalculatedFilters`) is:

| Result | Meaning |
|---|---|
| `{}` | no personal restriction |
| object | a where filter (graphql-fns format, mongo ids) |
| `null` | no access to the entity |

Steps, in this order:

| ID | Step | Result |
|---|---|---|
| PF4 | ✅ The entity has no personal filter | `{}` |
| PF5 | ✅ `userAttributes.id` is absent (e.g. an anonymous user `{ roles: ['guest'] }`) | `null`, before `skipPersonalFilter` is asked (asking it first would let a callback written only for users with `id` open access). So a user without `id` gets no access to entities with a personal filter; other entities and requests are not affected. To give guests access to them, return the id of a service guest User record (PF14). |
| PF6 | ✅ `skipPersonalFilter(entityName, userAttributes)` returns `true` | `{}`; the User record is not read, so it may be absent |
| PF7 | ✅ Pointer `id` (`personalFilterFromUserEntity`): the User record is read by `whereOne: { id }` with full access (`inputOutputFilterAndLimit: [[]]`) and projection of the filter field only. No record → `null` | the filter field value |
| PF8 | ✅ Other pointer (`personalFilterFromFilterEntity`): the User record is read the same way with projection of the pointer; no record or no pointer → `null`. Then the record it points to is read; no record (e.g. deleted) → `null` | the filter field value |
| PF9 | ✅ The filter field value is empty (not set / `null`) → `null`; otherwise `JSON.parse` of the stored string. So a stored `'{}'` means "no personal restriction" (📖 the mutation data `cityFilter: {}` stores it) | `null` / object |

The filter field is stored as a JSON string of the where input with mongo ids (`processCreateInputData`: `JSON.stringify(whereFromGlobalIds(…))`), so `composeQueryResolver` returns it as a string.

📖 `personalCalculatedFilters[entityName]` is recomputed if the previous result was `null` (the cache check is `!personalCalculatedFilters[entityName]`); only extra reads, the result is the same.

## 4. Combining with other filters

| ID | Fact |
|---|---|
| PF10 | ✅ A `null` personal filter denies access even when role `filters` give full access (`[]`): the involved filter becomes `null` (lists return `[]`, a single entity `null`, see A10 in [schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md)). |
| PF11 | ✅ Otherwise the personal filter is combined with the role filters (and `staticFilters`) by AND (`injectStaticOrPersonalFilter`): `[{ AND: [personalFilter, roleFilters] }]`, role filters of several roles being joined by OR first. `{}` leaves the role filters as they are. |
| PF12 | ✅ Child fields are restricted the same way: `Countries { cities }` returns only the cities allowed for the user. |
| PF13 | 📖 Subscription events are not checked by `personalFilters` ([schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md) A5): only `subscribePayloadFilters` are applied to the payload. |
| PF14 | ✅ Guests: with the id of a guest User record whose filter field is `'{}'`, the guest sees what the `guest` role filters allow (tested); an absent guest record means no access (PF7). |
