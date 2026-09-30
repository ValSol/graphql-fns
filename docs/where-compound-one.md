# `whereCompoundOne`: selecting one entity by a unique compound index

> How `uniqueCompoundIndexes` of an entity become the `whereCompoundOne` / `whereCompoundTarget` arguments of the `X` query and of mutations, and how they are resolved.
> Identifiers: `WC…` facts, `?WC…` open questions. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> The list of actions and their SDL is in [schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md) §3 (Q1) and §4 (notes `***`, `****`).

## 1. Config and MongoDB index

| ID | Fact |
|---|---|
| WC1 | ✅ `uniqueCompoundIndexes: string[][]` of a tangible entity: every inner array is a set of field names. `composeEntityConfig` requires a not empty array of indexes, at least 2 fields per index, existing not array fields, and only kinds of fields that `XWhereCompoundOneInput` is built from: text, int, float, dateTime, relational (not `parent`) and duplex (`compoundIndexFieldKinds`); e.g. an enum or boolean field throws `Found unique compaund index field: … while only … fields are allowed!`. |
| WC2 | 📖 `composeCompoundIndexes` makes a unique MongoDB index `{ f1: 1, f2: 1, … }` for every set. |
| WC3 | ✅ An absent field is indexed as `null`: two entities of one index that both lack the same field (and have equal other fields) collide with `E11000 duplicate key`. E.g. with `[['postcode', 'country']]` two cities of one country without `postcode` cannot exist. |

## 2. Schema

| ID | Fact |
|---|---|
| WC4 | ✅ `createEntityWhereCompoundOneInputType` makes one `XWhereCompoundOneInput` with the fields of **all** indexes of X (each field once, all optional, no `…_exists`), typed as in `XWhereInput`: text `String`, int `Int`, float `Float`, dateTime `DateTime`, relational (not `parent`) and duplex `ID`. Without `uniqueCompoundIndexes` the input is empty, so every argument of this type is hidden (`composeActionSignature` hides args with an empty input). |
| WC5 | ✅ The query `X` and the mutations `updateX`, `deleteX`, `pushIntoX`, `deleteXWithChildren`, `updateManyXs`, `deleteManyXs`, `deleteManyXsWithChildren` have `whereOne` + `whereCompoundOne`; with `uniqueCompoundIndexes` `whereOne` is optional (`XWhereOneInput` / `[XWhereOneInput!]`), without them the signature is unchanged (`XWhereOneInput!` / `[XWhereOneInput!]!`). The argument types are functions of the entity config in `src/types/actionAttributes/*Attributes.ts`. |
| WC6 | ✅ `copyX`, `copyManyXs`, `copyXWithChildren`, `copyManyXsWithChildren` have `whereCompoundTarget` next to `whereTarget` (input creator `whereCompoundTargetInputCreator`: only if `canBeCopyTarget(X)`), single or array as `whereTarget`. `whereKeyToSource` selects the source (another entity) only by its `WhereOneInput`: a compound variant is not planned. |
| WC7 | ✅ Actions of representations are composed from the same attributes (`composeCustomAction`). `composeRepresentationConfig` keeps `uniqueCompoundIndexes` of the root only if **all** fields of **all** indexes are left in the representation (after `includeFields`, `excludeFields` and `addFields`, which may replace a field, e.g. by a calculated one); if at least one field is missing, `uniqueCompoundIndexes` is dropped entirely. So `XForKey` actions either get the same `whereCompoundOne: XForKeyWhereCompoundOneInput` as X, or keep required `whereOne` without `whereCompoundOne`. |

## 3. Runtime

| ID | Fact |
|---|---|
| WC8 | ✅ `checkWhereCompoundOne(whereCompoundOne, entityConfig)` (`src/resolvers/utils/checkWhereCompoundOne`) throws unless the keys are **exactly** the fields of one index (a key with `null` counts as present). So `{ name }` for `['name', 'country']`, keys of two indexes, `…_exists` keys are rejected. |
| WC9 | ✅ Conditions are composed by `composeWhereInput`: every field becomes `{ $eq: value }`; `{ $eq: null }` matches both `null` and an absent field, which is the only way to address an entity whose index field is absent. Relational/duplex ids are strings cast by Mongoose (`findOne`). |
| WC10 | ✅ The query `X` checks "exactly one of `whereOne` / `whereCompoundOne`", then `checkWhereCompoundOne`, then merges `whereCompoundOne` with the authorization filter (`mergeWhereAndFilter`) as it does with `whereOne`. |
| WC11 | ✅ Mutations use `normalizeWhereCompoundOne` (`src/resolvers/mutations/normalizeWhereCompoundOne`), called in `composeStandardMutationResolver` (inside every transaction try, before `getPrevious`) and in `workOutMutations` (for every mutation of the chain, before `getPrevious`). By `actionGeneralName` it picks the pair `whereOne`/`whereCompoundOne` or `whereTarget`/`whereCompoundTarget`, checks "not both" (and, for `whereOne`, "not none"), checks every item with `checkWhereCompoundOne`, finds `_id` of every item separately (`findOne` without the authorization filter, in the mutation's session) and returns args with `whereOne: { id }` (array → array of `{ id }` in the same order) instead of `whereCompoundOne`. Everything after it (`getPrevious`, `checkData`, `prepareBulkData`, `produceResult`) sees only `whereOne` / `whereTarget`. |
| WC12 | ✅ Not found: for `whereOne` a new `ObjectId` is used, so the result is exactly the one of a `whereOne` with an absent id (`updateX`/`deleteX` → `null` → GraphQL error of a non-null field; `…Many…` → `null` because the count of found entities differs). For `whereTarget` it throws `Not found "X" entity to copy to: <item>!`, as `getCommonData` does for `whereTarget`. |
| WC13 | ✅ The authorization filter (`involvedFilters`) is applied afterwards by `getPrevious` to `whereOne: { id }`, so an entity that exists but is not allowed is "not found", as for `whereOne`. `executeAuthorisation` does not read `whereOne` and needs no changes. |
| WC14 | ✅ Global ids: `resolverDecorator` / `customResolverDecorator` choose transformers by the argument type, so `…WhereCompoundOneInput` (single or array) goes through `whereFromGlobalIds` before the raw resolver ([resolver-decorators.md](./resolver-decorators.md) RD6a). Raw resolvers and `workOutMutations` take mongo ids. |
| WC15 | ✅ `lockedData.args` of `workOutMutations` are args of the `X` query, so `lockedData.args.whereCompoundOne` works as in WC10. |
| WC16 | ✅ In `workOutMutations` all writes of the chain are executed together at the end, so an entity created by an earlier mutation of the same chain cannot be found by a later `whereCompoundOne` (nor by `whereOne`). |
| WC17 | ✅ Results of `…Many…` mutations are in the order of MongoDB, not of the `whereCompoundOne` items (the same holds for `whereOne`, see analysis §4). |

## 4. Resolved questions

| ID | Decision |
|---|---|
| ?WC1 | ✅ An index field of a kind absent in `XWhereCompoundOneInput` (enum, boolean, …) made the index unusable. Now `composeEntityConfig` rejects such fields (WC1). |
| ?WC2 | ✅ A representation that excluded a field of an index kept the index, so it could not be used through the representation. Now a representation without at least one field of the indexes has no `uniqueCompoundIndexes` at all (WC7). |
| ?WC3 | ✅ `uniqueCompoundIndexes: []` made `whereOne` optional and an input without fields. Now it throws in `composeEntityConfig` (WC1). |
