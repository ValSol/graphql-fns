# Resolver decorators: arguments in, results out

> How generated resolvers are wrapped: global ids, argument transformers, result transformation, authorization hand-off.
> Identifiers: `RD…` facts, `?RD…` open questions. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Authorization itself (`executeAuthorisation`) is described in [schema-and-resolvers-analysis.md §13](./schema-and-resolvers-analysis.md#13-user-authorization).

## 1. Layers

Every resolver in the schema is composed of up to three layers:

```
GraphQL executor
  └─ resolverDecorator / customResolverDecorator / subscriptionResolverDecorator
       1. transformBefore(args)            global ids → mongo ids
       2. authDecorator                    executeAuthorisation → involvedFilters, 5th resolver argument
       3. raw resolver                     createEntityQueryResolver, composeStandardMutationResolver, …
       4. transformAfter(result)           mongo ids → global ids, "_token"
```

| ID | Decorator | Used for | File |
|---|---|---|---|
| RD1 | `resolverDecorator` | standard queries and mutations of original entities, child field resolvers (`createEntityArrayResolver`, `createEntityFilter*Resolver`, …) | `src/resolvers/utils/resolverDecorator/index.ts` |
| RD2 | `customResolverDecorator` | custom actions and actions of representations (`createCustomResolver`) | `…/customResolverDecorator.ts` |
| RD3 | `subscriptionResolverDecorator` | standard subscriptions; transforms `wherePayload` only, the payload is transformed in the subscription resolvers | `…/subscriptionResolverDecorator.ts` |

📖 Raw resolvers (from `composeQueryResolver`, `workOutMutations`, …) are **not** decorated: they take and return mongo ids, and their 5th argument (`resolverOptions`) is used as given. That is why programmatic calls pass `{ involvedFilters: { inputOutputFilterAndLimit: [[]] } }` themselves.

## 2. Global ids

| ID | Fact |
|---|---|
| RD4 | 📖 `toGlobalId(id, entityName, representationKey = '')` is `base64("<id>:<entityName>:<representationKey>")`; `fromGlobalId` reverses it and returns `{ _id: null, … }` for an empty or broken id. |
| RD5 | 📖 Clients only see global ids; everything below the decorators works with mongo ids. Filters stored as strings (e.g. values of calculated `filterFields`) contain mongo ids and are converted to global ids by `whereToGlobalIds` right before a child resolver is called, so that the decorator converts them back. |

## 3. `transformBefore`: arguments

`transformBefore(args, argNamesToTransformers)` replaces the arguments that have a transformer and copies the others.

Transformers are chosen by the GraphQL type of the argument without the entity name (📖):

| Argument type suffix | Transformer | Uses entity config |
|---|---|---|
| `CreateInput`, `PushIntoInput`, `UpdateInput` | `transformData`: `id`, `connect` (scalar or array) from global ids; recursive into `create` | no |
| `WhereInput`, `RestrictedWhereInput`, `WhereByUniqueInput`, `WhereCompoundOneInput`, `WhereOneInput` | `whereFromGlobalIds`: `id`, `id_in`, `id_nin`; relational/duplex fields `x`, `x_ne`, `x_in`, `x_nin` (`x_exists` as is); recursive into `x_` (the related entity's where) and `AND`/`OR`/`NOR`; an unknown suffix of a relational field throws | yes (to know relational/duplex fields) |
| `WhereAndSearchInput` | `transformWhereAndSearch`: `whereFromGlobalIds` for `where` of every item (single or list); `search` as is | yes |
| `WhereKeyToSourceInput` | `transformWhereKeyToSource`: `id` of every duplex field key | yes |

| ID | Fact |
|---|---|
| RD6 | 📖 `resolverDecorator` builds the map once per decorated resolver from `actionAttributes.argTypes` composed for the entity with an empty name (`composeArgNamesToTransformers`); `customResolverDecorator` parses the full type names with `getTransformerAndConfig`, which resolves representation names through `parseEntityName` and uses the representation config. |
| RD6a | ✅ Since transformers are chosen by the argument type, `whereCompoundOne` of mutations and `whereCompoundTarget` of `copy…` (single or array, `…WhereCompoundOneInput`) get `whereFromGlobalIds` like `whereCompoundOne` of `X`, so relational/duplex fields of a unique compound index are passed as global ids (tested in `normalizeWhereCompoundOne/whereCompoundOne.mtest.ts`). Items of `whereOneAndData`, `whereCompoundOneAndData` and `sourceAnd…Target…` (`…WhereOneAndDataInput`, `…CopySourceAnd…Input`) go through `transformPairedItems`, which applies the same transformer to every input of an item ([paired-items-args.md](./paired-items-args.md) PI6). |

## 4. `transformAfter`: results

`transformAfter(args, item, entityConfig, generalConfig, isChild = false)` (📖):

- `id` → global id (for embedded/virtual child objects `id` is kept);
- relational and duplex field values → global ids of the related entity;
- child and embedded fields → recursively;
- `_token: args.token` is added: child field resolvers of this entity read `parent._token` and pass it as `token` to the child query, so nested queries are authorized with the same token;
- everything else is copied with rest/spread.

| ID | Fact |
|---|---|
| RD7 | 📖 `resolverDecorator` calls it with `generalConfig = null` (global ids without representation key, entity name from the config), `customResolverDecorator` with `generalConfig` (global ids of representation configs carry the root name and the representation key, from `parseEntityName`). |
| RD8 | 📖 Subscription resolvers call `transformAfter({}, node, entityConfig, generalConfig)` for `node`, `previousNode` and `actor`, so `_token` is `undefined` there. |
| RD9 | ✅ Code that rebuilds an entity after the root resolver passes on the hidden context of calculated fields with `copyCalculatedContext` ([calculated-fields.md](./calculated-fields.md) D5): `transformAfter` and `createNodeQueryResolver` (it adds `__typename` with a spread; fixed `0dd27898`, ?13). Connections keep node references. |
| RD10 | ✅ Entities returned by resolvers are compared with Jest `toEqual` in tests (ours and projects'), and `toEqual` also compares own enumerable `Symbol` properties, so nothing that holds `context`/`info` may be put into an entity as an enumerable property. |

## 5. `authDecorator`: the 5th argument

📖 `authDecorator` runs `executeAuthorisation` and calls the raw resolver with a **new** 5th argument:

- queries and mutations: `{ involvedFilters }`, plus `subscriptionEntityNames` when a mutation can trigger an allowed subscription;
- subscriptions: `{ involvedFilters, subscribePayloadMongoFilter, subscriptionUpdatedFields }`;
- `involvedFilters === null` (no access): returns `null` without calling the resolver.

Options passed by the caller of a decorated resolver are not forwarded. Raw resolvers that delegate to other raw resolvers (connection → list, `childEntities` → list, `node` → single) pass their options on, only `involvedFilters` may be replaced (📖, ✅ for connections and `node`). For updated/deleted subscriptions it also widens the info: the projection gets all fields except calculated fields with `async` (`composeAllFieldsProjection(…, WITHOUT_CALCULATED_WITH_ASYNC)`), so the published node contains what `wherePayload` and `updatedFields` need.

## 6. Caching

📖 Decorated resolvers are cached per `(generalConfig, serversideConfig, actionAttributes | signatureMethods)` and entity name via `createObjectBoundStore`, except under Jest (`JEST_WORKER_ID`). Argument transformer maps are built on the first call.

## 7. Open questions

| ID | Question |
|---|---|
| ?RD1 | ✅ **[fixed `0c4a030d`]** `createResolverCreator` (representation resolvers) cached resolver creators in a module-level object keyed by the action name only and checked `if (!resolverCreator) return null` (always truthy). The cache key now includes the representation key (the creator composes the representation config for calculated fields) and the check is `if (!regularResolver)`. The cache is still module-level: the creator gets the configs as arguments. |
