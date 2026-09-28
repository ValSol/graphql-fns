# Representations

> A representation is an alternative view of existing entities (e.g. `ForCatalog`, `ForAdmin`) with its own set of fields and actions, but the same collections.
> Identifiers: `RP…` facts, `?RP…` open questions. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.

## 1. Declaration

`generalConfig.representations: { [representationKey]: RepresentationAttributes }`, usually composed with `composeRepresentations([ForCatalog, ForAdmin], allEntityConfigs)` (it checks that the keys are unique and correct and validates `involvedOutputRepresentationKeys`; the old names `generalConfig.representation` / `composeRepresentation` are described in [migration.md](./migration.md) §7):

| Property | Meaning |
|---|---|
| `representationKey` | suffix of names (`ForCatalog`) |
| `allow: { Entity: ActionName[] }` | which standard actions exist for the representation of each entity (`entity`, `entities`, `childEntities`, `createEntity`, …); an entity missing in `allow` has no representation config |
| `includeFields` / `excludeFields` | keep only / drop fields of the root entity |
| `addFields` | extra fields (simplified field configs; relational, duplex and filter fields are forbidden) |
| `freezedFields` / `unfreezedFields` | set `freeze` of listed fields (and the opposite for the others) |
| `interfaces` | GraphQL interfaces of the representation type |
| `involvedOutputRepresentationKeys` | output entities of actions in another representation |

## 2. Names

| ID | Fact |
|---|---|
| RP1 | 📖 `composeRepresentationConfigName(name, key, slicePosition?)` is `name + key`, or the key inserted at `representationNameSlicePosition` of the entity config (e.g. to put it before a suffix). |
| RP2 | 📖 `parseEntityName(name, generalConfig)` returns `{ root, representationKey }`: `representationKey: ''` for an entity of `allEntityConfigs`; otherwise it tries every representation key and checks the composed name; no match or more than one match throws. |
| RP3 | 📖 Action names: `actionGeneralName(key)` (e.g. `entityForCatalog`) is the custom action name, `actionName(root, key)` (e.g. `ExampleForCatalog`) is the field of `Query`/`Mutation`. |

## 3. Composing a representation config (`composeRepresentationConfig`)

📖 In this order:

1. `null` if the root entity is not in `allow`.
2. Arguments are checked: listed entities are in `allow`, listed fields exist; relational/duplex/filter fields in `addFields` throw.
3. A **shallow copy** of the root config with the representation name.
4. `interfaces`, `includeFields`, `excludeFields` (field arrays are reassigned with `filter`).
5. `addFields` are composed as an entity config (`composeEntityConfig`) and put into the copy, replacing root fields with the same name.
6. Relational, duplex, filter, child and calculated `filterFields` fields get the representation config of the related entity (composed recursively); the related entity must be in `allow` with a child action that fits the field (`childEntities…` for arrays, `childEntity` or `childEntityGetOrCreate` for scalars), and relational/duplex fields must have their opposite fields in it.
7. `freezedFields` / `unfreezedFields`.

| ID | Fact |
|---|---|
| RP4 | ✅ **[fixed `51d51101`]** Step 5 used to `push` into field arrays shared with the root config (step 3 is a shallow copy), so fields of `addFields` were also added to the **root** entity config. |
| RP5 | 📖 The result is cached per `generalConfig` by representation config name (not under Jest). |
| RP6 | 📖 `composeRepresentationConfigByName(key, rootConfig, generalConfig)` is the same, but throws instead of returning `null`. |

## 4. Schema and resolvers

| ID | Fact |
|---|---|
| RP7 | 📖 `mergeRepresentationIntoCustom(generalConfig, variant)` turns every allowed standard action of every representation into a custom action signature (`composeCustomAction`) and merges them with `generalConfig.custom`; the SDL and the resolvers of representations are then produced as for custom actions. Variants: `forGqlResolvers` (no child actions), `forCustomResolver` (with child actions, used by field resolvers of representation types), `forClient` (without `childEntity`/`childEntities`). |
| RP8 | 📖 `createCustomResolver` uses `serversideConfig.Query/Mutation[actionName]` if set, otherwise a resolver generated from the standard one (`generateRepresentationResolvers` → `createResolverCreator`), wrapped with `customResolverDecorator` ([resolver-decorators.md](./resolver-decorators.md) RD2). |
| RP9 | 📖 **The generated representation resolver is the standard raw resolver of the ROOT entity config**: `createCustomResolver` is called with the root config from `allEntityConfigs`, so the Mongo model/collection is the root one. The representation config is used for the SDL, the argument transformers and `transformAfter` (global ids with the representation key); ✅ for calculated fields `createResolverCreator` passes it to the raw resolver as `resolverOptions.calculatedFieldsConfig` (see ?RP1). |
| RP10 | 📖 Field resolvers of representation types (`composeEntityResolvers(representationConfig)`) are composed in `composeGqlResolvers` for every representation config that is in the SDL; child resolvers of representation types call `childEntities<Key>` etc. through `createCustomResolver`. |
| RP11 | ✅ Callbacks of calculated fields are looked up by the representation config name first, then by the root name ([calculated-fields.md](./calculated-fields.md), `getCalculatedFieldCallbacks`), and checked at compose time for every representation config in the SDL (`checkCalculatedFieldsCallbacks`). ✅ **[fixed `371e9ac7`]** `fieldsToUseNames` are checked against the fields of the config the callbacks are taken from: a calculated field the representation inherits (callbacks under the root name) may use root fields hidden by `excludeFields`/`includeFields`, because of RP9 the root collection is queried and the projection is not filtered by the representation's fields; callbacks under the representation's own name (fields of `addFields`) are checked against the representation config. |

## 5. Open questions

| ID | Question |
|---|---|
| ?RP1 | ✅ **[fixed `0c4a030d`]** Because of RP9, calculated fields added by a representation (`addFields`) were unknown to the root resolver: no `fieldsToUseNames` in the projection, no batched `asyncFunc` (before the calculated fields redesign they were not calculated at all). Now `createResolverCreator` passes the representation config as `resolverOptions.calculatedFieldsConfig`; root query resolvers, `getPrevious` of mutations, `produceResult`, `getAsyncFuncResults` and `addCalculatedFieldsToEntity` take calculated fields from it (`getCalculatedFieldsConfig`), while `asyncFunc` still gets the root `resolverCreatorArg`. Tested for queries, lists, `create…` and `delete…` of a representation. ✅ **[fixed `0dd27898`]** Connection actions (`XsThroughConnectionForY`) and `node(id:)` with a representation global id still lost it: the connection resolver passed only `{ involvedFilters }` to the list resolver, `createNodeQueryResolver` did not pass it at all ([calculated-fields.md](./calculated-fields.md) ?12, ?13); both are tested now. |
