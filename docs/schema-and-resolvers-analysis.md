# GraphQL schema and resolver generation in graphql-fns: analysis

> Every statement has an identifier (`E…` entities, `F…` fields, `Q…/M…/S…` actions, `C…` child fields, `R…` resolvers, `B…` bugs, `I…` inconsistencies, `?…` questions, `A…` authorization). To agree, object or clarify, just refer to the ID.
> Marks: ✅ verified by running code (a temporary jest probe, already removed); 📖 conclusion from reading the code only.
> Fix status: **[fixed `<commit>`]** next to the ID; all other items are still open.
> The descriptive sections §0–§7 are updated together with the fixes and describe the current behaviour.

**Fix log**

| Commit | What was fixed |
|---|---|
| `2a2e24d4` | B1, B2, B4, partly B8 (`checkInventory` cache): consistent inventory checks in SDL and resolvers |
| `124e7e33` | B3, B5, B5a, B6: field resolvers for all entities, `WherePayloadInput` without calculated virtual fields, runtime filter by calculated embedded fields, geospatial types for calculated fields |
| `da657196` | ?9: calculated geospatial values are not converted from the Mongo format |
| `226010ff` | B9, partly B15: standard mutations retry only transient transaction errors, errors are rethrown unwrapped |
| `6002a955` | B9 (follow-up): `workOutMutations` likewise does not retry mutations without transactions |
| `a323df29` | B7: `PushIntoXInput` for a duplex array with a required opposite field uses the `Thru` input, like Create/Update |
| `dc922b25` | B10, ?8: custom (non-standard, manually defined) subscriptions are explicitly forbidden: `custom.Subscription` gives a clear error |
| `39794e6e` | B8, B8a: all caches are bound to config objects (`createObjectBoundStore`), argument transformers are composed per resolver |
| `e8b906de` | B11–B17: minor fixes: signatures of actions without arguments, custom resolvers only for tangible entities, TS types, error messages, dead code |
| `81f368db` | I2, I4, I5, I6, I9, I11, ?7: schema inconsistencies resolved per your decisions, `cloneEntity` removed; I7, I10: by design; I3, I8: deferred |
| `0fb7a9fe` | B20: the same "children" condition (`parent: true` + scalar opposite field) in the schema and in `…WithChildren` resolvers |
| `e2303727` | Q6 (option B), B18, B19, B21: `copy…` arguments renamed (`whereKeyToSource`, `whereTarget`), optional `whereTarget` in `copyManyXsWithChildren`, record order in `copyMany…` |
| `e92f738a` | B22: `lockedData` check for arrays runs in the same transaction |
| `dcf28990` | Final names of `copy…` arguments: `whereKeyToSource` (`XWhereKeyToSourceInput`), `whereTarget` (`XWhereTargetInput`) |
| `894c564e` | B23, B24, B25: authorization: `userAttributes` are cached per request, unknown roles are ignored, `node` accepts `token` (see §13) |
| `f7587dd2` | B26, B27, B28: subscriptions: access denial is respected, `subscribePayloadFilters` are required with `filters`, the client `wherePayload` filter works; tests for all subscriptions |
| `e35ba325` | B25 reverted: Relay requires exactly `node(id: ID!): Node`, so `node` has no `token` argument again |
| `d96aafb0` | `whereTarget` of `copy…` mutations uses `XWhereOneInput`; the duplicate `XWhereTargetInput` type is removed |

---

## 0. Overall pipeline

```
SimplifiedEntityConfig[] ──composeAllEntityConfigs──▶ allEntityConfigs (+ PageInfo, Edge, Connection, Payloads)
                                                        │
GeneralConfig { allEntityConfigs, enums, inventory, representation, custom, interfaces, manualyUsedEntities }
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
| E7 | `XUpdatedPayload` (virtual) | auto for tangible | `node: X!`, `previousNode: X!`, `updatedFields: [String!]!`, `[actor: Actor]` | return type of `updatedX` |
| E8 | `XCreatedOrDeletedPayload` (virtual) | auto for tangible | `node: X!`, `[actor: Actor]` | return type of `createdX` / `deletedX` |
| E9 | **representation** config `X{Key}` (or with `representationNameSlicePosition`, e.g. `XKeyConnection`) | `generalConfig.representation[Key]` | a copy of X with include/exclude/add/freeze/unfreeze fields and relational/duplex/filter/child references replaced by `Y{Key}` | `…{Key}` actions from `allow[X]` |

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
| F7 | duplex (two-way link) | C1/C2 (+C3 GetOrCreate) | like F5, but if the opposite field is `required`: `YCreateThru_{opp}_FieldChildInput` / `YCreateOrPushThru_{opp}_FieldChildrenInput` (in Create, Update and PushInto; in such an input the opposite field is optional and filled with the parent id) | as Create | as F5 |
| F8 | filter (stores a filter on Y as a string) | `variants: plain` → C1/C2; `stringified` → `nameStringified: String` | array: `YWhereInput`, scalar: `YWhereOneInput` (frozen ones too, see I5) | yes (without frozen) | — (`PushIntoXInput` has no filter fields, see I6) |
| F9 | calculated | per `calculatedType`, with `inputTypes` arguments (+`slice` for arrays); `filterFields` as C1/C2 | — | — | — (but yes in WherePayloadInput) |
| F10 | child (virtual only) | `name: Y` / `[Y!]!` | — | — | — |

---

## 3. Root Query (for tangible `X`; plural `Xs` via `pluralize`)

| ID | actionName | SDL | When present | Resolver creator |
|---|---|---|---|---|
| Q0 | — | `node(id: ID!): Node` (exactly this signature: Relay requires it, e.g. for `@refetchable` fragments, see B25) | always | `createNodeQueryResolver` |
| Q1 | `entity` | `X(whereOne: XWhereOneInput[!], whereCompoundOne: XWhereCompoundOneInput, token: String): X` | tangible (`whereOne` has `!` if there are no `uniqueCompoundIndexes`; `whereCompoundOne` exists only with them) | `createEntityQueryResolver` |
| Q2 | `entities` | `Xs(where, sort, pagination, near?, search?, token): [X!]!` | tangible | `createEntitiesQueryResolver` |
| Q3 | `entitiesThroughConnection` | `XsThroughConnection(where, sort, near?, search?, after, before, first, last, token): XConnection!` | tangible | `createEntitiesThroughConnectionQueryResolver` |
| Q4 | `entitiesByUnique` | `XsByUnique(where: XWhereByUniqueInput!, sort, near?, search?, token): [X!]!` | tangible | `createEntitiesByUniqueQueryResolver` |
| Q5 | `entityCount` | `XCount(where, search?, token): Int!` | tangible | `createEntityCountQueryResolver` |
| Q6 | `entityDistinctValues` | `XDistinctValues(where, search?, options: XDistinctValuesOptionsInput!, token): [String!]!` | tangible, **if it has indexed text (`index`/`unique`) or enum (`index`) fields** (see I9) | `createEntityDistinctValuesQueryResolver` |

`near?` → only if there is a geospatial field with `index`; `search?` → only if there is a textField with `weight`. `sort` is always present (id/createdAt/updatedAt + indexed scalar fields).

## 4. Mutation (for tangible `X`)

| ID | actionName | SDL (args → return) | Extra `actionAllowed` condition | Publishes a subscription event? |
|---|---|---|---|---|
| M1 | `createEntity` | `createX(data: XCreateInput!, token)` → `X!` | — | ✅ `created` |
| M2 | `createManyEntities` | `createManyXs(data: [XCreateInput!]!, token)` → `[X!]!` | — | ❌ |
| M3 | `updateEntity` | `updateX(whereOne: XWhereOneInput!, data: XUpdateInput!, token)` → `X!` | — | ✅ `updated` |
| M4 | `updateManyEntities` | `updateManyXs(whereOne: [..!]!, data: [XUpdateInput!]!, token)` → `[X!]!` | — | ❌ |
| M5 | `updateFilteredEntities` | `updateFilteredXs(where, near?, search?, data: XUpdateInput!, token)` → `[X!]!` | — | ❌ |
| M6 | `updateFilteredEntitiesReturnScalar` | `updateFilteredXsReturnScalar(where, near?, search?, data!, token)` → `Int!` | — | ❌ |
| M7 | `pushIntoEntity` | `pushIntoX(whereOne!, data: PushIntoXInput!, positions: XPushPositionsInput, token)` → `X!` | at least one non-frozen array field (or filter field) | ✅ `updated` |
| M8 | `deleteEntity` | `deleteX(whereOne!, token)` → `X!` | — | ✅ `deleted` |
| M9 | `deleteManyEntities` | `deleteManyXs(whereOne: [..!]!, token)` → `[X!]!` | — | ❌ |
| M10 | `deleteFilteredEntities` | `deleteFilteredXs(where, near?, search?, token)` → `[X!]!` | — | ❌ |
| M11 | `deleteFilteredEntitiesReturnScalar` | `…ReturnScalar(where, near?, search?, token)` → `Int!` | — | ❌ |
| M12 | `deleteEntityWithChildren` | `deleteXWithChildren(whereOne!, options: deleteXWithChildrenOptionsInput, token)` → `X!` | has "children" (*) | ❌ |
| M13 | `deleteManyEntitiesWithChildren` | `deleteManyXsWithChildren(whereOne: [..]!, options, token)` → `[X!]!` | (*) | ❌ |
| M14 | `deleteFilteredEntitiesWithChildren` | `deleteFilteredXsWithChildren(where, near?, search?, options, token)` → `[X!]!` | (*) | ❌ |
| M15 | `deleteFilteredEntitiesWithChildrenReturnScalar` | `…(where, near?, search?, options, token)` → `Int!` | (*) | ❌ |
| M16 | `copyEntity` | `copyX(whereKeyToSource: XWhereKeyToSourceInput!, options: copyXOptionsInput, whereTarget: XWhereOneInput, data: XUpdateInput, token)` → `X!` | (**) | ❌ |
| M17 | `copyManyEntities` | `copyManyXs(whereKeyToSource: [..!]!, options, whereTarget: [..!], data: [..!], token)` → `[X!]!` | (**) | ❌ |
| M18 | `copyEntityWithChildren` | `copyXWithChildren(whereKeyToSource!, options, whereTarget, token)` → `X!` | (**) and (*) | ❌ |
| M19 | `copyManyEntitiesWithChildren` | `copyManyXsWithChildren(whereKeyToSource: [..!]!, options, whereTarget: [..!], token)` → `[X!]!` | (**) and (*) | ❌ |
| — | `cloneEntity` | removed (see ?7) | — | — |

(*) "Children" are records X refers to through duplex fields with **`parent: true`** whose opposite field is **scalar** (`getNotArrayOppositeDuplexFields`: `parent && !oppositeArray`). The same condition (the `getChildDuplexFields` util) is used both by the schema (`actionAllowed` of all `…WithChildren` mutations, the `deleteXWithChildrenOptionsInput` enum) and at runtime (deleting with children in `processFieldToDelete`, copying the tree in `composeCreateTree`); before `0fb7a9fe` the schema checked a different condition (see B20).
(**) There is a duplex field `f` for which `getMatchingFields(X, Y)` yields at least one field other than `f` (i.e. X and Y have same-named fields that can be copied).

All mutations except `workOutMutations` are built by `composeStandardMutationResolver(resolverAttributes)`: the loop `getPrevious → prepareBulkData → unwindCore → addPeripheryToCore → optimizeBulkItems → incCounters → executeBulkItems`, then `produceResult`, `report` (publishing to pubsub) and `finalResult`. The whole transaction is retried (up to 7 attempts with backoff) only for errors labelled `TransientTransactionError` / `WriteConflict` and only when `serversideConfig.transactions` is enabled; on `UnknownTransactionCommitResult` only `commitTransaction` is retried. Other errors are rethrown as is. The same rule applies to `workOutMutations`.

**`lockedData` in `workOutMutations`** is optimistic locking (not part of the GraphQL schema). Before the mutation `checkLockedData` runs the standard query of the entity the mutation changes (for `copy…`, the X being copied into) with `lockedData.args` and compares the result with `lockedData.result`: if `result` is an object or `null`, `X(whereOne | whereCompoundOne)` is called; if it is an array, `Xs(where, sort, …)` is called and results are compared **by index**, so for arrays `lockedData.args` should include `sort`, otherwise the MongoDB order is not guaranteed and the check may fail spuriously. `whereOne` in `lockedData.args` is an argument of the `X` query, not the `whereTarget` of `copy…` mutations.

## 5. Subscription (for tangible `X`)

| ID | SDL | pubsub channel |
|---|---|---|
| S1 | `createdX(wherePayload: XWherePayloadInput): XCreatedOrDeletedPayload!` | `created-X` |
| S2 | `deletedX(wherePayload): XCreatedOrDeletedPayload!` | `deleted-X` |
| S3 | `updatedX(wherePayload, whichUpdated: XWhichUpdatedInput): XUpdatedPayload!` | `updated-X` |

`XWherePayloadInput` is built from all fields (no `index` required) + calculated fields without `asyncFunc` (or listed in `allowedCalculatedWithAsyncFuncFieldNames`). Calculated fields with `calculatedType: 'virtualFields'` are **not** included in the filter (a deliberate decision, see B5 and ?10). The runtime filter uses the same set of fields (`composeSubscriptionDummyEntityConfig`). An event is sent if it matches both the client `wherePayload` (for `updatedX`, both `previousNode` and `node` must match) and the `subscribePayloadFilters` of the user's roles; `whichUpdated` additionally filters `updatedX` by the changed fields. Authorization runs once, on subscribe (§13); if the user has no access to the subscription (B26), no events are sent.

## 6. Child fields inside type X (`createEntityType`)

For relational (including parent), duplex, filter (`plain`) and calculated (`filterFields`) fields pointing to Y:

| ID | Field | Condition | SDL | Field resolver (`composeEntityResolvers`) |
|---|---|---|---|---|
| C1 | array | `childEntities` allowed | `f(where, sort, pagination, near?, search?): [Y!]!` | relational/duplex: `createEntityArrayResolver`; parent relational: `createEntityOppositeRelationArrayResolver`; filter: `createEntityFilterArrayResolver` |
| C1a | array | `childEntitiesThroughConnection` | `fThroughConnection(where, sort, near?, search?, after, before, first, last): YConnection!` | `…ConnectionResolver` (3 variants, as above) |
| C1b | array | `childEntityCount` | `fCount(where, search?): Int!` | `…CountResolver` |
| C1c | array | `childEntityDistinctValues` and Y has indexed text/enum fields | `fDistinctValues(where, search?, options!): [String!]!` | `…DistinctValuesResolver` |
| C2 | scalar | `childEntity` allowed (`checkRepresentationAction`, the same check as for the resolver; see B4) | `f: Y[!]` | `createEntityScalarResolver` / `createEntityFilterScalarResolver` |
| C3 | duplex scalar, not `required`, scalar opposite field | `childEntityGetOrCreate` | `fGetOrCreate(data: YCreateInput!): Y` (`whereOne` hidden) | `createEntityGetOrCreateResolver` |
| C4 | embedded array | `variants` | `plain`: `f(slice): [E!]!`; `connection`: `fThroughConnection(after,before,first,last): EConnection!`; `count`: `fCount: Int!` | `fieldArrayResolver` / `fieldArrayThroughConnectionResolver` / `fieldArrayCountResolver` |
| C5 | any other array field | — | `f(slice: SliceInput)` | `fieldArrayResolver` |
| C6 | geospatial | — | `Geospatial…` | regular fields: `…FromMongoToGql` converters; calculated: no conversion (`func` returns the GraphQL format, see ?9), arrays: `fieldArrayResolver` |
| C7 | filter `stringified` | — | `fStringified: String` | `fieldFilterStringifiedResolver` |

Field resolvers (`composeEntityResolvers`) are created for **every** entity whose type is in the SDL: tangible, embedded, virtual and their representation versions. Empty sets are not added (see B3).

Child fields and their resolvers appear only if the action is possible for Y (`actionAllowed`, checked in `checkRepresentationAction`) and allowed by inventory/representation.

Every child field resolver internally wraps the corresponding `createChildEntity*QueryResolver` Query resolver via `resolverDecorator`, and for representation configs via `createCustomResolver('Query', 'childEntity…{Key}')`.

---

## 7. Filters that control generation

| ID | Mechanism | Where it applies |
|---|---|---|
| G1 | `actionAllowed(entityConfig)` | both types and resolvers (consistent) |
| G2 | `inventory` (`include`/`exclude`, chain `[Kind, action, entity]`; `include` restricts on every level, `exclude` excludes only a fully covered chain, `exclude: true` excludes everything) | types: `checkRepresentationAction` (for both root actions and child fields); resolvers: every creator calls `checkInventory` and returns `null`; at runtime roles are checked via `inventoryByRoles` in `executeAuthorisation` |
| G3 | `representation[Key].allow[X]`: a list of actions | types + resolvers (via `mergeRepresentationIntoCustom` → custom actions named `${action}${Key}`) |
| G4 | `custom.{Input,Query,Mutation}` + `serversideConfig.{Query,Mutation}`: "custom" here means non-standard, manually defined actions (as opposed to the standard ones generated from `actionAttributes`); representation actions are internally converted to custom actions too (G3) | signature: tangible only; resolver: `createCustomResolver` also tangible only (see B14); `custom.Subscription` is forbidden (only standard and representation subscriptions) |
| G5 | `manualyUsedEntities` | adds the type even if it is not reachable |

Runtime decorator chain: `resolverDecorator` → `transformBefore` (args by type suffix: `CreateInput/UpdateInput/PushIntoInput` → `transformData`; `Where*` → `transformWhere`; `WhereOne*` → `transformWhereOne`; `WhereKeyToSourceInput` → `transformWhereKeyToSource`) → `authDecorator` (`executeAuthorisation`: inventoryByRoles, filters, staticFilters, personalFilters → `involvedFilters`, `subscriptionEntityNames`) → resolver → `transformAfter` (global ids).

---

## 8. Bugs confirmed by running code ✅

| ID | Summary | Location | Reproduction / consequence |
|---|---|---|---|
| **B1** **[fixed `2a2e24d4`]** | `checkInventory`: when both `include` and `exclude` are set and the current chain level is not mentioned in `exclude`, the function **immediately returns `true`** without checking `include` on deeper levels | `src/utils/inventory/checkInventory.ts:41-43` | `include: {Query: {entities: ['A']}}, exclude: {Mutation: true}` → `checkInventory(['Query','entities','B'])` gives `true` (without exclude it gives `false`). Through `executeAuthorisation.ts:315` this also affects **`inventoryByRoles`, i.e. authorization** |
| **B2** **[fixed `2a2e24d4`]** | `createChildEntityCountQueryResolver` and `createChildEntityDistinctValuesQueryResolver` check the inventory chain `'childEntitiesThroughConnection'` instead of `'childEntityCount'` / `'childEntityDistinctValues'` | `queries/createChildEntityCountQueryResolver/index.ts:29`, `queries/createChildEntityDistinctValuesQueryResolver/index.ts:30` | inventory `include: {Query: {entities, childEntities, childEntityCount}}` → field `Menu.sectionsCount` is in the SDL, but querying it fails with `TypeError: func is not a function` |
| **B3** **[fixed `124e7e33`]** | Entity field resolvers are created only for tangible entities **and only if** they have `duplexFields \|\| geospatialFields \|\| relationalFields` | `resolvers/composeGqlResolvers/index.ts:254` | tangible `Holder` with an embedded array `variants: ['plain','connection','count']` and `tags: [String]` → `resolvers.Holder` is missing entirely: `itemsThroughConnection: ItemConnection!` returns null (non-null error), `slice` is ignored. Likewise (📖) filter fields without relational/duplex fields are not resolved, and embedded types never get resolvers (slice/connection/count for nested arrays) |
| **B4** **[fixed `2a2e24d4`]** | `createEntityType` calls `checkInventory([... 'childEntity' / 'childEntityGetOrCreate' ...])` **without the `inventory` argument**, so the check is always `true` | `src/types/createEntityType.ts:253`, `:275` | `exclude: {Query: {childEntity: ['Menu']}}` → `type Section` has `menu: Menu`, but the `Section.menu` resolver is not created (its creator respects inventory) |
| **B5** **[fixed `124e7e33`]** | `WherePayloadInput` crashes for a calculated field with `calculatedType: 'virtualFields'`: `preFields` has no `virtualFields` key | `src/types/inputs/createEntityWherePayloadInputType.ts:67` | `composeTypeDefsAndResolvers` → `TypeError: Cannot read properties of undefined (reading 'push')` |
| **B6** **[fixed `124e7e33`]** | `composeGeospatialTypes` looks only at `geospatialFields` and ignores calculated geospatial fields | `src/types/specialized/composeGeospatialTypes.ts:17` | an entity with only a calculated `Point` → `Unknown type "GeospatialPoint"` (and `…PolygonInput` etc. from WherePayload) |
| **B5a** **[fixed `124e7e33`]** | (found while fixing B5) The runtime `wherePayload` filter by a calculated embedded field crashed: the subscription dummy config lost the field `config` (`Cannot destructure property 'name' of 'entityConfig'`) | `src/resolvers/utils/composeSubscriptionDummyEntityConfig/index.ts` | `config`, `enumName`, `geospatialType` are now kept; calculated virtual fields are filtered neither in the SDL nor at runtime |
| **B7** **[fixed `a323df29`]** | `PushIntoXInput` for a duplex array always uses `YCreateOrPushChildrenInput`, while Create/Update use `YCreateOrPushThru_{opp}_FieldChildrenInput` when the opposite field is `required` | `src/types/inputs/createPushIntoEntityInputType.ts:84` | `PushIntoMenuInput.sections: SectionCreateOrPushChildrenInput` → `create: [SectionCreateInput!]` with a required `menu: MenuCreateChildInput!`: the client has to specify the parent, which is already known (not needed for `MenuCreateInput`) |
| **B8** **[fixed `39794e6e`]** (`checkInventory` cache earlier, in `2a2e24d4`) | The module-level resolvers cache ignores arguments | `resolvers/composeGqlResolvers/index.ts:22,31` | outside jest a second call with a **different** `generalConfig` returns the resolvers of the first one (`a.resolvers === b.resolvers`). Similar global caches not bound to the config: `mergeRepresentationIntoCustom` (key: `variant`), `parseEntityName`, `composeRepresentationConfig` (key: name), `checkInventory` (key: `inventory.name`), `resolverDecorator`, subscription creators |
| **B8a** **[fixed `39794e6e`]** | (found while fixing B8) `resolverDecorator` cached argument transformers by a key made of argument names and types **without the entity name**, so outside jest the resolvers of one action transformed arguments of all entities with the first entity's config | `resolvers/utils/resolverDecorator/index.ts` | e.g. global ids of relational/duplex fields in the `where` of the second entity were not decoded; transformers are now composed per resolver |

## 9. Bugs found by reading the code 📖

| ID | Summary | Location |
|---|---|---|
| **B9** **[fixed `226010ff`]** | `composeStandardMutationResolver` retries **any** error 7 times (backoff ≈ 6.3 s), even validation errors, and finally throws `new Error(err)`, losing the type and message (`"Error: TypeError: …"`). Without `transactions`, non-idempotent partial writes are repeated. This was fixed for `workOutMutations` in `3c87337`, but standard mutations kept the same behaviour | `resolvers/mutations/composeStandardMutationResolver/index.ts:101-245` |
| **B10** **[fixed `dc922b25`]** | When `representation` is set, `mergeRepresentationIntoCustom` **overwrites `custom.Subscription`** with representation subscriptions. Custom subscriptions are not validated either | `src/utils/mergeRepresentationIntoCustom/index.ts:212-217` |
| B11 **[fixed `e8b906de`]** | `prev.includes(entityName)`, while `entityName2` is pushed into the array (typo: duplicates, the check does not work as intended) | `mergeRepresentationIntoCustom/index.ts:112` |
| B12 **[fixed `e8b906de`]** | `composeActionSignature`: if an action has no arguments left, the function returns **before** `fillEntityTypeDic`, and the return type may not get into the SDL. Unreachable for standard actions today (there is always `token`/`where`), but a latent bug | `src/types/composeActionSignature.ts:69` |
| B13 **[fixed `e8b906de`]** | `composeChildActionSignature` returns either an argument string or a full `  name: type` signature (when there are no arguments); callers insert the result into `(...)`, which makes the SDL invalid | `src/types/composeChildActionSignature.ts:74` vs `:82` |
| B14 **[fixed `e8b906de`]** | Resolvers for custom actions are created for all entities, but SDL signatures only for tangible ones. If a custom `specificName` returns a non-empty name for an embedded/virtual entity, `makeExecutableSchema` fails (resolver without a field) | `composeGqlResolvers/index.ts:83` vs `composeGqlTypes.ts:96` |
| B15 **[fixed `e8b906de`]** (messages for `prepareBulkData` and `finalResult` in `226010ff`) | Copy-pasted error messages: `getPrevious have to be setted` for `prepareBulkData`, `report have to be setted` for `finalResult`, `"UpdatedPayload"` in the composer for `CreatedOrDeletedPayload` | `composeStandardMutationResolver/index.ts:186,265`; `composeCreatedOrDeletedPayloadVirtualConfig.ts:25` |
| B16 **[fixed `e8b906de`]** | TS types: `ArrayCalculatedField.func` returns `GraphqlScalar` instead of an array; the `CalculatedField` union repeats Geospatial twice; `EmbeddedEntityConfig` excludes `calculatedFields` while `SimplifiedEmbeddedEntityConfig` allows them | `src/tsTypes/index.ts:794, 804-807, 839-844` |
| B17 **[fixed `e8b906de`]** | Minor issues: `_size` has no indentation in WhereInput for a geospatial array; the comment "use not required ID in embedded" contradicts `id: ID!`; the comment "only scalar points" in NearInput does not match the filter (all types and arrays); `createEntitySortInputType` has an unreachable `if (!fieldLines.length)` branch; ~~`allowMutations/allowSubscriptions` in `composeGqlTypes` are unused~~ (removed in `2a2e24d4`); `const all = []` in `fillEntityTypeDic`; `createCloneEntityMutationResolver` has `actionGeneralName: 'updateEntity'` | various |
| **B18** **[fixed `e2303727`]** | `copyManyXsWithChildren` has a **required** `whereOne: [XWhereOneToCopyInput!]!`, while at runtime it uses the same `getCommonManyData` as `copyManyXs`. In mode B (array opposite field) it can only update existing X records, not create new copies. In mode A (scalar opposite field) the mutation does not work at all: any `whereOne`, even `[]`, gives `Needless whereOne arg!`. See §12 for details | `types/actionAttributes/copyManyEntitiesWithChildrenMutationAttributes.ts`; `resolvers/mutations/createCopyManyEntitiesMutationResolver/resolverAttributes/getCommonData.ts` |
| **B19** **[fixed `e2303727`]** | `copyManyXs` / `copyManyXsWithChildren` match records **by index** (`entities[i]` ↔ `whereOnes[i]` ↔ `data[i]` ↔ `whereOne[i]`), although Y records are fetched by one `find({ OR: whereOnes })` and X records by `find({ _id: { $in: ids } })` / `find({ OR: whereOne })`. MongoDB does not guarantee result order, so `data[i]` may end up in the wrong copy, and in mode A a Y may be matched with another X (data copied to the wrong place). See §12 for details | `resolvers/mutations/createCopyManyEntitiesMutationResolver/resolverAttributes/getCommonData.ts` |
| **B20** **[fixed `0fb7a9fe`]** | The "has children" condition differs between the SDL and runtime. Runtime (`getNotArrayOppositeDuplexFields`) treats as children only duplex fields with their own **`parent: true`** and a scalar opposite field. `actionAllowed` of all `copy…WithChildren` / `delete…WithChildren` and the `deleteXWithChildrenOptionsInput` enum only check that the opposite field is scalar and not `parent` (`!(array \| parent)`). Consequence: for an entity with a duplex field without `parent: true` but with a scalar opposite field, `…WithChildren` mutations are generated that neither copy nor delete children (they work as regular ones), and `fieldsToDelete` offers fields that have no effect | `types/actionAttributes/*WithChildren*MutationAttributes.ts`; `types/inputs/createDeleteEntityWithChildrenOptionsInputType.ts` vs `resolvers/mutations/processFieldToDelete.ts:23-26` |
| **B21** **[fixed `e2303727`]** | (found while fixing Q6) The `whereKeyToSource` argument transformer (`transformWhereOnes`) for an array duplex field `f` called `whereKeyToSource[f].map(...)`, although the value is always a single `YWhereOneInput`; copying through an array duplex field failed with `TypeError` | `resolvers/utils/resolverDecorator/transformBefore/transformWhereKeyToSource.ts` |
| **B22** **[fixed `e92f738a`]** | `checkLockedData` (optimistic locking in `workOutMutations`) called the `Xs` query **without `session`** for an array `lockedData.result`, while passing it for a scalar one; the lock check read data outside the transaction and could miss a conflict. The unused `projection2` was also removed | `resolvers/mutations/workOutMutations/checkLockedData.ts` |
| **B23** **[fixed `894c564e`]** | `getUserAttributes` was called by every generated resolver, including child field resolvers for **every** parent record: `Menus { sections { … } }` over 50 menus made 51 calls (with better-auth, 51 session lookups). Now `executeAuthorisation` and `executeNodeAuthorisation` take the result from the `getUserAttributesOnce` cache, bound to the callback, the `context` object and `token`; a failed call is not cached. See §13.3 | `resolvers/utils/executeAuthorisation/getUserAttributesOnce.ts` |
| **B24** **[fixed `894c564e`]** | With `inventoryByRoles`, a user role absent from `containedRoles` caused `TypeError: undefined is not iterable` (`[...containedRoles[role], role]`). A role from `containedRoles` that is not a key of `inventoryByRoles` was checked against the default inventory, i.e. it **got access to everything**. Now, when `containedRoles` is set, unknown roles are dropped (for `inventoryByRoles`, `filters`, `subscribePayloadFilters` and `node`), and roles without `inventoryByRoles` grant no access | `resolvers/utils/executeAuthorisation/index.ts`, `…/executeNodeAuthorisation/index.ts` |
| B25 **[reverted `e35ba325`]** | `node(id)` has no `token` argument, and `executeNodeAuthorisation` calls `getUserAttributes(context)` without it: a client authenticated only by a token in arguments sees `node` as a guest. The `token: String` argument added in `894c564e` was removed in `e35ba325`: Relay compiler requires exactly `node(id: ID!): Node` (`Invalid use of @refetchable … has a node(id: ID): Node field`). **By design:** `node` takes authentication from `context` (cookies / headers) only | `types/composeGqlTypes.ts`, `resolvers/queries/createNodeQueryResolver`, `…/executeNodeAuthorisation/index.ts` |
| **B26** **[fixed `f7587dd2`]** | Subscriptions ignored access denial. For a role without access (by `inventoryByRoles` or `filters`) `executeAuthorisation` returns `involvedFilters: { inputOutputFilterAndLimit: null }` and `subscribePayloadMongoFilter: {}`, while `createdX` / `updatedX` / `deletedX` checked only `!involvedFilters \|\| !subscribePayloadMongoFilter` (both are objects), so the user received all events of the entity. Now events are not sent when `inputOutputFilterAndLimit` is `null` (the previous checks are kept) | `resolvers/subscriptions/create{Created,Deleted,Updated}EntitySubscriptionResolver/index.ts` |
| **B27** **[fixed `f7587dd2`]** | The payload of subscription events is checked only by `subscribePayloadFilters`; `filters`, `staticFilters` and `personalFilters` do not apply to it (they may refer to linked entities absent from the payload). With `filters` but without `subscribePayloadFilters`, a user allowed to read only some records received events about all of them. Now `composeServersideConfig` throws `Not found "subscribePayloadFilters" to use with "filters" for subscriptions: …` if `filters` are set, subscriptions are available and `subscribePayloadFilters` are not | `resolvers/utils/composeServersideConfig/index.ts` |
| **B28** **[fixed `f7587dd2`]** | `subscriptionResolverDecorator` read `args.where` instead of the SDL argument `wherePayload` and then overwrote `wherePayload` with `transformWhere({})`: the client filter of events (and global ids in it) was lost, subscribers got all allowed events | `resolvers/utils/resolverDecorator/subscriptionResolverDecorator.ts` |

## 10. Inconsistencies (possibly by design: your decision needed)

| ID | Observation |
|---|---|
| I1 | Subscription events are published only by `createEntity`, `updateEntity`, `pushIntoEntity`, `deleteEntity`. Bulk operations (`createMany…`, `updateMany/Filtered…`, `deleteMany/Filtered/WithChildren…`, `copy…`) produce no events, so subscribers miss them. **By design:** bulk mutations do not publish subscription events (see ?3) |
| I2 | `update/deleteFilteredEntitiesReturnScalar` have no `near` argument, although their non-scalar versions do. **Fixed** in `81f368db`: `near` added to all `…ReturnScalar` |
| I3 | `copyManyEntities.whereOne: [X!]` (nullable), but `copyManyEntitiesWithChildren.whereOne: [X!]!`; `copyEntityWithChildren` has no `data`, while `copyEntity` has. **Deferred** for a separate analysis (Q6) |
| I4 | In `XWhereOneInput` a unique text field has type `ID`, while in `WhereByUnique` and `WhereCompoundOne` it is `String`. **Fixed** in `81f368db`: type `String` |
| I5 | `XCreateInput` **excludes frozen filter fields**, although other frozen fields are in CreateInput (freeze should only forbid changes), `createEntityCreateInputType.ts:101`. **Fixed** in `81f368db`: frozen filter fields are in `XCreateInput` |
| I6 | `PushIntoXInput` takes **all** filter fields, including scalar ones (other fields are filtered by `array`), while `XPushPositionsInput` contains no filter fields. Note: a filter field is stored as a string (`type: String`), and `pushInto` builds `$push: { field: { $each: "<json>" } }` for it, which MongoDB rejects, so `pushInto` with a filter field always fails. **Fixed** in `81f368db`: filter fields removed from `PushIntoXInput` |
| I7 | `freezedFields[X]` makes **exactly** the listed fields frozen (the rest become `freeze: false`, even if frozen in the base config); `unfreezedFields` works the other way round. If both are set, the last one wins. **By design:** `freezedFields`/`unfreezedFields` fully override `freeze` for all entity fields (see ?5) |
| I8 | `childEntityGetOrCreate` has `actionType: 'Query'` but may create a record: writing data in a Query field. **Deferred** for a separate analysis (Q8) |
| I9 | `XDistinctValuesOptionsInput` offers all text/enum fields (including array and non-indexed ones), and the enum is named `XTextNamesEnum`. **Fixed** in `81f368db`: only indexed fields (text: `index` or `unique`, enum: `index`); an entity without such fields has no `XDistinctValues` and no child `…DistinctValues` |
| I10 | `entityCount`/`entityDistinctValues` have no `near`. Probably deliberate, since `$nearSphere` does not work with count/distinct, but worth confirming. **By design:** `near` not only selects but also sorts by distance, which count/distinct do not need; for selection without sorting there is e.g. `coordinates_withinSphere` |
| I11 | `composeEntityConfig` does not check that `configName` of relational/duplex fields points to a **tangible** entity, nor that `oppositeName` of the opposite field points back to this very field. **Fixed** in `81f368db`: `composeAllEntityConfigs` throws `TypeError` |

## 11. Questions for you

- ?1 B1: ~~what should the semantics of `include` + `exclude` together be?~~ Resolved in `2a2e24d4`: `include` restricts on every level, `exclude` excludes only a fully covered chain, `exclude: true` excludes everything.
- ?2 B3: ~~were embedded types (and tangible ones without relational/duplex/geo fields) meant to get field resolvers? If so, the condition in `composeGqlResolvers:254` has to be removed or extended, and embedded types traversed too.~~ Resolved in `124e7e33`: field resolvers are created for all entities present in the SDL.
- ?3 ~~I1: are events for bulk mutations not published on purpose or by oversight?~~ Answer: on purpose, bulk mutations cannot publish subscription events. The current behaviour is final.
- ?4 ~~I5/I6: how to handle `freeze` for filter fields in Create and filter fields in Push?~~ Answer: frozen filter fields are set on creation; filter fields are not pushed. Fixed in `81f368db`.
- ?5 ~~I7: do `freezedFields`/`unfreezedFields` override or extend `freeze`?~~ Answer: they fully override it (the current behaviour is final).
- ?6 ~~Are several different `generalConfig`s supported in one process?~~ Resolved in `39794e6e`: caches are bound to the `generalConfig` / `serversideConfig` / `entityConfig` objects via `WeakMap`, so several configs in one process do not mix.
- ?7 ~~`cloneEntity`: remove or restore?~~ Answer: remove. Removed in `81f368db`.
- ?8 ~~Custom Subscription (`custom.Subscription`): is it a supported feature?~~ Answer: no. Resolved in `dc922b25`: if `Subscription` is passed in `generalConfig.custom`, a `TypeError` is thrown; only standard and representation subscriptions are supported.
- ?9 ~~Format of calculated geospatial values~~ Answer: `func` returns the GraphQL format (`{ lng, lat }`). Fixed in `da657196`: calculated geospatial fields no longer go through the Mongo→GraphQL converter (which returned `null`), arrays keep `slice` support.
- ?10 ~~Filtering `wherePayload` by calculated virtual fields~~ Answer: not needed. The current behaviour (virtual fields are not filtered) is final.
- ?11 ~~Q6 (I3), `copy…` arguments~~ Answer: option B + argument renaming. Implemented in `e2303727` (see §12.8, §12.9).
- ?12 Q8 (I8), `childXGetOrCreate` as a Query: deferred for a separate analysis.

---

## 12. Q6 (I3) analysis: arguments of `copy…` mutations

> Established by reading the code 📖, not verified by running it (MongoDB tests cannot run in the analysis environment).

### 12.1. What `copy…` mutations do

Copying follows a **duplex link** between two tangible entities: `X` (the target) has a duplex field `f` pointing to `Y` (the source), and `Y` has an opposite field `g` pointing to `X`. **Common fields** are copied: same-named fields of X and Y, except `f` itself (`getMatchingFields`).

```
Menu        { name, description, clone ↔ MenuClone.original }
MenuClone   { name, description, original ↔ Menu.clone }
```

`copyMenuClone(whereKeyToSource: { original: { id: "<Menu id>" } })` takes the `Menu` and transfers its `name` and `description` to the `MenuClone` linked to this `Menu`.

### 12.2. Arguments

| Argument | Type (`copyX`) | Meaning |
|---|---|---|
| `whereKeyToSource` (formerly `whereOnes`) | `XWhereKeyToSourceInput!`, exactly one key `{ f: YWhereOneInput }` | **Where to copy from**: selects the duplex field `f` and a specific Y record |
| `options` | `copyXOptionsInput` = `{ f: { fieldsToCopy \| fieldsForbiddenToCopy } }` | Restricts the set of common fields; the key must match the `whereKeyToSource` key |
| `whereTarget` (formerly `whereOne`) | `XWhereOneInput` (the same type as `whereOne` of `X` / `updateX`) | **Where to copy to** (which existing X to update); needed only in mode B |
| `data` | `XUpdateInput` | Additional values for X applied on top of the copied ones |
| `token` | `String` | The usual token |

### 12.3. Two modes depending on the opposite field `g`

- **Mode A: `g` is scalar (1:1).** If `Y.g` already points to an X, that X is **updated** with the copied fields; if `Y.g` is empty, a new X linked to Y is **created**. `whereTarget` is forbidden (`Needless whereTarget arg!`), since X is uniquely determined.
- **Mode B: `g` is an array (1:N).** Without `whereTarget` a new X linked to Y is **created**. With `whereTarget` the specified X is **updated**; it must already be linked to Y (`Try to copy to unconnected …`).

Hence `whereTarget` is optional, and it is added to the signature only when X has a duplex field with common fields and an array opposite field (mode B is possible).

### 12.4. Mutation variants

Current state (after `e2303727`):

| Mutation | `whereKeyToSource` | `whereTarget` | `data` | Notes |
|---|---|---|---|---|
| `copyX` | `XWhereKeyToSourceInput!` | `XWhereOneInput` (optional) | `XUpdateInput` | — |
| `copyManyXs` | `[XWhereKeyToSourceInput!]!` | `[XWhereOneInput!]` (optional) | `[XUpdateInput!]` | `whereTarget[i]` and `data[i]` correspond to `whereKeyToSource[i]` |
| `copyXWithChildren` | `XWhereKeyToSourceInput!` | `XWhereOneInput` (optional) | **none** (by design) | also copies the tree of "children" (*) |
| `copyManyXsWithChildren` | `[XWhereKeyToSourceInput!]!` | `[XWhereOneInput!]` (optional; required before `e2303727`, B18) | **none** (by design) | the same for an array |

(*) "Children" are records Y refers to through duplex fields with **`parent: true`** and a scalar opposite field (`getNotArrayOppositeDuplexFields`). Only child fields that are common to X and Y and have `parent: true` with a scalar opposite field in both entities are copied (`composeCreateTree`). Copies of them are created recursively and linked to the new or updated X; on update, old children of X absent in Y are deleted (`composeCreateTree` + `mixTrees`). Fields without `parent: true` are not treated as children: the record they refer to is not copied (nor deleted in `delete…WithChildren`).

### 12.5. Inconsistency 1: `whereOne` is required in `copyManyXsWithChildren` (B18, fixed in `e2303727`; below is the description before the fix, with the old names)

`[XWhereOneToCopyInput!]!` forces `whereOne` to always be passed, while the runtime is shared with `copyManyXs` (`getCommonManyData`):
- **mode B:** only existing X records can be updated; creating new copies with children in bulk is impossible (although `copyXWithChildren` can do it for a single record);
- **mode A:** the mutation **does not work at all**: any value of `whereOne` (even `[]`) gives `Needless whereOne arg!`, and `[]` also fails the length check against `whereOnes`.

The problem arises when X has both a duplex field with an array opposite field (hence `whereOne` is in the signature) and a duplex field with a scalar one used for copying.

### 12.6. Inconsistency 2: `…WithChildren` have no `data`

`copyX`/`copyManyXs` allow `data`, `…WithChildren` do not. Adding the argument alone is not enough: `getCommonData` reads `args.data` and takes it into account in the permission check (`checkData`), but `prepareBulkData` in `…WithChildren` builds the record only from the copy tree and does not apply `data`, so it would need work too.

### 12.7. Related findings

1. **`data` has type `XUpdateInput` even when a copy is created.** Because of this, frozen fields of a new copy cannot be set via `data` (although they can on a regular create, after Q1), and required X fields that are not among the common fields are not checked by the schema: the error appears only on write. `XCreateInput` would be more logical for creation, but the same argument also serves updates.
2. **Matching records by index in `copyManyXs` / `copyManyXsWithChildren` (B19).** Y records are fetched by one `find({ OR: whereOnes })`, X records by `find({ _id: { $in: ids } })` or `find({ OR: whereOne })`, and then the code matches `entities[i]` ↔ `whereOnes[i]` ↔ `data[i]` ↔ `whereOne[i]`. MongoDB does not guarantee the order of `find` results, so `data[i]` may end up in the wrong copy, and in mode A a Y may be matched with another X. In mode B a wrong order more likely produces the error `Try to copy to unconnected …`.

### 12.8. Argument renaming (implemented in `e2303727`)

> The names were changed twice: in `e2303727` to `whereSource` / `whereKeyToTarget`, in `dcf28990` to the final `whereKeyToSource` (`XWhereKeyToSourceInput`) and `whereTarget` (`XWhereTargetInput`); in `d96aafb0` the type of `whereTarget` was replaced by the identical `XWhereOneInput`. The rest of the document uses the final names.

The old names described the shape of the argument, not its role: `whereOnes` (the source, exactly one key) and `whereOne` (the target) differed by one letter while meaning opposite things. Agreed renaming:

| Old argument | New argument | Old type | New type |
|---|---|---|---|
| `whereOnes` | `whereKeyToSource` | `XCopyWhereOnesInput` | `XWhereKeyToSourceInput` |
| `whereOne` | `whereTarget` | `XWhereOneToCopyInput` | `XWhereTargetInput`, since `d96aafb0` `XWhereOneInput` |

In `copyMany…` the names stay singular with an array type, as in `updateManyXs(whereOne: [..])`.

Affected: 4 `copy…` attributes files, 2 input generators (`createEntityCopyWhereOnesInputType`, `createEntityWhereOneToCopyInputType`), 4 resolver files (`args.whereOnes` / `args.whereOne`), `resolverDecorator` (type suffixes `CopyWhereOnesInput`, `WhereOneToCopyInput`) and `transformWhereOnes`; `src/client` takes names from the attributes. This is an API change for clients.

### 12.9. Solution options (option **B** chosen, implemented in `e2303727`)

- **A. Align:** `whereOne` optional in `copyManyXsWithChildren` too; add `data` to both `…WithChildren` (with an implementation in `prepareBulkData`); fix matching by index (order `find` results by `whereOnes`/`whereOne`). `data` stays `XUpdateInput`.
- **B. Fix the bugs only:** `whereOne` optional in `copyManyXsWithChildren` and matching by index; `data` is not added to `…WithChildren` (by design).
- **C. Like A or B, but with separate `data` for creation (`XCreateInput`) and update.** The most complete solution, changes the signatures of all `copy…`.
- **D. Other.** For example, if the required `whereOne` in `copyManyXsWithChildren` is deliberate: an explanation for the document.

**Decision:** option B. `whereTarget` in `copyManyXsWithChildren` is optional (B18), record matching in `copyMany…` preserves the order of `whereKeyToSource` / `whereTarget` (B19: each record is fetched separately, `$in` results are ordered by `ids`); `data` is not added to `…WithChildren`. Along with this, the arguments were renamed (§12.8) and B21 was fixed.

## 13. User authorization

Integration with better-auth is described separately: [better-auth-integration.md](./better-auth-integration.md).

### 13.1. Pipeline

Every generated resolver (root queries, mutations, subscriptions, child field resolvers) is wrapped by `authDecorator` → `executeAuthorisation`. For `node`, `executeNodeAuthorisation` does the same.

1. **User:** `userAttributes = await getUserAttributes(context, args.token)`, once per (`context`, `token`) pair (B23).
2. **Access filters:** `involvedFilters` is built for every entity the action touches (`inputOutputEntity`, `outputEntity`, …).
3. **Execution:** the resolver adds the conditions to the MongoDB query. If there is no access (`null`), the resolver returns `null` and a mutation changes nothing; **there is no GraphQL error**.

### 13.2. Layers

| ID | Layer | Settings | What it does |
|---|---|---|---|
| A1 | Static inventory | `generalConfig.inventory` | Which actions exist; the same for everyone |
| A2 | Roles | `inventoryByRoles` + `containedRoles` | Which actions a role allows. `containedRoles` defines inheritance (`{ admin: ['user'] }`: admin has the permissions of user). An action is allowed if **any** of the user's roles allows it. Roles absent from `containedRoles` are ignored (B24) |
| A3 | Role filters | `filters: { X: ({ role, ...userAttributes }) => null \| InvolvedFilter[] }` | The function is called for every role: `[]` means full access, `null` means the role grants nothing, an array grants access to records matching the conditions. Results of the roles are combined with OR |
| A4 | Additional | `staticFilters`, `staticLimits`, `personalFilters`, `skipPersonalFilter` | A constant filter and limit per entity; the personal filter is taken from a filter field of the graphql-fns User entity (or an entity linked to it) found by `userAttributes.id` |
| A5 | Subscriptions | `subscribePayloadFilters` | The same kind of functions, applied to the payload of every event. The subscription itself is authorized once, on `subscribe`: without access to it no events are sent (B26). `filters`, `staticFilters` and `personalFilters` do not apply to events, so `subscribePayloadFilters` are required together with `filters` when subscriptions are available (B27) |

`composeServersideConfig` checks consistency at startup: `getUserAttributes` is present for A2–A5, roles in `containedRoles` and `inventoryByRoles` match, filters are correct (calling them for every role with test attributes).

**Contract:** `getUserAttributes: (context, token?: string) => Promise<{ roles: string[]; id?: string; [key: string]: any }>`. `roles` is required, the other fields are passed to `filters` functions next to `role`; `id` is needed only for `personalFilters` and must be the id of a User record in graphql-fns; `token` is the value of the `token: String` argument of root queries and mutations; `node` (B25) and subscriptions have no `token` argument, the user is determined from `context` only.

### 13.3. Caching `userAttributes` (B23)

- The cache is bound to the triple (the `getUserAttributes` callback, the `context` object, `token`) via `createObjectBoundStore` (WeakMap), so it is released together with `context`.
- The promise is cached, so parallel resolvers of one request wait for a single call.
- A rejected promise is removed from the cache: the next resolver calls `getUserAttributes` again.
- If `context` is not an object, there is no cache.
- **Requirement:** `context` must be created per request (Apollo Server, graphql-yoga and `graphql-ws` with a `context` function all do so). If `context` lives longer (e.g. one object for a whole WebSocket connection), the attributes are fixed for its whole lifetime.

### 13.4. Risks left to the project

| ID | Summary | What to do |
|---|---|---|
| A6 | Anonymous user: with `filters` or `inventoryByRoles`, a `null` result of `getUserAttributes` causes a `TypeError` | Return `{ roles: ['guest'] }` and describe `guest` in `containedRoles` / `inventoryByRoles` |
| A7 | `personalFilters` read the **graphql-fns** User entity (collection `user_things`), not the user of the external authentication system | Sync a User record with the same `id` (for better-auth: the `databaseHooks.user.create.after` hook) |
| A8 | Subscriptions are authorized once: after a session is revoked or the user is banned, they keep receiving events until reconnecting | Close connections on sign-out/ban; for WebSocket take headers at connection time |
| A9 | `token` in arguments ends up in the request body and from there in logs and the persisted queries cache | For HTTP prefer a cookie / the `Authorization` header; use `token` only for special cases |
| A10 | Access denial returns `null` (queries of a single entity), `[]` / `0` (lists and counts), an empty connection, or no events (subscriptions); the client cannot tell "no access" from "not found". Mutations return `null` for the non-null type `X!`, so the client gets a generic `Cannot return null for non-nullable field` error | By design; take it into account in the UX |
| A11 | Configuration error messages (`Not found "getUserAttributes" callback…`) are sent to the client as GraphQL errors | Mask internal errors at the server level (`formatError` / `maskedErrors`) |
| A12 | Custom (manually defined) resolvers are called even when access is denied: `authDecorator` passes them `involvedFilters` with `null` values (e.g. `inputOutputFilterAndLimit: null`) | Check `involvedFilters` in the custom resolver and return `null` / `[]` on denial |
| A13 | `workOutMutations` bypasses authorization (full access `[[]]`): it is a server-side utility | Call it only from trusted server code, after checking permissions yourself |
| A14 | Minor code issues: the check `if (!involvedFilters) return null` in `authDecorator` never fires (`involvedFilters` is always an object); `limit === limit` in `getFilterFromInvolvedFilters` is always true | Cleanup, no behaviour impact |
