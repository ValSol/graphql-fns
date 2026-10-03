# Calculated fields

> How calculated fields are declared, checked and calculated.
> Identifiers: `CF…` facts, `U…` usage patterns, `?…` open questions. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> End-to-end tests: `src/calculatedFields.mtest.ts`.

## 1. How to use

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
import type { CalculatedFieldCallbacks, ServersideConfig } from 'graphql-fns';

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

- `async: true` in the declaration if and only if the callbacks have `asyncFunc`; `func` is required; `fieldsToUseNames` may be omitted (`[]`).
- The same field of several entities needs an entry for every entity (the callbacks object can be shared). A field a representation config inherits from its root entity uses the callbacks of the root entity; a field added by a representation (`addFields`) has its callbacks under the representation config name (e.g. `BookForCatalog`).
- A factory of calculated fields is two factories with the same parameters: one for the declaration (`generalConfig`), one for the callbacks (`serversideConfig`); a parameter that changes only the callbacks belongs only to the callbacks factory.
- The `generalConfig` module must not import server-only code (callbacks, models, `mongoose`): client code imports parts of it (at least `enums`).
- Resolvers called from code return calculated values only with `materializeCalculatedFields: true` (CF20).

## 2. Declaration

Calculated fields are declared in `SimplifiedEntityConfig.calculatedFields` (tangible entities only; forbidden for embedded ones). See `src/tsTypes/index.ts` (`ScalarSimplifiedCalculated…Field` / `ArraySimplifiedCalculated…Field`, `CalculatedFieldCallbacks`).

| ID | Property | Where | Role |
|---|---|---|---|
| CF1 | `name`, `calculatedType`, `array`, `nullable`, `required` | `generalConfig` | shape of the GraphQL field |
| CF2 | `configName` / `enumName` / `geospatialType` | `generalConfig` | type of the value, depending on `calculatedType` |
| CF3 | `inputTypes` | `generalConfig` | arguments of the field (`name(arg: Type)`); arrays also get `slice` |
| CF4 | `async` | `generalConfig` | the field has `asyncFunc`; affects the SDL (CF9) |
| CF5 | `fieldsToUseNames` | `serversideConfig` | DB fields the calculation depends on; added to the Mongo projection |
| CF6 | `asyncFunc` | `serversideConfig` | async part of the calculation, runs once per root resolver call |
| CF7 | `func` | `serversideConfig` | sync part, runs once per entity |

`calculatedType` values: `booleanFields`, `dateTimeFields`, `intFields`, `floatFields`, `textFields`, `enumFields`, `geospatialFields`, `embeddedFields`, `virtualFields`, `filterFields`.

Signatures (📖):

```ts
type CalculatedFieldAsyncFunc = (
  args: Record<string, any>,              // field args (from `inputTypes`)
  resolverCreatorArg: ResolverCreatorArg, // { entityConfig, generalConfig, serversideConfig, … } of the root entity
  resolverArg: ResolverArg,               // ROOT resolver arg (for mutations: with substituted `args`, CF14)
  notAsyncCalculatedFieldValues?: any,    // an entity object OR an array of entities (CF13)
) => Promise<any>;

func: (
  args: Record<string, any>,              // args of its own field
  data: DataObject,                       // the raw entity (mongo ids)
  resolverArg?: ResolverArg,              // ROOT resolver arg (original, not substituted)
  asyncFuncResult?: any,                  // what `asyncFunc` returned for this field
  index?: number,                         // position of the entity in the list (0 for single-entity actions)
) => value;
```

## 3. Startup checks

`checkCalculatedFieldsCallbacks` runs in `composeGqlResolvers` (so in `composeTypeDefsAndResolvers`) for every tangible entity and every representation config in the SDL; `composeAllEntityConfigs` rejects callbacks in the declaration.

| Error | Cause |
|---|---|
| `Forbidden "func" in calculated field: "x" of simplified entityConfig: "Y", it has to be set in "serversideConfig.calculatedFields"!` (also `asyncFunc`, `fieldsToUseNames`) | a callback in the declaration (`composeAllEntityConfigs`) |
| `Not found callbacks of calculated field "x" of entity "Y" in "serversideConfig.calculatedFields"!` | a declared field has no callbacks (also for representation configs: `YForCatalog`) |
| `Not found "func" of calculated field …` | callbacks without `func` |
| `Calculated field "x" of entity "Y" has "async: true" but not got "asyncFunc" …` / `… has "asyncFunc" … but not has "async: true"!` | the `async` flag and `asyncFunc` do not match |
| `Incorrect field: "z" in "fieldsToUseNames" of calculated field "x" of entity "Y"!` | `fieldsToUseNames` names an unknown field (CF8) |
| `Callbacks of "Y" entity in "serversideConfig.calculatedFields" have no calculated field "x"!` | callbacks of a field that is not declared (e.g. a typo) |
| `Unknown entity "Y" in "serversideConfig.calculatedFields"!` | callbacks of an unknown entity or representation config |

| ID | Fact |
|---|---|
| CF8 | ✅ `fieldsToUseNames` are checked against the fields of the config the callbacks are taken from (`id`, `createdAt`, `updatedAt`, and `counter` for entities with a counter, are allowed). For a field a representation inherits (callbacks under the root name) it is the root config, so a raw field hidden by `excludeFields`/`includeFields` may be used: the resolvers of a representation query the root collection, and the projection is not filtered by the representation's fields ([representations.md](./representations.md) RP9). For callbacks under the representation's own name (fields of `addFields`) it is the representation config. |

## 4. SDL generation

| ID | Fact |
|---|---|
| CF9 | 📖 `XWherePayloadInput` (`createEntityWherePayloadInputType`) and `XWhichUpdatedInput` (`createEntityWhichUpdatedInputType`, `WITHOUT_CALCULATED_WITH_ASYNC`) include a calculated field only if it has no `async: true` or is listed in `allowedCalculatedWithAsyncFuncFieldNames` (in `generalConfig`, since it affects the SDL). The same rule selects the fields of the runtime `wherePayload` filter (`composeSubscriptionDummyEntityConfig`), of `composeSubscriptionUpdatedFields` and of the "all fields" projection used to build the subscription payload (`composeAllFieldsProjection(…, WITHOUT_CALCULATED_WITH_ASYNC)`); fields of the `subscriptionActor` config are also kept. `composeGqlTypes` needs only `generalConfig`. |
| CF10 | 📖 `createEntityType` maps `calculatedType` to a GraphQL type: scalars → `String`/`Int`/`Float`/`DateTime`/`Boolean`, `enumFields` → `${enumName}Enumeration`, `geospatialFields` → `Geospatial${geospatialType}`, `embeddedFields`/`virtualFields` → `configName` type, `filterFields` → child fields like regular filter fields (with `ThroughConnection`/`Count`/`DistinctValues` for arrays). `inputTypes` for `filterFields` are not supported (TODO in `createEntityType.ts`). |
| CF11 | ✅ Calculated geospatial values are not converted from the Mongo format: `func` returns the GraphQL format (`{ lng, lat }`); arrays keep `slice`. |
| CF12 | ✅ Calculated fields are not in `copy…OptionsEnum` (`fieldsToCopy`, `fieldsForbiddenToCopy`) and do not make a `copy…` mutation or `whereTarget` possible on their own (`getMatchingFields` skips them, so `canBeCopyTarget`, `…WhereKeyToSourceInput` ignore them): they are not stored, so there is nothing to copy. |

## 5. Runtime

### 5.1. Calculation contract

| ID | Fact |
|---|---|
| CF13 | 📖 **Cardinality.** Single-entity actions (`createEntityQueryResolver`, non-array mutations) pass the entity **object** to `asyncFunc` and `index = 0` to `func`; `asyncFunc` returns the result for that one entity. List actions (`createEntitiesQueryResolver`, array mutations) pass the **array** of entities; `asyncFunc` returns an array and `func` picks its element by `index`. So `func` has to know the cardinality (U2, U3). |
| CF14 | 📖 **Mutations substitute `args` for `asyncFunc`.** `workOutMutations` / `composeStandardMutationResolver` call `asyncFunc` with `resolverArg.args` replaced by `{ where: { id_in } \| whereOne: { id }, token }`, so mutation args (`data` etc.) do not leak into `asyncFunc`. `func` gets the original `resolverArg`. |
| CF15 | 📖 **Batching is built into the contract:** `getAsyncFuncResults` calls `asyncFunc` of every requested field once for the whole list (in parallel), `func` + `index` distribute its result. |
| CF16 | ✅ **Args.** `func` gets the args of its own field, so aliases with different args get different values. `asyncFunc` runs in the root resolver with one set of args per field name (`fieldArgs[name]`), so aliases of an async field with different args are not supported (?1). `func` of a calculated `filterFields` field gets the args of the base field, not of the variant (`x`, `xThroughConnection`, `xCount`, `xDistinctValues` have their own `where`/`sort`/`pagination`). |

### 5.2. Root resolvers and field resolvers

| ID | Fact |
|---|---|
| CF17 | ✅ **Hidden context.** The root resolvers (`createEntityQueryResolver`, `createEntitiesQueryResolver`, `composeStandardMutationResolver`, `workOutMutations`) call `asyncFunc` over the whole list and, by `prepareCalculatedFields`, attach to every entity `{ data, asyncFuncResults, index, resolverArg }` (`src/resolvers/utils/calculatedContext`). `data` is the entity right after `addIdsToEntity` (mongo ids, no `_token`), `resolverArg` the original root one (callbacks read e.g. `resolverArg.args.token`, U5). The context is kept in a module-level `WeakMap<entity, context>`, not in the entity: an enumerable `Symbol` property would be compared by Jest `toEqual` ([resolver-decorators.md](./resolver-decorators.md) RD10), a non-enumerable one would be lost by spread. Code that rebuilds an entity after the root resolver (`transformAfter`, `createNodeQueryResolver`) passes the context on with `copyCalculatedContext`; connections keep node references. |
| CF18 | ✅ **Field resolvers.** `composeEntityResolvers` creates a resolver for every calculated field (`composeCalculatedFieldResolver`): (1) an own property with the field's name (a materialized value, CF20) is returned as is; (2) with the hidden context: `func(args, context.data, context.resolverArg, context.asyncFuncResults[name], context.index)`; (3) otherwise the fallback (CF19). Calculated `embeddedFields` arrays pass the value to the `fieldArrayResolver` logic (`slice`); calculated `filterFields` use it as the filter in every variant. `getSimpleProjectionFromResolvedInfo` maps `xThroughConnection` / `xCount` / `xDistinctValues` to `x`, so `fieldsToUseNames` and `asyncFunc` are applied for a variant too. |
| CF19 | ✅ **Fallback** for entities not produced by a root resolver (built by a custom resolver and returned to GraphQL, received from a serializing PubSub, an async field the root resolver did not calculate): calculated like a single-entity action, `asyncFunc(args, resolverCreatorArg, resolverArg, parent)` with the entity **object**, then `func(…, index = 0)`. `resolverArg` is the field-level one and `data` is `parent`, i.e. the object given to GraphQL (**global ids** if it went through `transformAfter`). The `asyncFunc` result is memoized per `parent`, field name and args (`WeakMap`), so `x` and `xCount` requested together run it once. A custom resolver that returns entities of graphql-fns resolvers should pass the original objects through or use `transformAfter` (exported), so the field resolvers get the raw data and the batched `asyncFunc` results. |
| CF20 | ✅ **Materialization.** `materializeCalculatedFields: true` in the 5th argument of query resolvers and in `resolverOptions` of mutations (also of `workOutMutations`; `produceResult` passes it on) makes the root resolver calculate the requested calculated fields at once (`addCalculatedFieldsToEntity`) and write them as own properties. The root resolver cannot tell whether its result goes to the GraphQL executor or to the calling code, so code that **reads** calculated values from a result has to ask for them. Connection resolvers (`X_ThroughConnection`, `Y_ChildThroughConnection`) pass the option to the list resolver, so the nodes in `edges[].node` get the values. Objects returned to GraphQL need nothing: the field resolvers calculate. |

```ts
const book = await composeQueryResolver('Book', generalConfig, serversideConfig)(
  null,
  { whereOne: { id } },
  context,
  createInfoEssence({ projection: { summary: 1 } }),
  { involvedFilters: { inputOutputFilterAndLimit: [[]] }, materializeCalculatedFields: true },
);

book.summary; // calculated

await workOutMutations(
  [
    {
      actionGeneralName: 'updateEntity',
      entityConfig,
      args,
      resolverOptions: { involvedFilters: { inputOutputFilterAndLimit: [[]] }, materializeCalculatedFields: true },
      returnResult: true,
    },
  ],
  commonResolverCreatorArg,
);
```

| ID | Fact |
|---|---|
| CF21 | ✅ **Values are never taken from the database.** `adaptProjectionForCalculatedFields(projection, entityConfig, generalConfig, serversideConfig)` removes the calculated fields of the config they are calculated by from the projection, adds their `fieldsToUseNames`, and returns `{ _id: 1 }` instead of an empty projection (which would fetch the whole document). `removeCalculatedFieldValues` deletes properties with the names of calculated fields from every fetched record, before `asyncFunc`, the context and materialization: in `createEntityQueryResolver`, `createEntitiesQueryResolver` (so connections, child fields, `node` and `produceResult` too) and for the previous entities of `composeStandardMutationResolver` and `workOutMutations` (`copy…`, `delete…`, `previousNode`/`node` of subscriptions). So an own property can come only from materialization or from code. Writes cannot store calculated values: mongoose schemas have no calculated fields and `bulkWrite` runs with `strict: true`. |
| CF22 | 📖 **Projection helpers.** `getInfoEssence`, `createInfoEssence` and `getProjectionFromInfo` return only the requested fields, without `fieldsToUseNames`: the resolvers that fetch the entities adapt the projection themselves (CF21). Code that builds its **own** Mongo query from these helpers and needs `fieldsToUseNames` calls `adaptProjectionForCalculatedFields` itself. |
| CF23 | ✅ **Representations.** Generated representation resolvers are the raw resolvers of the root entity ([representations.md](./representations.md) RP9); `createResolverCreator` passes the representation config as `resolverOptions.calculatedFieldsConfig`, and root query resolvers, `getPrevious` of mutations, `produceResult`, `getAsyncFuncResults` and `addCalculatedFieldsToEntity` take calculated fields from it (`getCalculatedFieldsConfig`), while `asyncFunc` gets the root `resolverCreatorArg`. Connection actions (`XsThroughConnectionForY`) pass it to the list resolver, `createNodeQueryResolver` passes it for a global id of a representation. Callbacks are looked up by the representation config name first, then by the root name (`getCalculatedFieldCallbacks`). |
| CF24 | ✅ **Delegating resolvers.** Connection resolvers (`getFirst`/`getVeryFirst`/`getLast`/`getVeryLast`/`getShift`) pass their resolver options on with the modified `involvedFilters`; `childEntities`, `childEntity`, `entitiesByUnique`, `childEntitiesThroughConnection` pass them as given. `index` of a connection node refers to the fetched list (including the extra `first + 1` element), which is exactly the list `asyncFunc` got. The internal calls with `createInfoEssence({ projection: { _id: 1 } })` (`near` + `search` ids, count of `getVeryLast`) pass no options. |
| CF25 | ✅ **Previous entities of mutations.** Calculated fields of previous entities are calculated (always materialized) only when they are returned (`delete…`, `produceCurrent: false`) or reported (single `update…`/`delete…` with a subscription allowed by the inventory); otherwise `composeStandardMutationResolver` and `workOutMutations` skip them (`previousIsUsed`). |

### 5.3. Subscriptions

| ID | Fact |
|---|---|
| CF26 | ✅ The calculated fields that feed `wherePayload`, `updatedFields` and `actor` (CF9) are materialized once per published event, on the publishing side: `produceResult` and `authDecorator` call the query resolvers with `composeAllFieldsProjection(…, WITHOUT_CALCULATED_WITH_ASYNC)` and `materializeCalculatedFields`, for both `node` and `previousNode` of `updatedX`. They are plain data, so they survive a serializing PubSub (e.g. Redis; tested with a JSON round-trip PubSub). `asyncFunc` of allowed async fields runs with the `resolverArg` of the mutation, i.e. for the user who made the mutation. |
| CF27 | ✅ Other calculated fields a subscriber selects (async ones not in `allowedCalculatedWithAsyncFuncFieldNames`) are calculated for every subscriber by the fallback (CF19): `asyncFunc(args, resolverCreatorArg, resolverArg, node)` with the node object and the `resolverArg` of the subscriber's field (its `args` have no `token`; callbacks get the user from `context`). |

## 6. Usage patterns

Observed in a project with a few dozen calculated field definitions (many are factories reused across entities), about half of them async.

| ID | Pattern |
|---|---|
| U1 | Most async fields are `virtualFields` (permissions of the current user, parents, breadcrumbs, an excerpt of the creator, …): `asyncFunc` does the work, `func` only delivers the result. |
| U2 | A generic `func` shared by these fields returns `Array.isArray(asyncFuncResult) ? asyncFuncResult[index] : asyncFuncResult`, i.e. it relies on CF13. |
| U3 | Array-valued fields (`array: true`, e.g. the containers of an entity) use a custom `func` that returns `asyncFuncResult` as is; this is why the fallback (CF19) passes the entity object, not `[entity]`. |
| U4 | `asyncFunc` callbacks call `composeQueryResolver(...)` with `createInfoEssence(...)` programmatically, outside GraphQL execution; they need `materializeCalculatedFields: true` only if they read calculated fields of the fetched entities. |
| U5 | Root args are used: callbacks read `token` from the root `resolverArg.args` to decode the current user. |
| U6 | `inputTypes` is used for field args like `{ lang: 'LangEnumeration' }` (a project enum); `fieldsToUseNames: []` is common for fields that need only `_id`. |

## 7. Open questions

| ID | Question |
|---|---|
| ?1 | Aliases of an async field with different args (CF16): `asyncFunc` runs in the root resolver with one set of args per field name. |
| ?2 | `inputTypes` of calculated `filterFields` (CF10). |
