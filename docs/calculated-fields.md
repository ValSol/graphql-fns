# Calculated fields: current implementation and redesign

> Identifiers: `CF…` facts about the current implementation, `U…` usage in a real project that uses the library, `D…` agreed decisions, `?…` open questions and risks. To agree, object or clarify, refer to the ID.
> Marks: ✅ verified by running code; 📖 conclusion from reading the code only.
> Status: the redesign (§5) is implemented; the migration of a real project (§6, step 9) revealed ?11–?14, fixed since; the project works with 0.1.2-beta.1155. §0 describes how to use calculated fields now; §1–§4 describe the implementation **before** the redesign, which the decisions of §5 refer to.

**Implementation log**

| Commit | What was done |
|---|---|
| `0b302417` | CF24: calculated fields of previous entities only if they are returned or reported |
| `827dc7ea` | §6 step 0: end-to-end tests `src/calculatedFields.mtest.ts` |
| `51d51101` | RP4 ([representations.md](./representations.md)): `addFields` of a representation no longer leak into the root config |
| `04854fb8` | D1, D2, D8, ?6 (steps 1–4): callbacks in `serversideConfig.calculatedFields`, `async` flag, compose-time validation, projection built by the fetching resolvers |
| `4800c6d1` | D3–D7, D9–D13, ?4, ?5 (steps 5–7): field resolvers, hidden context, fallback, `materializeCalculatedFields` |
| `0c4a030d` | ?10: calculated fields added by representations |
| `371e9ac7` | ?11: `fieldsToUseNames` of inherited calculated fields of representations are checked against the root config |
| `0dd27898` | ?12, ?13: connection and `node` queries pass resolver options on; `node` keeps the hidden context |
| `cd008877` | ?14: values of calculated fields are never taken from the database |
| `01760fa2` | ?14: no calculated fields in the projections of `copy…` |
| `8df3660d` | ?14: no calculated fields in `copy…OptionsEnum` |

---

## 0. How to use

> Upgrading a project from the previous version: [migration.md](./migration.md).

**Declaration** in `generalConfig` (shape of the GraphQL field only, no functions, safe to import in client code):

```ts
{
  name: 'Book',
  textFields: [{ name: 'title' }],
  intFields: [{ name: 'price' }],
  calculatedFields: [
    { name: 'priceWithTax', calculatedType: 'floatFields', inputTypes: { rate: 'Float' } },
    { name: 'summary', calculatedType: 'virtualFields', configName: 'Summary', async: true },
  ],
}
```

**Callbacks** in `serversideConfig.calculatedFields`, by entity (or representation) config name and field name:

```ts
const serversideConfig: ServersideConfig = {
  calculatedFields: {
    Book: {
      priceWithTax: {
        fieldsToUseNames: ['price'], // added to the Mongo projection
        func: (args, data) => data.price * (1 + (args.rate ?? 0)),
      },
      summary: {
        // once per root resolver call: an entity for single-entity actions, an array for list actions
        asyncFunc: async (args, resolverCreatorArg, resolverArg, entityOrEntities) =>
          Array.isArray(entityOrEntities) ? entityOrEntities.map(toSummary) : toSummary(entityOrEntities),
        func: (args, data, resolverArg, asyncFuncResult, index) =>
          Array.isArray(asyncFuncResult) ? asyncFuncResult[index] : asyncFuncResult,
      },
    },
  },
};
```

Rules:

- `async: true` in the declaration if and only if the callbacks have `asyncFunc`; `func` is required; `fieldsToUseNames` must name fields of the entity (`id`, `createdAt`, `updatedAt` and `counter` are allowed); for a field a representation inherits (callbacks under the root name) fields of the root entity, also those the representation hides with `excludeFields`/`includeFields`, since its resolvers query the root collection. `composeTypeDefsAndResolvers` checks all this and also rejects callbacks of unknown entities or fields; `func`/`asyncFunc`/`fieldsToUseNames` in the declaration are rejected by `composeAllEntityConfigs`.
- `func` gets the args of its own field (aliases with different args work), the raw entity (mongo ids), the arg of the root resolver (e.g. `resolverArg.args.token`), the result of `asyncFunc` and the index in the list.
- `asyncFunc` gets the args of the field (the same for all aliases) and the `resolverCreatorArg` of the root entity, also for representations.
- Values of calculated fields are never read from the database: a stored property with the name of a calculated field (e.g. left by old data) is neither fetched nor used.
- A calculated field of an entity that did not come from a root resolver (a custom resolver, a serializing PubSub) is calculated like for a single-entity action.
- Resolvers called from code (`composeQueryResolver(…)`, including `…_ThroughConnection` for `edges[].node`, mutation resolvers, `workOutMutations`) return calculated values only with `materializeCalculatedFields: true` in their resolver options; otherwise they are calculated by the field resolvers when the result goes through GraphQL.
- Subscriptions: calculated fields of `WherePayloadInput`/`WhichUpdatedInput` (without `async`, or listed in `allowedCalculatedWithAsyncFuncFieldNames`) are published with the event; the other ones are calculated for every subscriber.

## 1. Declaration before the redesign

Calculated fields are declared in `SimplifiedEntityConfig.calculatedFields` (tangible entities only; forbidden for embedded ones) and therefore live in `generalConfig.allEntityConfigs`. See `src/tsTypes/index.ts` (`ScalarSimplifiedCalculated…Field` / `ArraySimplifiedCalculated…Field`).

| ID | Property | Role | Used by |
|---|---|---|---|
| CF1 | `name`, `calculatedType`, `array`, `nullable`, `required` | shape of the GraphQL field | SDL |
| CF2 | `configName` / `enumName` / `geospatialType` | type of the value, depending on `calculatedType` | SDL, resolvers |
| CF3 | `inputTypes` | arguments of the field (`name(arg: Type)`); arrays also get `slice` | SDL (`src/types/createEntityType.ts` `calculatedArgs`) |
| CF4 | `fieldsToUseNames` | DB fields the calculation depends on; added to the Mongo projection | projection only |
| CF5 | `asyncFunc` | async part of the calculation, runs once per root resolver call | runtime **and SDL** (see CF14) |
| CF6 | `func` | sync part, runs once per entity | runtime |

`calculatedType` values: `booleanFields`, `dateTimeFields`, `intFields`, `floatFields`, `textFields`, `enumFields`, `geospatialFields`, `embeddedFields`, `virtualFields`, `filterFields`.

Signatures (📖):

```ts
type CalculatedFieldAsyncFunc = (
  args: Record<string, any>,            // field args (from `inputTypes`)
  resolverCreatorArg: ResolverCreatorArg, // { entityConfig, generalConfig, serversideConfig, … }
  resolverArg: ResolverArg,             // ROOT resolver arg (for mutations: with substituted `args`, CF10)
  notAsyncCalculatedFieldValues?: any,  // an entity object OR an array of entities (CF9)
) => Promise<any>;

func: (
  args: Record<string, any>,
  data: DataObject,                     // the entity
  resolverArg?: ResolverArg,            // ROOT resolver arg (original, not substituted)
  asyncFuncResult?: any,                // what `asyncFunc` returned for this field
  index?: number,                       // position of the entity in the list (0 for single-entity actions)
) => value;
```

## 2. SDL generation

| ID | Fact |
|---|---|
| CF7 | `createEntityType` maps `calculatedType` to a GraphQL type: scalars → `String`/`Int`/`Float`/`DateTime`/`Boolean`, `enumFields` → `${enumName}Enumeration`, `geospatialFields` → `Geospatial${geospatialType}`, `embeddedFields`/`virtualFields` → `configName` type, `filterFields` → child fields like regular filter fields (with `ThroughConnection`/`Count`/`DistinctValues` for arrays). `inputTypes` for `filterFields` are not supported yet (TODO in `createEntityType.ts:181`). |
| CF8 | Calculated geospatial values are not converted from the Mongo format: `func` must return the GraphQL format (see `schema-and-resolvers-analysis.md` ?9). |

## 3. Runtime before the redesign

### 3.1. Pipeline

1. **Projection.** `adaptProjectionForCalculatedFields` adds `fieldsToUseNames` of every requested calculated field to the projection. It is called from `getInfoEssence`, `createInfoEssence` and `getProjectionFromInfo`.
2. **Root resolver** fetches the entity(ies), then:
   - `getAsyncFuncResults(infoEssence, resolverCreatorArg, resolverArg, entityOrEntities)` calls `asyncFunc` of every **requested** field (`projection[name] === 1`) once, with `fieldArgs[name]`, in parallel;
   - `addCalculatedFieldsToEntity(entity, infoEssence, asyncFuncResults, resolverArg, entityConfig, index)` calls `func` of every requested field and writes the value into the entity.
3. **Type resolvers** (`composeEntityResolvers`) only post-process the already written values: calculated `embeddedFields` arrays get `fieldArrayResolver` (`slice`), calculated `filterFields` get the filter resolvers that read the filter value from `parent[name]` and query the target entity.

The pair `getAsyncFuncResults` + `addCalculatedFieldsToEntity` is called manually in four places:
`createEntityQueryResolver`, `createEntitiesQueryResolver`, `composeStandardMutationResolver`, `workOutMutations`.

### 3.2. Contract details

| ID | Fact |
|---|---|
| CF9 | **Cardinality.** Single-entity actions (`createEntityQueryResolver`, non-array mutations) pass the entity **object** to `asyncFunc` and `index = 0` to `func`; `asyncFunc` returns the result for that one entity. List actions (`createEntitiesQueryResolver`, array mutations) pass the **array** of entities; `asyncFunc` returns an array and `func` picks its element by `index`. `index` is meaningful only for lists. So `func` has to know the cardinality (see U2, U3). |
| CF10 | **Mutations substitute `args` for `asyncFunc`.** `workOutMutations` / `composeStandardMutationResolver` call `asyncFunc` with `resolverArg.args` replaced by `{ where: { id_in } \| whereOne: { id }, token }`, so mutation args (`data` etc.) do not leak into `asyncFunc`. `func` gets the original `resolverArg`. |
| CF11 | **Batching is built into the contract:** `asyncFunc` runs once for the whole list, `func` + `index` distribute its result. No DataLoader-like batching is needed. |
| CF12 | **Aliases.** `fieldArgs[name]` holds one set of args per field name, so `a: f(x: 1)` and `b: f(x: 2)` in one query are not supported. |
| CF13 | Calculated fields are computed only in the four root resolvers. Entities returned by other paths (custom resolvers) have no calculated values unless those resolvers call the helpers themselves. |

### 3.3. `asyncFunc` also affects the schema

| ID | Fact |
|---|---|
| CF14 | The **presence** of `asyncFunc` (not its body) is read at SDL generation time: `XWherePayloadInput` (`createEntityWherePayloadInputType.ts:69`) and `XWhichUpdatedInput` (`createEntityWhichUpdatedInputType.ts`, `WITHOUT_CALCULATED_WITH_ASYNC`) include a calculated field only if it has no `asyncFunc` or is listed in `allowedCalculatedWithAsyncFuncFieldNames`. `composeGqlTypes` receives only `generalConfig`. |
| CF15 | The same rule is used at runtime for subscriptions: `composeSubscriptionDummyEntityConfig` (runtime `wherePayload` filter), `composeSubscriptionUpdatedFields`, and the "all fields" projection used to build the subscription payload in `authDecorator` and `produceResult` (`composeAllFieldsProjection(…, WITHOUT_CALCULATED_WITH_ASYNC)`). Fields of the `subscriptionActor` config are also kept. |
| CF16 | Consequence: sync calculated fields are computed **eagerly** into the object published to subscribers, and the runtime `wherePayload` filter reads them from that object. |
| CF17 | `composeReport` builds the published message from the same eagerly computed node: `updatedFields = diff(node, previousNode)` (so `XWhichUpdatedInput` sees sync calculated fields) and `actor` is taken from `node` fields of `subscriptionActorConfig`. |

### 3.4. What happens to an entity after the root resolver (📖, ✅ where marked)

| ID | Fact |
|---|---|
| CF18 | `addIdsToEntity` (`_id` → `id`) runs inside the root resolver before the calculated fields are added. |
| CF19 | `resolverDecorator` passes every root result through `transformAfter`: relational/duplex ids become global ids, `id` becomes a global id, `_token` (root `args.token`) is added; child and embedded fields are transformed recursively. The object is rebuilt with rest/spread. Subscriptions call `transformAfter` on `node` / `previousNode` / `actor` as well. |
| CF20 | **So `func` today sees the raw entity** (`id` and relational ids as Mongo ids, no `_token`), while a field resolver's `parent` is the transformed one. |
| CF21 | (Considered for D5, not used.) Object rest/spread copy own enumerable `Symbol` properties ✅ (`const { a, ...r } = o` and `{ ...o }` both keep `o[sym]`; `JSON.stringify` drops it). So a `Symbol` context survives `addIdsToEntity`, `transformAfter` and in-memory PubSub, and is lost only by a serializing PubSub. |
| CF22 | Connections (`getVeryFirst`/`getFirst`/`getLast`/…) put the entities returned by `entitiesQueryResolver` into `edges[].node` by reference; `index` refers to the fetched list (including the extra `first + 1` element), which is exactly the list `asyncFunc` got. ✅ They pass the resolver options of the connection (`materializeCalculatedFields`, `calculatedFieldsConfig`) on to `entitiesQueryResolver` with the modified `involvedFilters` (?12). |
| CF23 | Relational, duplex and filter field resolvers (`createEntityScalarResolver`, `createEntityArrayResolver`, `createEntityFilter*Resolver`, …) call the child query resolvers, i.e. the same root resolvers, so nested entities get their own context with their own root `resolverArg` (`args` include `token: parent._token`). |
| CF24 | ✅ **[fixed `0b302417`]** List mutations (`updateManyBooks`) called `asyncFunc` twice: for the previous entities and for the returned result, and `composeStandardMutationResolver` did it inside the transaction retry loop. Calculated fields of previous entities are needed only when they are returned (`delete…`, `produceCurrent: false`) or reported (single `update…`/`pushInto…`/`delete…` when the subscription is allowed by the inventory, i.e. `report` is not `null`); list mutations have no subscriptions. Now `composeStandardMutationResolver` and `workOutMutations` skip them otherwise (`previousIsUsed`). |
| CF25 | ✅ Confirms CF13 for subscriptions: a subscriber gets `null` for an async calculated field that is not in `allowedCalculatedWithAsyncFuncFieldNames` (it is neither in the published payload nor calculated later). |

## 4. Usage in a real project

A project with a few dozen calculated field definitions (many are factories reused across entities), about half of them with `asyncFunc`; the declarations are kept in one module of the entity configs, the callbacks in separate server-side modules.

| ID | Pattern |
|---|---|
| U1 | Most async fields are `virtualFields` (permissions of the current user, parents, breadcrumbs, an excerpt of the creator, …): `asyncFunc` does the work, `func` only delivers the result. |
| U2 | A generic `func` shared by these fields returns `Array.isArray(asyncFuncResult) ? asyncFuncResult[index] : asyncFuncResult`, i.e. it relies on CF9. |
| U3 | Array-valued fields (`array: true`, e.g. the containers of an entity) use a custom `func` that returns `asyncFuncResult` as is. Wrapping a single entity into `[entity]` would break them. |
| U4 | `asyncFunc` callbacks call `composeQueryResolver(...)` with `createInfoEssence(...)` programmatically, outside GraphQL execution. |
| U5 | Root args are used: callbacks read `token` from the root `resolverArg.args` to decode the current user. |
| U6 | `inputTypes` is used for field args like `{ lang: 'LangEnumeration' }` (a project enum); `fieldsToUseNames: []` is common for fields that need only `_id`. |

## 5. Redesign

### 5.1. Agreed decisions

| ID | Decision |
|---|---|
| D1 | `generalConfig` describes **what** is in the schema, `serversideConfig` **how** it is calculated (the same split as `generalConfig.custom` signatures vs `serversideConfig.Query/Mutation` resolvers). Reason: client code imports parts of `generalConfig` (at least `enums`), and `asyncFunc` pulls in server-only code (models, mongoose). |
| D2 | `func`, `asyncFunc` and `fieldsToUseNames` move to `serversideConfig`; `name`, `calculatedType`, `array`, `nullable`, `required`, `configName`/`enumName`/`geospatialType`, `inputTypes` stay in `generalConfig`, plus the new `async` flag (D8). Shape in `serversideConfig`: |

```ts
calculatedFields?: {
  [entityName: string]: {
    [fieldName: string]: { func; asyncFunc?; fieldsToUseNames? };
  };
};
```

| ID | Decision |
|---|---|
| D3 | They are **not** merged back into `EntityConfig` at compose time. Calculated fields are implemented as field resolvers. |
| D4 | No extra batching (CF11). The `func` / `asyncFunc` contract, including `index` and cardinality (CF9), stays unchanged, so migrating a project means moving the callbacks, not rewriting them. |
| D5 | **Hidden calculated context.** The root resolver still calls `asyncFunc` over the whole list (with the CF10 substitution for mutations) and attaches to every entity `{ data, asyncFuncResults, index, resolverArg }` (`src/resolvers/utils/calculatedContext`). It is kept in a module-level `WeakMap<entity, context>`, not in the entity: an enumerable `Symbol` property would be compared by Jest `toEqual` (entities of existing tests and projects' tests are compared with `toEqual`, and the context holds `context`/`info`), a non-enumerable one would be lost by spread. The only code that rebuilds entities after the root resolver, `transformAfter` (CF19), passes the context on with `copyCalculatedContext`; connections keep node references (CF22). Field resolvers (`src/resolvers/types/composeCalculatedFieldResolver`) call `func(args, context.data, context.resolverArg, context.asyncFuncResults[name], context.index)`. |
| D6 | The context stores the **original root** `resolverArg` (the one `func` gets today), because root args are used (U5). |
| D7 | **Fallback** when the context is missing: behave like a single-entity action: `asyncFunc(args, resolverCreatorArg, resolverArg, parent)` with the entity **object**, then `func(…, index = 0)`. Passing `[parent]` would break U3. In the fallback `resolverArg` is the field-level one. |
| D8 | **`async: true` flag** in the `generalConfig` declaration of a calculated field replaces the check for `asyncFunc` presence at SDL generation time (CF14) and in the subscription helpers (CF15): `composeFieldsObject(…, WITHOUT_CALCULATED_WITH_ASYNC)`, `createEntityWherePayloadInputType`, `composeSubscriptionDummyEntityConfig`. `allowedCalculatedWithAsyncFuncFieldNames` stays in `generalConfig` (it affects the SDL too). Compose-time validation both ways: `async: true` ⇔ `asyncFunc` in `serversideConfig`. (Resolves former ?1.) |
| D9 | **`wherePayload` values are computed separately, once per published event**, on the publishing side (`produceResult` and its equivalents): the calculated fields selected by `composeAllFieldsProjection(…, WITHOUT_CALCULATED_WITH_ASYNC)` (sync ones, those in `allowedCalculatedWithAsyncFuncFieldNames` and `subscriptionActor` fields; they feed `wherePayload`, `updatedFields` and `actor`, CF17) are materialized and put into the published message as plain data, for both `node` and `previousNode` of `updatedX`. `produceResult` and `authDecorator` already call the query resolvers with exactly this projection when a subscription is involved, so D9 is implemented by passing the D10 opt-in there. Plain data survives any PubSub; the cost is one calculation per event, not per subscriber; `asyncFunc` of allowed async fields keeps running with the `resolverArg` of the mutation author, as today. Calculated fields selected by a subscriber are delivered by field resolvers via the D7 fallback. (Resolves former ?2.) |
| D10 | **Root resolvers calculate at once on explicit opt-in**: `materializeCalculatedFields: true` in the 5th argument of query resolvers (`prepareCalculatedFields` chooses between `addCalculatedFieldsToEntity` and the context) and in `resolverOptions` of mutations (`produceResult` passes it on, also for `workOutMutations`). The root resolver cannot tell whether its result goes to the GraphQL executor or to the calling code, so no heuristic is used. A field resolver returns an own property with the calculated field's name as is ("materialized"), which also survives a serializing PubSub (tested with a JSON round-trip PubSub). Calculated fields of previous entities of mutations (CF24) are always materialized. ✅ **[`cd008877`, ?14]** A materialized value is an own property that only materialization (or code that puts it into the object itself) creates: properties with the names of calculated fields are removed from fetched records (`removeCalculatedFieldValues`) and not fetched (`adaptProjectionForCalculatedFields`), so data from the database is never taken for a materialized value. |
| D11 | **One calculation contract**: `getAsyncFuncResults` (once per list) + `func` with `index`, used by `addCalculatedFieldsToEntity` (materialization) and by the context of field resolvers; the fallback (D7) calculates like a single-entity action, memoized per parent, field name and args. |
| D12 | **All resolvers of a calculated field get its value through one accessor built on the D11 helper**, e.g. `getCalculatedFieldValue(parent, name, …)`: (1) a materialized value (D10) is returned as is; (2) with the hidden context: `func(args, context.data, context.resolverArg, context.asyncFuncResults[name], context.index)`; (3) without it: the D7 fallback via D11. Plain calculated fields return the value; calculated `embeddedFields` arrays pass it to the `fieldArrayResolver` logic (`slice`); calculated `filterFields` use it as the filter in every variant (`x`, `xThroughConnection`, `xCount`, `xDistinctValues`). In the fallback the result is memoized per `parent` + field name (`WeakMap`), so `x` and `xCount` requested together do not run `asyncFunc` twice. `func` gets the args of the base field, not of the variant (the variants' own args are `where`/`sort`/`pagination`; calculated `filterFields` have no `inputTypes` yet, CF7). The projection needs no change: `getSimpleProjectionFromResolvedInfo` already maps `xThroughConnection` / `xCount` / `xDistinctValues` to `x`, so `fieldsToUseNames` and `asyncFunc` are applied for a variant too. (Resolves former ?4.) ✅ Step (1) relies on ?14: an own property can come only from materialization or from code, never from the database. |
| D13 | **The context also stores the raw entity**: `{ data, asyncFuncResults, index, resolverArg }`, where `data` is the entity right after `addIdsToEntity` (CF18). Field resolvers call `func(args, context.data, …)`, not `func(args, parent, …)`, so `func` keeps seeing the same data as today (CF20) instead of the `transformAfter` output. In the D7 fallback only the transformed `parent` is available; this difference is accepted and documented, the fallback serves only paths that compute nothing today (CF13). (Resolves former ?5.) |

Expected gains: calculated values no longer depend on the four root resolvers remembering to compute them (CF13), and `func` gets per-field args (CF12 is solved for `func`, not for `asyncFunc`).

### 5.2. Open questions and risks

Former ?1–?5 are resolved by D8–D10, D12 and D13; the other IDs are kept.

| ID | Question |
|---|---|
| ?6 | **Compose-time validation:** every calculated field in `generalConfig` has a `func` in `serversideConfig`, there is no `func` for an unknown entity/field, and `async: true` matches `asyncFunc` (D8). |
| ?7 | **`asyncFunc` and aliases** (CF12) remain unsupported: `asyncFunc` still runs in the root resolver with `fieldArgs[name]`; `func` gets the args of its own field, so aliases of sync fields work (tested). |
| ?8 | Public helpers exported from `src/index.ts` (`adaptProjectionForCalculatedFields`, `WITHOUT_CALCULATED_WITH_ASYNC`, …) take `entityConfig` only; their signatures change once calculated callbacks come from `serversideConfig`. |
| ?9 | Breaking change: a major release (semantic-release), plus migration of the projects that use the library. |
| ?10 | ✅ **[fixed `0c4a030d`]** Calculated fields added by a representation (`addFields`) were unknown to the root resolver; now it takes calculated fields from `resolverOptions.calculatedFieldsConfig` passed by generated representation resolvers. See [representations.md](./representations.md) ?RP1. |
| ?11 | ✅ **[fixed `371e9ac7`]** `checkCalculatedFieldsCallbacks` checked `fieldsToUseNames` against the fields of the representation config also for calculated fields it inherits, whose callbacks are taken by the root name, so the main case of representations (hide the raw field, show the calculated one) threw `Incorrect field` (dozens of fields in a real project). Now the fields of the config the callbacks are taken from are used: the root config for callbacks under the root name, the representation config for callbacks under its own name. At runtime nothing changed: the projection comes from the query (`getSimpleProjectionFromResolvedInfo`), is not filtered by the fields of any config, and `adaptProjectionForCalculatedFields` adds `fieldsToUseNames` of the callbacks found; tested with a representation that excludes `price` and keeps `priceWithTax`. |
| ?12 | ✅ **[fixed `0dd27898`]** `createEntitiesThroughConnectionQueryResolver` built its `resolverArg.resolverOptions` as `{ involvedFilters }`, and `getFirst`/`getVeryFirst`/`getLast`/`getVeryLast`/`getShift` called the list (single) resolver with `{ involvedFilters }`: `materializeCalculatedFields` from code and `calculatedFieldsConfig` of representation connection actions (?10) were lost, so nodes of `X_ThroughConnection` called from code had no values and fields of `addFields` in `XsThroughConnectionForY` had no `fieldsToUseNames` in the projection and no batched `asyncFunc`. Now the options are passed on with the modified `involvedFilters`. The other delegating query resolvers (`childEntities`, `childEntity`, `entitiesByUnique`, `childEntitiesThroughConnection`) pass the options as given; the internal calls with `createInfoEssence({ projection: { _id: 1 } })` (`near` + `search` ids, count of `getVeryLast`) stay without them. |
| ?13 | ✅ **[fixed `0dd27898`]** `createNodeQueryResolver` called the root query resolver without `calculatedFieldsConfig` for a global id of a representation, and rebuilt the entity with `{ ...transformAfter(…), __typename }`, which lost the hidden context (D5): every calculated field fell back to the D7 path, so `asyncFunc` ran twice for `node` of a root entity and fields of `addFields` got no `fieldsToUseNames`. Now it passes the representation config and copies the context with `copyCalculatedContext`. |
| ?14 | ✅ **[fixed `cd008877`]** **Values of calculated fields were taken from the database.** `getSimpleProjectionFromResolvedInfo` maps `xCount`/`xThroughConnection`/`xDistinctValues` to `x`, and requested calculated fields were kept in the Mongo projection, so a stored property with the name of a calculated field (old data; in a real project a stored `"{}"` under the name of a calculated filter field of one entity turned the filter into "all entities") came back as an own property of the record, and D12 step (1) returned it as a materialized value without calling `func`. Paths that fetch the whole document (`getPrevious` of `delete…`: `findOne(conditions, null)`) brought such properties even without a projection, e.g. into a published `node` for fields the mutation did not request. Before the redesign the root resolver always overwrote them. Now: `adaptProjectionForCalculatedFields` removes the calculated fields of the config they are calculated by from the projection (and returns `{ _id: 1 }` instead of an empty projection, which would fetch the whole document); `removeCalculatedFieldValues` deletes such properties from every record right after the fetch, before `asyncFunc`, the context and materialization, in `createEntityQueryResolver`, `createEntitiesQueryResolver` (so connections, child, `node` and `produceResult` too) and for `previous` of `composeStandardMutationResolver` and `workOutMutations` (so `copy…`, `delete…`, subscriptions' `previousNode`/`node`). Writes are safe: mongoose schemas have no calculated fields and `bulkWrite` runs with `strict: true`, so neither stored junk nor materialized values reach Mongo (tested for `update…` and `copy…`). ✅ **[`01760fa2`]** Calculated fields have no place in any Mongo projection: `copy…` resolvers built theirs from `getMatchingFields`, which includes calculated fields, now `getMatchingFields` skips calculated fields, so they are neither fetched nor copied, and **[`8df3660d`]** they are also gone from `copy…OptionsEnum` of the SDL (`fieldsToCopy`, `fieldsForbiddenToCopy`) and no longer make a copy mutation or `whereTarget` possible on their own (`canBeCopyTarget`, `…WhereKeyToSourceInput`). A test records the projections of all Mongo commands (`mongoose.set('debug', …)`) for queries of every calculated field variant and for `copy…`. |

## 6. Implementation plan

Every step is one commit (or a few), and `yarn typecheck && yarn lint && yarn test:once && yarn test:mongodb` passes after each. Steps 0–8 are in graphql-fns, step 9 is in a project that uses it. The last library commit carries a `BREAKING CHANGE:` footer.

### Step 0. Safety net: end-to-end tests on the current implementation

**Done** in `827dc7ea`: `src/calculatedFields.mtest.ts` (15 tests at that point, 22 now). `configs/jest.config.mongodb.js` maps `graphql` to its CJS build: under `--experimental-vm-modules` the ESM build makes a require(esm) cycle with CJS dependencies (`graphql-parse-resolve-info`, `@graphql-tools/schema`) as soon as the whole schema is composed. Findings: CF24 (fixed), CF25.

Before changing anything, add `*.mtest.ts` tests that run real GraphQL operations (`graphql()` over `composeTypeDefsAndResolvers`, in-memory MongoDB) and check calculated values:

- single entity (`X`) and list (`Xs`): sync `func`; `asyncFunc` + `index` (CF9, list returns an array, single returns a value); `fieldsToUseNames` really fetched; field args from `inputTypes`;
- `XsThroughConnection` (CF22), a nested entity via a relational field (CF23);
- mutation results (`createX`, `updateManyXs`) with the `asyncFunc` args substitution (CF10);
- calculated `embeddedFields` array with `slice`, calculated `filterFields` in all variants (`x`, `xThroughConnection`, `xCount`, `xDistinctValues`);
- subscriptions: `wherePayload` by a sync calculated field, `whichUpdated` by a calculated field, `actor` (CF15–CF17);
- `func` receives the raw entity (CF20): assert the type of `data.id` / a relational id inside `func`.

The tests build configs through one small helper, so in later steps only the helper changes (callbacks move from `generalConfig` to `serversideConfig`) while the assertions stay.

### Step 1. Types and config lookup (D1, D2, D8)

**Done** together with steps 2–4 in `04854fb8`: types and the readers of callbacks can only change at once.

- `src/tsTypes/index.ts`: remove `func`, `asyncFunc`, `fieldsToUseNames` from `ScalarSimplifiedCalculated…Field` / `ArraySimplifiedCalculated…Field` and from `…CalculatedField`; add `async?: true`. Add `CalculatedFieldCallbacks = { func; asyncFunc?; fieldsToUseNames? }` and `ServersideConfig.calculatedFields?: { [entityName]: { [fieldName]: CalculatedFieldCallbacks } }`.
- New `src/resolvers/utils/getCalculatedFieldCallbacks`: `(entityConfig, fieldName, generalConfig, serversideConfig)` → callbacks. Representation configs copy calculated fields of the original entity (`composeRepresentationConfig`), so the lookup tries the representation entity name first and then the root name (`parseEntityName(…).root`). Cached per config objects (`createObjectBoundStore`).
- `composeEntityConfig`: the `fieldsToUseNames` validation (field exists, `counter` allowed) moves to step 2's validator.

### Step 2. Compose-time validation (?6, D8)

New `src/resolvers/utils/checkCalculatedFieldsCallbacks`, called at the start of `composeGqlResolvers`:

- every calculated field of every tangible entity has callbacks with `func`;
- every entry in `serversideConfig.calculatedFields` points to an existing entity and calculated field;
- `async: true` ⇔ `asyncFunc`;
- `fieldsToUseNames` refer to existing fields (moved from `composeEntityConfig`).

Unit tests for each error message.

### Step 3. `async` flag instead of `asyncFunc` presence (D8)

Replace the `asyncFunc` check with `async` in `composeFieldsObject` (`WITHOUT_CALCULATED_WITH_ASYNC`), `createEntityWherePayloadInputType`, `composeSubscriptionDummyEntityConfig`. SDL generation stays `generalConfig`-only. Existing unit tests are updated from `asyncFunc: …` to `async: true`; `schema.test.ts` / `composeGqlTypes.test.ts` snapshots must not change.

### Step 4. Projection from `serversideConfig` (CF4, ?8)

`adaptProjectionForCalculatedFields` gets its `fieldsToUseNames` from `serversideConfig`. Instead of passing `serversideConfig` into `getInfoEssence` / `createInfoEssence` / `getProjectionFromInfo` (public, used by projects, ~20 internal call sites), the adaptation moves to the places that build the Mongo projection for entities whose calculated fields are computed: `createEntityQueryResolver`, `createEntitiesQueryResolver` and the `getPrevious` / `workOutMutations` paths of mutations; they all have `resolverCreatorArg`. The three info helpers keep their signatures and stop adapting. `adaptProjectionForCalculatedFields` (exported) gets a `serversideConfig` argument.

### Step 5. Context, helper and accessor (D5, D6, D7, D11, D12, D13)

**Done** together with steps 6–7 in `4800c6d1`: without the opt-in materialization the subscription payload would lose calculated values. Differences from the plan: the context is kept in a `WeakMap` (D5) instead of a `Symbol` key; `addCalculatedFieldsToEntity` stays as the materializer, `prepareCalculatedFields` chooses between it and the context; the accessor is `composeCalculatedFieldResolver`.

New modules in `src/resolvers/utils/calculatedFields/`:

- `calculatedContext.ts`: the `Symbol` key, `attachCalculatedContext(entity, { data, asyncFuncResults, index, resolverArg })`, `getCalculatedContext(entity)`;
- `materializeCalculatedFields.ts` (D11): for an entity or a list and a set of field names, runs `asyncFunc` once (the current `getAsyncFuncResults`, reading callbacks via step 1) and then `func` with `index`; writes the values as own properties;
- `getCalculatedFieldValue.ts` (D12): own property → return it; context → `func(args, context.data, context.resolverArg, context.asyncFuncResults[name], context.index)`; otherwise the fallback (D7) through `materializeCalculatedFields` for the single entity, memoized in a `WeakMap<parent, Map<fieldName, Promise>>`.

Unit tests for all three branches, list vs single cardinality, memoization.

### Step 6. Root resolvers and field resolvers (D3, D5, D12)

- `createEntityQueryResolver`, `createEntitiesQueryResolver`, `composeStandardMutationResolver`, `workOutMutations`: keep the `asyncFunc` call (with the CF10 substitution), replace `addCalculatedFieldsToEntity` with `attachCalculatedContext`. The entity passed as `data` is the one after `addIdsToEntity`, i.e. exactly what `func` gets today.
- `composeEntityResolvers`: a resolver for every calculated field: plain ones return `getCalculatedFieldValue`; calculated `embeddedFields` arrays apply the `fieldArrayResolver` `slice` logic to that value; for calculated `filterFields` the filter resolvers (`createEntityFilterScalarResolver`, `…ArrayResolver`, `…ConnectionResolver`, `…CountResolver`, `…DistinctValuesResolver`) take a value getter instead of reading `parent[name]` (regular filter fields pass `(parent) => parent[name]`).
- Remove `addCalculatedFieldsToEntity` and its test.

Step 0 tests must pass unchanged here.

### Step 7. Opt-in materialization and subscriptions (D9, D10)

- The 5th argument of the query resolvers gets `materializeCalculatedFields?: boolean`; when set, root resolvers call `materializeCalculatedFields` for the requested fields instead of only attaching the context.
- `produceResult` and `authDecorator` pass it together with the `composeAllFieldsProjection(…, WITHOUT_CALCULATED_WITH_ASYNC)` projection, so `composeReport` (`wherePayload`, `updatedFields`, `actor`) keeps getting plain values.
- Extra test: subscription with a JSON round-trip PubSub (a test PubSub that `JSON.parse(JSON.stringify(payload))`) to check D10's own-property detection without the `Symbol` context.

### Step 8. Public API, docs, release

**Done:** the new types are exported by `export type * from '@/tsTypes'`, no new runtime exports are needed (materialization is a resolver option); `README.md` has only a title, so the usage is described in §0 of this document.

- `src/index.ts`: export the new types, `materializeCalculatedFields` (for projects' own resolvers); keep `adaptProjectionForCalculatedFields` with the new signature.
- `README.md`: postponed, it stays a title until the whole set of documents is ready and the library rework is finished.
- This document: mark D-items as implemented with commit hashes (like the fix log in `schema-and-resolvers-analysis.md`).
- Commit footer `BREAKING CHANGE:` describing the config migration.

### Step 9. Migration of a project

- Split the module of calculated field definitions: declarations (plus `async: true` for the fields with `asyncFunc`) stay in the generalConfig; `func` / `asyncFunc` / `fieldsToUseNames` move to the serversideConfig as `calculatedFields[entityName][fieldName]`. Factories with parameters are split into a declaration factory and a callbacks factory.
- Check that the generalConfig no longer imports the callback modules and other server-only modules.
- Programmatic `composeQueryResolver` calls (U4) that read calculated values from the result pass `materializeCalculatedFields: true`.
- Run the project's tests and a smoke check of the pages that use async calculated fields.
