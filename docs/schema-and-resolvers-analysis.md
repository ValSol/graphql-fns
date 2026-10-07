# GraphQL schema and resolver generation in graphql-fns: analysis

> Every statement has an identifier (`E…` entities, `F…` fields, `Q…/M…/S…` actions, `C…` child fields, `G…` generation filters, `DD…` design decisions, `?…` open questions, `A…` authorization). To agree, object or clarify, just refer to the ID.
> Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.

## 0. Overall pipeline

```
SimplifiedEntityConfig[] ──composeAllEntityConfigs──▶ allEntityConfigs (+ PageInfo, Edge, Connection, Payloads)
                                                        │
GeneralConfig { allEntityConfigs, enums, inventory, representations, custom, interfaces, manualyUsedEntities }
                                                        │
composeTypeDefsAndResolvers(generalConfig, serversideConfig)
   ├─ composeGqlTypes(generalConfig)            → typeDefs (SDL string) + entityTypeDic
   └─ composeGqlResolvers(generalConfig, entityTypeDic, serversideConfig) → resolvers
```

Order of steps in `composeGqlTypes` (`src/types/composeGqlTypes.ts`):
1. `composeActionSignature` is called for every standard action (`queryAttributes` / `mutationAttributes` / `subscriptionAttributes`, files `src/types/actionAttributes/*`) and every entity. A signature appears only if:
   `!actionIsChild && actionAllowed(entityConfig) && checkRepresentationAction(...)` (the latter means `checkInventory([actionType, actionName, entity], inventory)`).
   Along the way it fills `inputDic` (input types) and `entityTypeDic` (types of the entities the action returns, recursively via `fillEntityTypeDic`).
2. Custom and representation actions: `mergeRepresentationIntoCustom` → `composeCustomActionSignature`, **for tangible entities only**.
3. `processManualyUsedEntities` adds types of entities not reachable from any action.
4. `interface`s are built (`composeInterfaceTypeDic`).
5. The result is assembled as: `scalar DateTime`, `scalar Upload`, `interface Node`, `input RegExp`, `input SliceInput`, enums (`XEnumeration`), geospatial types, interfaces, entity types, inputs, `type Query { node(id: ID!): Node … }`, `type Mutation`, `type Subscription`.

Key point: **an entity type gets into the SDL only if it is reachable** from some action, child field or `manualyUsedEntities`.

Caching: outside jest intermediate results are cached, but separately for every `generalConfig` / `serversideConfig` / `entityConfig` object (`src/utils/createObjectBoundStore.ts`). A repeated call with the same objects returns the cached result, while a different config gets its own.

---

## 1. Entity types

| ID | Type | Source | Generated SDL | Actions |
|---|---|---|---|---|
| E1 | **tangible** (default, `type` may be omitted) | user | `type X implements Node & …interfaces { id: ID!, createdAt: DateTime!, updatedAt: DateTime!, [counter: Int!], …fields }` | all root Query/Mutation/Subscription actions (§3–5) |
| E2 | **embedded** | user | `type X [implements …] { id: ID!, …fields }` (no createdAt/updatedAt) | no root actions; only fields in tangible entities (`embeddedFields`) and `arrayEntitiesThroughConnection` / `arrayEntityCount` as child fields |
| E3 | **virtual** | user | `type X { …fields, childFields }` without `id` | no actions; used as the return type of custom actions, `calculatedFields(virtualFields)` and `subscriptionActor` |
| E4 | `PageInfo` (virtual) | built-in (`pageInfoConfig.ts`) | standard PageInfo | — |
| E5 | `XEdge` (virtual) | auto for tangible **and** embedded | `node: X!`, `cursor: String!` | — |
| E6 | `XConnection` (virtual) | auto for tangible and embedded | `pageInfo: PageInfo!`, `edges: [XEdge!]!` | returned by `XsThroughConnection` and child `…ThroughConnection` fields |
| E7 | `XUpdatedPayload` (virtual) | auto for tangible | `node: X`, `previousNode: X` (a state that does not pass the filters of the subscriber is `null`), `updatedFields: [String!]!`, `[actor: Actor]` | return type of `updatedX` |
| E8 | `XCreatedOrDeletedPayload` (virtual) | auto for tangible | `node: X!`, `[actor: Actor]` | return type of `createdX` / `deletedX` |
| E9 | **representation** config `X{Key}` (or with `representationNameSlicePosition`, e.g. `XKeyConnection`) | `generalConfig.representations[Key]` | a copy of X with include/exclude/add/freeze/unfreeze fields and relational/duplex/filter/child references replaced by `Y{Key}` | `…{Key}` actions from `allow[X]` |

Name restrictions (`composeAllEntityConfigs`, `composeEntityConfig`): no `_`, no plural (`pluralize(name) === name`), not `DateTime/Node/node/PageInfo`. Fields cannot contain `_`, cannot end with `ThroughConnection` / `GetOrCreate` / `DistinctValues` / (for arrays) `Count`, and filter fields cannot end with `Stringified`. Reserved names `id, createdAt, updatedAt, counter, in, nin, …, connect, create, pageInfo` are forbidden (except in virtual entities). `freeze` is forbidden in embedded/virtual entities.

---

## 2. Field kinds and how they are mapped

| ID | Field kind | In the type (output) | CreateInput | UpdateInput (without `freeze`) | WhereInput (only with `index`/`unique`) |
|---|---|---|---|---|---|
| F1 | text/int/float/dateTime/boolean | `String/Int/Float/DateTime/Boolean`, array: `name(slice: SliceInput): [T!]!` | yes | yes | `name`, `_in/_nin/_ne/_gt…/_re`, `_exists`/`_size` (boolean: only `name`, `_ne`) |
| F2 | enum | `{enumName}Enumeration` | yes | yes | `name,_in,_nin,_ne,_re`… |
| F3 | geospatial | `Geospatial{Point\|LineString\|…}` | `Geospatial…Input` | yes | Point: `_withinPolygon/…/_aroundLineString`; others: `_intersects…` |
| F4 | embedded | `name: E` / `name(slice): [E!]!` + `connection` (`nameThroughConnection`) and `count` (`nameCount`) variants | `ECreateInput` | `EUpdateInput` | `name: EWhereInput` |
| F5 | relational (tangible→tangible) | child fields C1/C2 | `YCreateChildInput` / `YCreateOrPushChildrenInput` (`connect`/`create`) | same | `name, _in, _nin, _ne, name_: YWhereWithoutBooleanOperationsInput` |
| F6 | **parent relational** (added automatically to Y as the opposite of every relational X→Y) | array: C1 | — | — | `name_: …WhereWithoutBooleanOperationsInput` if the opposite field has `index` |
| F7 | duplex (two-way link) | C1/C2 (+C3 GetOrCreate) | like F5, but if the opposite field is `required`: `YCreateThru_{opp}_FieldChildInput` / `YCreateOrPushThru_{opp}_FieldChildrenInput` (in Create and Update; in such an input the opposite field is optional and filled with the parent id) | as Create | as F5 |
| F8 | filter (stores a filter on Y as a string) | `variants: plain` → C1/C2; `stringified` → `nameStringified: String` | array: `YWhereInput`, scalar: `YWhereOneInput` (frozen ones too, DD7) | yes (without frozen) | — |
| F9 | calculated | per `calculatedType`, with `inputTypes` arguments (+`slice` for arrays); `filterFields` as C1/C2 | — | — | — (but yes in WherePayloadInput) |
| F10 | child (virtual only) | `name: Y` / `[Y!]!` | — | — | — |

---

## 3. Root Query (for tangible `X`; plural `Xs` via `pluralize`)

| ID | actionName | SDL | When present | Resolver creator |
|---|---|---|---|---|
| Q0 | — | `node(id: ID!): Node` (exactly this signature: Relay requires it, e.g. for `@refetchable` fragments, DD4) | always | `createNodeQueryResolver` |
| Q1 | `entity` | `X(whereOne: XWhereOneInput[!], whereCompoundOne: XWhereCompoundOneInput, token: String): X` | tangible (`whereOne` has `!` if there are no `uniqueCompoundIndexes`; `whereCompoundOne` exists only with them; see [where-compound-one.md](./where-compound-one.md)) | `createEntityQueryResolver` |
| Q2 | `entities` | `Xs(where, sort, pagination, near?, search?, token): [X!]!` | tangible | `createEntitiesQueryResolver` |
| Q3 | `entitiesThroughConnection` | `XsThroughConnection(where, sort, near?, search?, after, before, first, last, token): XConnection!` | tangible | `createEntitiesThroughConnectionQueryResolver` |
| Q4 | `entitiesByUnique` | `XsByUnique(where: XWhereByUniqueInput!, sort, near?, search?, token): [X!]!` | tangible | `createEntitiesByUniqueQueryResolver` |
| Q5 | `entityCount` | `XCount(where, search?, token): Int!` | tangible | `createEntityCountQueryResolver` |
| Q6 | `entityDistinctValues` | `XDistinctValues(where, search?, options: XDistinctValuesOptionsInput!, token): [String!]!` | tangible, **if it has indexed text (`index`/`unique`) or enum (`index`) fields** | `createEntityDistinctValuesQueryResolver` |
| Q7 | `entityCounts` | `XCounts(where, restrictedWhere: [XRestrictedWhereInput!]!, search?, token): [Int!]!` (one count per item of `restrictedWhere` within `where`; `XRestrictedWhereInput` is `XWhereInput` without relational filters `x_`; see [entity-counts.md](./entity-counts.md)) | tangible | `createEntityCountsQueryResolver` |
| Q8 | `entityExistences` | `XExistences(whereAndSearch: [XWhereAndSearchInput!]!, token): [Boolean!]!` (whether at least one entity is selected by each pair of `where` and `search`; `input XWhereAndSearchInput { where: XWhereInput = {}, search: String }`, `search` only if there is a textField with `weight`; see [entity-existences.md](./entity-existences.md)) | tangible | `createEntityExistencesQueryResolver` |
| Q9 | `entityManyDistinctValues` | `XManyDistinctValues(where, restrictedWhereAndTarget: [XRestrictedWhereAndTargetInput!]!, search?, token): [[String!]!]!` (one list of distinct values per item, within `where`; `input XRestrictedWhereAndTargetInput { target: XTextNamesEnum!, where: XRestrictedWhereInput }`; see [entity-many-distinct-values.md](./entity-many-distinct-values.md)) | as Q6 | `createEntityManyDistinctValuesQueryResolver` |

`near?` → only if there is a geospatial field with `index`; `search?` → only if there is a textField with `weight`. `sort` is always present (id/createdAt/updatedAt + indexed scalar fields).

✅ `XWhereCompoundOneInput` contains only the fields listed in `uniqueCompoundIndexes` (all of them, of all indexes, all optional), without `…_exists`. Exactly one of `whereOne` / `whereCompoundOne` is required at runtime; the keys of `whereCompoundOne` must be **exactly** the fields of one index (`checkWhereCompoundOne`), and a field passed as `null` matches an absent value. `composeEntityConfig` allows in `uniqueCompoundIndexes` only text, int, float, dateTime, relational (not `parent`) and duplex fields and rejects an empty array; a representation keeps `uniqueCompoundIndexes` only if all fields of all indexes are left in it, otherwise it has none.

## 4. Mutation (for tangible `X`)

| ID | actionName | SDL (args → return) | Extra `actionAllowed` condition | Publishes a subscription event? |
|---|---|---|---|---|
| M1 | `createEntity` | `createX(data: XCreateInput!, token)` → `X!` | — | ✅ `created` |
| M2 | `createManyEntities` | `createManyXs(data: [XCreateInput!]!, token)` → `[X!]!` | — | ❌ |
| M3 | `updateEntity` | `updateX(whereOne: XWhereOneInput!, data: XUpdateInput!, token)` → `X!` (***) | — | ✅ `updated` |
| M4 | `updateManyEntities` | `updateManyXs(whereOneAndData: [XWhereOneAndDataInput!]!, token)` → `[X!]!` (***) | — | ❌ |
| M5 | `updateFilteredEntities` | `updateFilteredXs(where, near?, search?, data: XUpdateInput!, token)` → `[X!]!` | — | ❌ |
| M6 | `updateFilteredEntitiesReturnScalar` | `updateFilteredXsReturnScalar(where, near?, search?, data!, token)` → `Int!` | — | ❌ |
| M8 | `deleteEntity` | `deleteX(whereOne!, token)` → `X!` (***) | — | ✅ `deleted` |
| M9 | `deleteManyEntities` | `deleteManyXs(whereOne: [..!]!, token)` → `[X!]!` (***) | — | ❌ |
| M10 | `deleteFilteredEntities` | `deleteFilteredXs(where, near?, search?, token)` → `[X!]!` | — | ❌ |
| M11 | `deleteFilteredEntitiesReturnScalar` | `…ReturnScalar(where, near?, search?, token)` → `Int!` | — | ❌ |
| M12 | `deleteEntityWithChildren` | `deleteXWithChildren(whereOne!, options: deleteXWithChildrenOptionsInput, token)` → `X!` (***) | has "children" (*) | ❌ |
| M13 | `deleteManyEntitiesWithChildren` | `deleteManyXsWithChildren(whereOne: [..!]!, options, token)` → `[X!]!` (***) | (*) | ❌ |
| M14 | `deleteFilteredEntitiesWithChildren` | `deleteFilteredXsWithChildren(where, near?, search?, options, token)` → `[X!]!` | (*) | ❌ |
| M15 | `deleteFilteredEntitiesWithChildrenReturnScalar` | `…(where, near?, search?, options, token)` → `Int!` | (*) | ❌ |
| M16 | `copyEntity` | `copyX(whereKeyToSource: XWhereKeyToSourceInput!, options: copyXOptionsInput, whereTarget: XWhereOneInput, whereCompoundTarget: XWhereCompoundOneInput, data: XUpdateInput, token)` → `X!` (****) | (**) | ❌ |
| M17 | `copyManyEntities` | `copyManyXs(sourceAndTargetAndData: [XCopySourceAndTargetAndDataInput!]!, sourceAndCompoundTargetAndData: [..!], options, token)` → `[X!]!` (****) | (**) | ❌ |
| M18 | `copyEntityWithChildren` | `copyXWithChildren(whereKeyToSource!, options, whereTarget, whereCompoundTarget, token)` → `X!` (****) | (**) and (*) | ❌ |
| M19 | `copyManyEntitiesWithChildren` | `copyManyXsWithChildren(sourceAndTarget: [XCopySourceAndTargetInput!]!, sourceAndCompoundTarget: [..!], options, token)` → `[X!]!` (****) | (**) and (*) | ❌ |

(*) "Children" are records X refers to through duplex fields with **`parent: true`** whose opposite field is **scalar** (`getNotArrayOppositeDuplexFields`: `parent && !oppositeArray`). The same condition (the `getChildDuplexFields` util) is used both by the schema (`actionAllowed` of all `…WithChildren` mutations, the `deleteXWithChildrenOptionsInput` enum) and at runtime (deleting with children in `processFieldToDelete`, copying the tree in `composeCreateTree`).
(**) There is a duplex field `f` for which `getMatchingFields(X, Y)` yields at least one field other than `f` (i.e. X and Y have same-named fields that can be copied).
(***) ✅ If X has `uniqueCompoundIndexes`, `whereOne` loses `!` (`XWhereOneInput` / `[XWhereOneInput!]`) and `whereCompoundOne: XWhereCompoundOneInput` (`[XWhereCompoundOneInput!]` for `…Many…`) is added, as in Q1. Exactly one of the two is required at runtime. `updateManyXs` has `whereOneAndData` / `whereCompoundOneAndData` instead: items pair the selector with `data` ([paired-items-args.md](./paired-items-args.md)). Items of `whereCompoundOne` may use different indexes, mixing `whereOne` and `whereCompoundOne` in one call is not possible. Not found by `whereCompoundOne` gives the same result as not found by `whereOne`. Details: [where-compound-one.md](./where-compound-one.md).
(****) ✅ `whereCompoundTarget` (alternative to `whereTarget`, exactly one of them or none) exists if X can be a copy target and has `uniqueCompoundIndexes`; not found → `Not found "X" entity to copy to: …`, as for `whereTarget`. `whereKeyToSource` has no compound variant (DD11). In `copyMany…` the source, the target and `data` are paired in items of `sourceAndTarget…` / `sourceAndCompoundTarget…` ([paired-items-args.md](./paired-items-args.md)).

All mutations except `workOutMutations` are built by `composeStandardMutationResolver(resolverAttributes)`: the loop `getPrevious → prepareBulkData → unwindCore → addPeripheryToCore → optimizeBulkItems → incCounters → executeBulkItems`, then `produceResult`, `report` (publishing to pubsub) and `finalResult`. The whole transaction is retried (up to 7 attempts with backoff) only for errors labelled `TransientTransactionError` / `WriteConflict` and only when `serversideConfig.transactions` is enabled; on `UnknownTransactionCommitResult` only `commitTransaction` is retried. Other errors are rethrown as is. The same rule applies to `workOutMutations`.

**`lockedData` in `workOutMutations`** is optimistic locking (not part of the GraphQL schema). Before the mutation `checkLockedData` runs the standard query of the entity the mutation changes (for `copy…`, the X being copied into) with `lockedData.args` and compares the result with `lockedData.result`: if `result` is an object or `null`, `X(whereOne | whereCompoundOne)` is called; if it is an array, `Xs(where, sort, …)` is called and results are compared **by index**, so for arrays `lockedData.args` should include `sort`, otherwise the MongoDB order is not guaranteed and the check may fail spuriously. `whereOne` in `lockedData.args` is an argument of the `X` query, not the `whereTarget` of `copy…` mutations. ✅ `whereCompoundOne` works both in `lockedData.args` and in `args` of the mutations of `workOutMutations` (with mongo ids).

Results of `…Many…` mutations are returned in the order of MongoDB, **not** in the order of `whereOne` / `whereCompoundOne` / `whereOneAndData` / `sourceAnd…Target…` items, for `whereOne` as well: ✅ `updateManyXs`, `copyManyXs` (`produceResult` reads them by `id_in`); 📖 `deleteManyXs` (returns what `getPrevious` found by `$in`/`OR`).

## 5. Subscription (for tangible `X`)

| ID | SDL | pubsub channel |
|---|---|---|
| S1 | `createdX(wherePayload: XWherePayloadInput): XCreatedOrDeletedPayload!` | `created-X` |
| S2 | `deletedX(wherePayload): XCreatedOrDeletedPayload!` | `deleted-X` |
| S3 | `updatedX(wherePayload, whichUpdated: XWhichUpdatedInput): XUpdatedPayload!` | `updated-X` |

`XWherePayloadInput` is built from all fields (no `index` required) + calculated fields without `async: true` (or listed in `allowedCalculatedWithAsyncFuncFieldNames`). Calculated fields with `calculatedType: 'virtualFields'` are **not** included in the filter (DD5). The runtime filter uses the same set of fields (`composeSubscriptionDummyEntityConfig`). An event is sent if it matches both the client `wherePayload` and the `subscribePayloadFilters` of the user's roles; for `updatedX` each state is checked separately, the event is sent if `previousNode` or `node` matches, and the state that does not is sent as `null` (`node` and `previousNode` of `XUpdatedPayload` are nullable); `whichUpdated` additionally filters `updatedX` by the changed fields. Authorization runs once, on subscribe (§11); if the user has no access to the subscription, no events are sent.

## 6. Child fields inside type X (`createEntityType`)

For relational (including parent), duplex, filter (`plain`) and calculated (`filterFields`) fields pointing to Y:

| ID | Field | Condition | SDL | Field resolver (`composeEntityResolvers`) |
|---|---|---|---|---|
| C1 | array | `childEntities` allowed | `f(where, sort, pagination, near?, search?): [Y!]!` | relational/duplex: `createEntityArrayResolver`; parent relational: `createEntityOppositeRelationArrayResolver`; filter: `createEntityFilterArrayResolver` |
| C1a | array | `childEntitiesThroughConnection` | `fThroughConnection(where, sort, near?, search?, after, before, first, last): YConnection!` | `…ConnectionResolver` (3 variants, as above) |
| C1b | array | `childEntityCount` | `fCount(where, search?): Int!` | `…CountResolver` |
| C1c | array | `childEntityDistinctValues` and Y has indexed text/enum fields | `fDistinctValues(where, search?, options!): [String!]!` | `…DistinctValuesResolver` |
| C2 | scalar | `childEntity` allowed (`checkRepresentationAction`, the same check as for the resolver) | `f: Y[!]` | `createEntityScalarResolver` / `createEntityFilterScalarResolver` |
| C3 | duplex scalar, not `required`, scalar opposite field | `childEntityGetOrCreate` | `fGetOrCreate(data: YCreateInput!): Y` (`whereOne` hidden) | `createEntityGetOrCreateResolver` |
| C4 | embedded array | `variants` | `plain`: `f(slice): [E!]!`; `connection`: `fThroughConnection(after,before,first,last): EConnection!`; `count`: `fCount: Int!` | `fieldArrayResolver` / `fieldArrayThroughConnectionResolver` / `fieldArrayCountResolver` |
| C5 | any other array field | — | `f(slice: SliceInput)` | `fieldArrayResolver` |
| C6 | geospatial | — | `Geospatial…` | regular fields: `…FromMongoToGql` converters; calculated: the field resolver of the calculated field without conversion (`func` returns the GraphQL format, [calculated-fields.md](./calculated-fields.md) CF11), arrays: `fieldArrayResolver` |
| C7 | filter `stringified` | — | `fStringified: String` | `fieldFilterStringifiedResolver` |

Field resolvers (`composeEntityResolvers`) are created for **every** entity whose type is in the SDL: tangible, embedded, virtual and their representation versions. Empty sets are not added.

Child fields and their resolvers appear only if the action is possible for Y (`actionAllowed`, checked in `checkRepresentationAction`) and allowed by inventory/representation.

Every child field resolver internally wraps the corresponding `createChildEntity*QueryResolver` Query resolver via `resolverDecorator`, and for representation configs via `createCustomResolver('Query', 'childEntity…{Key}')`.

---

## 7. Filters that control generation

| ID | Mechanism | Where it applies |
|---|---|---|
| G1 | `actionAllowed(entityConfig)` | both types and resolvers (consistent) |
| G2 | `inventory` (`include`/`exclude`, chain `[Kind, action, entity]`; `include` restricts on every level, `exclude` excludes only a fully covered chain, `exclude: true` excludes everything) | types: `checkRepresentationAction` (for both root actions and child fields); resolvers: every creator calls `checkInventory` and returns `null`; at runtime roles are checked via `inventoryByRoles` in `executeAuthorisation` |
| G3 | `representation[Key].allow[X]`: a list of actions | types + resolvers (via `mergeRepresentationIntoCustom` → custom actions named `${action}${Key}`) |
| G4 | `custom.{Input,Query,Mutation}` + `serversideConfig.{Query,Mutation}`: "custom" here means non-standard, manually defined actions (as opposed to the standard ones generated from `actionAttributes`); representation actions are internally converted to custom actions too (G3) | signature: tangible only; resolver: `createCustomResolver` also tangible only; `custom.Subscription` is forbidden (DD6) |
| G5 | `manualyUsedEntities` | adds the type even if it is not reachable |

Runtime decorator chain ([resolver-decorators.md](./resolver-decorators.md)): `resolverDecorator` → `transformBefore` (global ids → mongo ids, transformers chosen by the argument type suffix) → `authDecorator` (`executeAuthorisation`: inventoryByRoles, filters, staticFilters, personalFilters → `involvedFilters`, `subscriptionEntityNames`) → resolver → `transformAfter` (global ids).

---

## 8. Design decisions

| ID | Decision |
|---|---|
| DD1 | Subscription events are published only by `createEntity`, `updateEntity`, `deleteEntity`. Bulk mutations (`createMany…`, `updateMany/Filtered…`, `deleteMany/Filtered/WithChildren…`, `copy…`) publish no events. |
| DD2 | `freezedFields[X]` of a representation makes **exactly** the listed fields frozen (the rest get `freeze: false`, even if frozen in the base config); `unfreezedFields` works the other way round. If both are set, the last one wins. |
| DD3 | `XCount`, `XCounts`, `XExistences`, `XDistinctValues`, `XManyDistinctValues` have no `near`: `near` not only selects but also sorts by distance, which they do not need; for selection without sorting there are the geospatial filters of `where` (e.g. `coordinates_withinSphere`). |
| DD4 | `node(id: ID!): Node` has no `token` argument (Relay compiler requires exactly this signature: `Invalid use of @refetchable … has a node(id: ID): Node field`), so `node` takes authentication from `context` (cookies / headers) only. |
| DD5 | Calculated fields with `calculatedType: 'virtualFields'` are not in `XWherePayloadInput`: events are not filtered by them. |
| DD6 | Custom subscriptions are not supported: `custom.Subscription` in `generalConfig` throws `Custom subscriptions are not supported: remove "Subscription" from "custom" of generalConfig!`; only standard and representation subscriptions exist. |
| DD7 | Frozen filter fields are in `XCreateInput` (`freeze` forbids only changes). Array fields are changed by `updateX` with the whole new array. |
| DD8 | In `XWhereOneInput`, `XWhereByUniqueInput` and `XWhereCompoundOneInput` a unique text field has type `String`. |
| DD9 | `composeAllEntityConfigs` throws a `TypeError` if `configName` of a relational/duplex field does not point to a tangible entity or `oppositeName` of the opposite field does not point back to the field. |
| DD10 | `copyXWithChildren` / `copyManyXsWithChildren` have no `data`: they copy the tree of children (§10). |
| DD11 | `whereKeyToSource` of `copy…` selects the source only by its `WhereOneInput`; there is no compound variant. |

## 9. Open questions

| ID | Question |
|---|---|
| ?1 | `childEntityGetOrCreate` has `actionType: 'Query'` but may create a record: writing data in a Query field. |
| ?2 | `data` of `copy…` has type `XUpdateInput` also when a copy is created: frozen fields of a new copy cannot be set via `data`, and required X fields that are not among the common fields are not checked by the schema (the error appears only on write). |

---

## 10. `copy…` mutations

> 📖 Established by reading the code.

### 10.1. What they do

Copying follows a **duplex link** between two tangible entities: `X` (the target) has a duplex field `f` pointing to `Y` (the source), and `Y` has an opposite field `g` pointing to `X`. **Common fields** are copied: same-named fields of X and Y, except `f` itself and calculated fields (`getMatchingFields`).

```
Menu        { name, description, clone ↔ MenuClone.original }
MenuClone   { name, description, original ↔ Menu.clone }
```

`copyMenuClone(whereKeyToSource: { original: { id: "<Menu id>" } })` takes the `Menu` and transfers its `name` and `description` to the `MenuClone` linked to this `Menu`.

### 10.2. Arguments

| Argument | Type (`copyX`) | Meaning |
|---|---|---|
| `whereKeyToSource` | `XWhereKeyToSourceInput!`, exactly one key `{ f: YWhereOneInput }` | **Where to copy from**: selects the duplex field `f` and a specific Y record |
| `options` | `copyXOptionsInput` = `{ f: { fieldsToCopy \| fieldsForbiddenToCopy } }` | Restricts the set of common fields; the key must match the `whereKeyToSource` key |
| `whereTarget` | `XWhereOneInput` (the same type as `whereOne` of `X` / `updateX`) | **Where to copy to** (which existing X to update); needed only in mode B |
| `whereCompoundTarget` | `XWhereCompoundOneInput` | Alternative to `whereTarget` ([where-compound-one.md](./where-compound-one.md) WC6) |
| `data` | `XUpdateInput` | Additional values for X applied on top of the copied ones (?2) |
| `token` | `String` | The usual token |

### 10.3. Two modes depending on the opposite field `g`

- **Mode A: `g` is scalar (1:1).** If `Y.g` already points to an X, that X is **updated** with the copied fields; if `Y.g` is empty, a new X linked to Y is **created**. `whereTarget` is forbidden (`Needless whereTarget arg!`), since X is uniquely determined.
- **Mode B: `g` is an array (1:N).** Without `whereTarget` a new X linked to Y is **created**. With `whereTarget` the specified X is **updated**; it must already be linked to Y (`Try to copy to unconnected …`).

Hence `whereTarget` is optional, and it is added to the signature only when X has a duplex field with common fields and an array opposite field (mode B is possible; `src/utils/canBeCopyTarget.ts`).

### 10.4. Mutation variants

| Mutation | Arguments | Notes |
|---|---|---|
| `copyX` | `whereKeyToSource!`, `options`, `whereTarget`, `whereCompoundTarget`, `data` | — |
| `copyManyXs` | `sourceAndTargetAndData: [XCopySourceAndTargetAndDataInput!]!` (or `sourceAndCompoundTargetAndData`), `options` | an item pairs `whereKeyToSource`, the target and `data` of one copy ([paired-items-args.md](./paired-items-args.md)) |
| `copyXWithChildren` | `whereKeyToSource!`, `options`, `whereTarget`, `whereCompoundTarget` | no `data` (DD10); also copies the tree of "children" (*) |
| `copyManyXsWithChildren` | `sourceAndTarget: [XCopySourceAndTargetInput!]!` (or `sourceAndCompoundTarget`), `options` | the same for a list |

(*) "Children" are records Y refers to through duplex fields with **`parent: true`** and a scalar opposite field (`getNotArrayOppositeDuplexFields`). Only child fields that are common to X and Y and have `parent: true` with a scalar opposite field in both entities are copied (`composeCreateTree`). Copies of them are created recursively and linked to the new or updated X; on update, old children of X absent in Y are deleted (`composeCreateTree` + `mixTrees`). Fields without `parent: true` are not treated as children: the record they refer to is not copied (nor deleted in `delete…WithChildren`).

In `copyMany…` the records are matched with the items, not by the order of MongoDB results: every source is fetched separately, and results fetched by `$in` are ordered by the ids.

## 11. User authorization

Integration with better-auth is described separately: [better-auth-integration.md](./better-auth-integration.md).

### 11.1. Pipeline

Every generated resolver (root queries, mutations, subscriptions, child field resolvers) is wrapped by `authDecorator` → `executeAuthorisation`. For `node`, `executeNodeAuthorisation` does the same.

1. **User:** `userAttributes = await getUserAttributes(context, args.token)`, once per (`context`, `token`) pair (§11.3).
2. **Access filters:** `involvedFilters` is built for every entity the action touches (`inputOutputEntity`, `outputEntity`, …).
3. **Execution:** the resolver adds the conditions to the MongoDB query. If there is no access (`null`), the resolver returns `null` and a mutation changes nothing; **there is no GraphQL error**.

### 11.2. Layers

| ID | Layer | Settings | What it does |
|---|---|---|---|
| A1 | Static inventory | `generalConfig.inventory` | Which actions exist; the same for everyone |
| A2 | Roles | `inventoryByRoles` + `containedRoles` | Which actions a role allows. `containedRoles` defines inheritance (`{ admin: ['user'] }`: admin has the permissions of user). An action is allowed if **any** of the user's roles allows it. When `containedRoles` is set, roles absent from it are dropped (for `inventoryByRoles`, `filters`, `subscribePayloadFilters` and `node`) and grant nothing, and a role without `inventoryByRoles` grants no access |
| A3 | Role filters | `filters: { X: ({ role, ...userAttributes }) => null \| InvolvedFilter[] }` | The function is called for every role: `[]` means full access, `null` means the role grants nothing, an array grants access to records matching the conditions. Results of the roles are combined with OR |
| A4 | Additional | `staticFilters`, `staticLimits`, `personalFilters`, `skipPersonalFilter` | A constant filter and limit per entity; the personal filter is taken from a filter field of the graphql-fns User entity (or an entity linked to it) found by `userAttributes.id` and combined with role filters by AND. ✅ No `id`, no User record, no pointer, no linked record or an empty filter field mean no access to the entity (without an error); a stored `{}` means no personal restriction; `skipPersonalFilter` switches the personal filter off, but only for users with `id`. Details: [personal-filters.md](./personal-filters.md) |
| A5 | Subscriptions | `subscribePayloadFilters` | The same kind of functions, applied to the payload of every event; for `updatedX` to `previousNode` and `node` separately: the event is sent if one of them passes, the other one is sent as `null`. The subscription itself is authorized once, on `subscribe`: without access to it (`inputOutputFilterAndLimit` is `null`) no events are sent. `filters`, `staticFilters` and `personalFilters` do not apply to events (they may refer to linked entities absent from the payload), so with `filters` and available subscriptions `composeServersideConfig` throws `Not found "subscribePayloadFilters" to use with "filters" for subscriptions: …` unless `subscribePayloadFilters` are set |

`composeServersideConfig` checks consistency at startup: `getUserAttributes` is present for A2–A5, roles in `containedRoles` and `inventoryByRoles` match, filters are correct (calling them for every role with test attributes).

**Contract:** `getUserAttributes: (context, token?: string) => Promise<{ roles: string[]; id?: string; [key: string]: any }>`. `roles` is required, the other fields are passed to `filters` functions next to `role`; `id` is needed only for `personalFilters` and must be the id of a User record in graphql-fns: a user without it (e.g. a guest) gets no access to entities with a personal filter (PF5 in [personal-filters.md](./personal-filters.md)), other requests work; `token` is the value of the `token: String` argument of root queries and mutations; `node` (DD4) and subscriptions have no `token` argument, the user is determined from `context` only.

### 11.3. Caching `userAttributes`

- The cache is bound to the triple (the `getUserAttributes` callback, the `context` object, `token`) via `createObjectBoundStore` (WeakMap), so it is released together with `context`.
- The promise is cached, so parallel resolvers of one request wait for a single call.
- A rejected promise is removed from the cache: the next resolver calls `getUserAttributes` again.
- If `context` is not an object, there is no cache.
- **Requirement:** `context` must be created per request (Apollo Server, graphql-yoga and `graphql-ws` with a `context` function all do so). If `context` lives longer (e.g. one object for a whole WebSocket connection), the attributes are fixed for its whole lifetime.

### 11.4. Risks left to the project

| ID | Summary | What to do |
|---|---|---|
| A6 | Anonymous user: with `filters` or `inventoryByRoles`, a `null` result of `getUserAttributes` causes a `TypeError` | Return `{ id: <guest User id>, roles: ['guest'] }` and describe `guest` in `containedRoles` / `inventoryByRoles` |
| A7 | `personalFilters` read the **graphql-fns** User entity (collection `user_things`), not the user of the external authentication system. ✅ Without a synced record the user has no access to entities with a personal filter (the request does not fail) | Sync a User record with the same `id` (for better-auth: the `databaseHooks.user.create.after` hook) |
| A8 | Subscriptions are authorized once: after a session is revoked or the user is banned, they keep receiving events until reconnecting | Close connections on sign-out/ban; for WebSocket take headers at connection time |
| A9 | `token` in arguments ends up in the request body and from there in logs and the persisted queries cache | For HTTP prefer a cookie / the `Authorization` header; use `token` only for special cases |
| A10 | Access denial returns `null` (queries of a single entity), `[]` / `0` (lists and counts), an empty connection, or no events (subscriptions); the client cannot tell "no access" from "not found". Mutations return `null` for the non-null type `X!`, so the client gets a generic `Cannot return null for non-nullable field` error | By design; take it into account in the UX |
| A11 | Configuration error messages (`Not found "getUserAttributes" callback…`) are sent to the client as GraphQL errors | Mask internal errors at the server level (`formatError` / `maskedErrors`) |
| A12 | Custom (manually defined) resolvers are called even when access is denied: `authDecorator` passes them `involvedFilters` with `null` values (e.g. `inputOutputFilterAndLimit: null`) | Check `involvedFilters` in the custom resolver and return `null` / `[]` on denial |
| A13 | `workOutMutations` bypasses authorization (full access `[[]]`): it is a server-side utility | Call it only from trusted server code, after checking permissions yourself |
| A14 | Minor code issues: the check `if (!involvedFilters) return null` in `authDecorator` never fires (`involvedFilters` is always an object); `limit === limit` in `getFilterFromInvolvedFilters` is always true | Cleanup, no behaviour impact |
