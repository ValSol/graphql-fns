# Migration guide: calculated fields in `serversideConfig`, `representations`

> For projects that upgrade graphql-fns across the calculated fields redesign (commits `0b302417`…`0c4a030d`, fixes `371e9ac7`, `0dd27898`, `cd008877`, `01760fa2`, `8df3660d`) and the rename of `representation` to `representations`.
> Design and internals: [calculated-fields.md](./calculated-fields.md) (§0 is the short usage reference), [representations.md](./representations.md).

## 1. What changed, in short

| # | Change | Breaking | What to do |
|---|---|---|---|
| 1 | `func`, `asyncFunc` and `fieldsToUseNames` of calculated fields moved from the entity configs (`generalConfig`) to `serversideConfig.calculatedFields` | yes | §2 |
| 2 | A calculated field with `asyncFunc` is declared with `async: true` | yes | §2 |
| 3 | Values of calculated fields are calculated by field resolvers; results of resolvers called **from code** contain them only with `materializeCalculatedFields: true` | yes | §3 |
| 4 | `getInfoEssence`, `createInfoEssence` and `getProjectionFromInfo` no longer add `fieldsToUseNames` to the projection; `adaptProjectionForCalculatedFields` needs two more arguments | yes, if used directly | §4 |
| 5 | Subscribers get async calculated fields that are not published (they used to get `null`) | behaviour | §5 |
| 6 | `func` of a field gets the args of its own field; `func` of a calculated filter field gets `{}` | behaviour | §6 |
| 7 | List mutations no longer calculate fields of the previous entities; calculated fields added by a representation (`addFields`) now work | fix | — |
| 8 | `generalConfig.representation` is renamed to `generalConfig.representations`, `composeRepresentation` to `composeRepresentations` | yes | §7 |
| 9 | Fixes after 0.1.2-beta.1153: `fieldsToUseNames` of calculated fields inherited by a representation may name root fields the representation hides; connection resolvers pass `materializeCalculatedFields` to the nodes; connection and `node` queries of representations calculate fields of `addFields` | fix | §2.4, §3 |
| 10 | Fix after 0.1.2-beta.1154: stored properties with the names of calculated fields (old data) are no longer taken for materialized values; the values are always calculated. `adaptProjectionForCalculatedFields` no longer keeps calculated fields in the projection | fix | — |
| 11 | Calculated fields are removed from `copy…OptionsEnum` (`fieldsToCopy`, `fieldsForbiddenToCopy` of `copy…` mutations): they are not stored, so there is nothing to copy | yes, if a client passes one | drop it from `fieldsToCopy` / `fieldsForbiddenToCopy` |

## 2. Moving the callbacks

### 2.1. Before

```ts
// generalConfig
const summaryCalculatedField: ScalarSimplifiedCalculatedEmbeddedField = {
  name: 'summary',
  calculatedType: 'virtualFields',
  configName: 'Summary',
  asyncFunc: getSummaryAsync,
  fieldsToUseNames: [],
  func: pickAsyncFuncResult,
};
```

### 2.2. After

The declaration keeps only what the GraphQL schema needs (`name`, `calculatedType`, `array`, `nullable`, `required`, `configName` / `enumName` / `geospatialType`, `inputTypes`) plus `async`:

```ts
// generalConfig
const summaryCalculatedField: ScalarSimplifiedCalculatedEmbeddedField = {
  name: 'summary',
  calculatedType: 'virtualFields',
  configName: 'Summary',
  async: true,
};
```

The callbacks go to `serversideConfig`, by entity config name and field name. Their signatures are unchanged:

```ts
// serversideConfig
import type { CalculatedFieldCallbacks, ServersideConfig } from 'graphql-fns';

const summaryCallbacks: CalculatedFieldCallbacks = {
  asyncFunc: getSummaryAsync,
  fieldsToUseNames: [],
  func: pickAsyncFuncResult,
};

const serversideConfig: ServersideConfig = {
  // …
  calculatedFields: {
    Book: { summary: summaryCallbacks /* , … */ },
    Magazine: { summary: summaryCallbacks /* , … */ },
  },
};
```

- The same field of several entities needs an entry for every entity (the callbacks object can be shared).
- Calculated fields that a representation config gets from its root entity use the callbacks of the root entity. Calculated fields added by a representation (`addFields`) have their callbacks under the representation config name (e.g. `BookForCatalog`).
- `fieldsToUseNames: []` can be omitted.

### 2.3. Factories

A factory that produced a whole field (e.g. `excerptCalculatedField(withOriginal)`) is split into a declaration factory and a callbacks factory with the same parameters, so that both sides stay in sync:

```ts
// generalConfig
export const excerptCalculatedField = (): ScalarSimplifiedCalculatedEmbeddedField => ({
  name: 'excerpt',
  calculatedType: 'virtualFields',
  configName: 'Excerpt',
  async: true,
  inputTypes: { short: 'Boolean' },
});

// serversideConfig
export const excerptCallbacks = (withOriginal = false): CalculatedFieldCallbacks => ({
  asyncFunc: getExcerptAsync,
  fieldsToUseNames: withOriginal ? ['createdAt', 'original'] : [],
  func: getExcerpt,
});
```

A parameter that changes only the callbacks (like `withOriginal` above) disappears from the declaration factory.

### 2.4. Checks that help

The generalConfig module must not import server-only code any more (callbacks, models, `mongoose`): after the migration search it for imports of callback modules.

Errors thrown at startup and what they mean:

| Error | Cause |
|---|---|
| `Forbidden "func" in calculated field: "x" of simplified entityConfig: "Y", it has to be set in "serversideConfig.calculatedFields"!` (also `asyncFunc`, `fieldsToUseNames`) | a callback left in the declaration (`composeAllEntityConfigs`) |
| `Not found callbacks of calculated field "x" of entity "Y" in "serversideConfig.calculatedFields"!` | a declared field has no callbacks (also for representation configs: `YForCatalog`) |
| `Not found "func" of calculated field …` | callbacks without `func` |
| `Calculated field "x" of entity "Y" has "async: true" but not got "asyncFunc" …` / `… has "asyncFunc" … but not has "async: true"!` | the `async` flag and `asyncFunc` do not match |
| `Incorrect field: "z" in "fieldsToUseNames" of calculated field "x" of entity "Y"!` | `fieldsToUseNames` names an unknown field (`id`, `createdAt`, `updatedAt`, and `counter` for entities with a counter, are allowed). Fields are looked up in the config the callbacks are taken from: for a field a representation inherits (callbacks under the root name) in the root config, so a raw field hidden by `excludeFields`/`includeFields` may be used (0.1.2-beta.1153 wrongly rejected it); for callbacks under the representation's own name (`YForCatalog`, fields of `addFields`) in the representation config |
| `Callbacks of "Y" entity in "serversideConfig.calculatedFields" have no calculated field "x"!` | callbacks of a field that is not declared (e.g. a typo, or a field removed from the declaration) |
| `Unknown entity "Y" in "serversideConfig.calculatedFields"!` | callbacks of an unknown entity or representation config |

The checks run in `composeTypeDefsAndResolvers` (`composeGqlResolvers`), i.e. when the schema is built.

## 3. Resolvers called from code

**Before:** a root resolver (query or mutation) calculated the requested calculated fields and put the values into the returned objects.

**Now:** a root resolver leaves them to the field resolvers of the GraphQL schema. When the result is returned to GraphQL (a custom resolver returns it) nothing changes. When **code** reads calculated values from the result, the call has to ask for them:

```ts
// queries: the 5th argument
const book = await composeQueryResolver('Book', generalConfig, serversideConfig)(
  null,
  { whereOne: { id } },
  context,
  createInfoEssence({ projection: { summary: 1 } }),
  { involvedFilters: { inputOutputFilterAndLimit: [[]] }, materializeCalculatedFields: true },
);

book.summary; // calculated

// mutation resolvers: the 5th argument, the same way
// "workOutMutations": "resolverOptions" of every mutation that returns a result
await workOutMutations(
  [
    {
      actionGeneralName: 'updateEntity',
      entityConfig,
      args,
      resolverOptions: {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
        materializeCalculatedFields: true,
      },
      returnResult: true,
    },
  ],
  commonResolverCreatorArg,
);
```

What to search for in a project:

- calls of `composeQueryResolver(…)(…)`, `create…QueryResolver`, `create…MutationResolver` and `workOutMutations(…)`, whose results are **read** (not only returned from a resolver);
- among them, reads of calculated field names (`result.summary`, destructuring, `JSON.stringify(result)`, comparing with `toEqual` in tests).

Connection resolvers (`composeQueryResolver('Y_ThroughConnection', …)`, and `Y_ChildThroughConnection`) take the same option and pass it on to the list resolver, so the nodes in `edges[].node` get the values (0.1.2-beta.1153 lost it: the nodes had no calculated values).

Only these calls need `materializeCalculatedFields: true`. `asyncFunc` callbacks that call query resolvers for their own purposes (e.g. to fetch excerpts of related entities) need it only if they read calculated fields of the fetched entities.

Tests of a project that compare resolver results with `toEqual` keep working: nothing extra is added to the returned objects.

## 4. Projection helpers

`fieldsToUseNames` are now added to the Mongo projection by the resolvers that fetch the entities (they know `serversideConfig`), not by the info helpers:

| Helper | Now |
|---|---|
| `getInfoEssence`, `createInfoEssence`, `getProjectionFromInfo` | same signatures; return only the requested fields, without `fieldsToUseNames` |
| `adaptProjectionForCalculatedFields(projection, entityConfig, generalConfig, serversideConfig)` | two new arguments |

Nothing to do if these helpers are only used to build the 4th argument of graphql-fns resolvers. Code that builds its **own** Mongo query from their projection and relies on `fieldsToUseNames` being there has to call `adaptProjectionForCalculatedFields` itself.

## 5. Subscriptions

- `wherePayload`, `whichUpdated`/`updatedFields` and `actor` work as before: calculated fields they need (without `async`, or listed in `allowedCalculatedWithAsyncFuncFieldNames`, and the fields of the subscription actor config) are calculated once when the event is published and sent with it. They survive a serializing PubSub (e.g. Redis).
- **Changed:** an async calculated field that is not published (not in `allowedCalculatedWithAsyncFuncFieldNames`) used to be `null` for subscribers; now it is calculated for every subscriber by its field resolver like for a single-entity action: `asyncFunc(args, resolverCreatorArg, resolverArg, node)` with the node **object** and the `resolverArg` of the subscriber's field (its `args` have no `token`; the user comes from `context`), then `func(…, index = 0)`. Callbacks that read the token from `args` or `context` get it from `context` there.
- Values published with the event are calculated with the arg of the mutation (as before), i.e. for the user who made the mutation.

## 6. Arguments of `func` and `asyncFunc`

| | Before | Now |
|---|---|---|
| `func`: `args` | args of the field taken by the root resolver (one set per field name) | args of its own field; aliases with different args get different values |
| `func` of a calculated `filterFields` field: `args` | args of the requested field variant | `{}` |
| `func`: `data` | raw entity (mongo ids) | the same |
| `func`: `resolverArg` | arg of the root resolver | the same (e.g. `resolverArg.args.token`) |
| `func`: `index` | position in the list for list actions, `0` for single-entity actions | the same |
| `asyncFunc`: all arguments | once per root resolver call, `resolverCreatorArg` of the root entity, the entity (single) or the array (list) | the same, also for representation actions |

**Entities not produced by a root resolver** (e.g. built by a custom resolver and returned to GraphQL, or received from a serializing PubSub): calculated fields are calculated per entity like for a single-entity action, with `data` = the object given to GraphQL (**global ids** if it went through `transformAfter`) and `resolverArg` of the field. Before, such entities had no calculated values at all. A custom resolver that rebuilds entities returned by graphql-fns resolvers should use `transformAfter` (exported) or pass the original objects through, so that the field resolvers get the raw data and the batched `asyncFunc` results.

## 7. `representations`

The attribute of `generalConfig` holds several representations (by representation key), like `allEntityConfigs`, `enums` and `interfaces`, and the function that composes it takes an array of them, like `composeAllEntityConfigs`:

```ts
// before
const representation = composeRepresentation([ForCatalog, ForAdmin], allEntityConfigs);
const generalConfig: GeneralConfig = { allEntityConfigs, representation /* , … */ };

// after
const representations = composeRepresentations([ForCatalog, ForAdmin], allEntityConfigs);
const generalConfig: GeneralConfig = { allEntityConfigs, representations /* , … */ };
```

A `generalConfig` with the old key is rejected when the schema is built: `The "representation" attribute of generalConfig is renamed to "representations"!`. Code that reads `generalConfig.representation` directly has to be renamed too. `RepresentationAttributes`, `representationKey`, `representationNameSlicePosition` and the generated names (`XForCatalog`, `entityForCatalog`) are unchanged.

## 8. Checklist

1. Upgrade graphql-fns.
2. Rename `representation` → `representations` in `generalConfig` and `composeRepresentation` → `composeRepresentations` (§7).
3. For every calculated field: remove `func`/`asyncFunc`/`fieldsToUseNames` from the declaration, add `async: true` where it had `asyncFunc`.
4. Put the callbacks into `serversideConfig.calculatedFields[entityConfigName][fieldName]`; split factories (§2.3).
5. Check that the generalConfig module no longer imports server-only code.
6. Build the schema: fix every error of §2.4.
7. Add `materializeCalculatedFields: true` where code reads calculated values from resolver results (§3).
8. Check own Mongo queries built from info helpers (§4).
9. Run the project's tests; check pages that use async calculated fields and subscriptions with calculated fields (§5).
