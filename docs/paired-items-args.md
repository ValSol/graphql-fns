# Paired items instead of parallel arrays: `updateManyXs`, `copyManyXs`, `copyManyXsWithChildren`

> How the list mutations take one array of items, each pairing the inputs that belong to one entity.
> Identifiers: `PI…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> The list of actions and their SDL is in [schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md) §3; compound selectors are in [where-compound-one.md](./where-compound-one.md).

Every item of `updateManyXs` and `copyManyXs…` carries everything that belongs to one entity (the selector, the target, `data`), as `XExistences(whereAndSearch: [..])` does ([entity-existences.md](./entity-existences.md)), so the schema itself guarantees that the inputs of an entity come together.

```graphql
mutation {
  updateManyCities(whereOneAndData: [
    { whereOne: { id: "<global id>" }, data: { population: 30 } }
    { whereOne: { id: "<global id>" }, data: { population: 65 } }
  ]) { id population }

  copyManyPersonBackups(sourceAndTargetAndData: [
    { whereKeyToSource: { original: { id: "<global id of Person>" } }, whereTarget: { id: "<global id>" } }
    { whereKeyToSource: { original: { id: "<global id of Person>" } }, data: { firstName: "Hugo" } }
  ]) { id }
}
```

## 1. Schema

| ID | Fact |
|---|---|
| PI1 | ✅ `updateManyXs(whereOneAndData: [XWhereOneAndDataInput!]!, whereCompoundOneAndData: [XWhereCompoundOneAndDataInput!], token)`. With `uniqueCompoundIndexes` `whereOneAndData` loses `!` and `whereCompoundOneAndData` is shown; without them only `whereOneAndData` is shown (`composeActionSignature` hides args with an empty input). |
| PI2 | ✅ `input XWhereOneAndDataInput { whereOne: XWhereOneInput!  data: XUpdateInput! }`, `input XWhereCompoundOneAndDataInput { whereCompoundOne: XWhereCompoundOneInput!  data: XUpdateInput! }` (`createEntityWhereOneAndDataInputType`, `createEntityWhereCompoundOneAndDataInputType`). Both are empty (so hidden) if `XUpdateInput` is empty; the compound one also without `uniqueCompoundIndexes`. Whether an item selects by `whereOne` or by `whereCompoundOne` is chosen for the whole call, by the argument, not per item: mixing is not possible. |
| PI3 | ✅ `copyManyXs(sourceAndTargetAndData: [XCopySourceAndTargetAndDataInput!]!, sourceAndCompoundTargetAndData: [XCopySourceAndCompoundTargetAndDataInput!], options: copyXOptionsInput, token)`; `copyManyXsWithChildren(sourceAndTarget: [XCopySourceAndTargetInput!]!, sourceAndCompoundTarget: [XCopySourceAndCompoundTargetInput!], options, token)`. The first argument loses `!` when the compound one is shown. `options` stays a single object: it is common to all items (its key must equal the key of every `whereKeyToSource`). |
| PI4 | ✅ The four item inputs are made by `composeCopySourceAndTargetInputCreator(compoundTarget, withData)`: `whereKeyToSource: XWhereKeyToSourceInput!` always; `whereTarget: XWhereOneInput` (optional) only if `canBeCopyTarget(X)`; `whereCompoundTarget: XWhereCompoundOneInput!` in the compound variant, which exists only if `canBeCopyTarget(X)` and X has `uniqueCompoundIndexes`; `data: XUpdateInput` (optional) only in the `…AndData` variants and only if `XUpdateInput` is not empty. The non-compound input keeps its name even without `whereTarget` (`XCopySourceAndTargetAndDataInput { whereKeyToSource!, data }`). |
| PI5 | ✅ Single-entity mutations (`updateX`, `copyX`, `copyXWithChildren`) take separate arguments; `deleteManyXs…` take one array (`whereOne` / `whereCompoundOne`), there is nothing to pair. |

## 2. Runtime

| ID | Fact |
|---|---|
| PI6 | ✅ Global ids: `resolverDecorator` and `customResolverDecorator` map the six item input suffixes to `transformPairedItems`, which transforms every input of an item as the same standalone argument (`whereOne`, `whereTarget` → `whereFromGlobalIds`; `whereCompoundOne`, `whereCompoundTarget` → `whereFromGlobalIds`; `whereKeyToSource` → `transformWhereKeyToSource`; `data` → `transformData`). See [resolver-decorators.md](./resolver-decorators.md) RD6a. |
| PI7 | ✅ `normalizeWhereCompoundOne` (in the mutation's session, before `getPrevious`) handles the paired actions by `pairedActionGeneralNamesToKeys`: it checks "exactly one of" the two arguments (`Expected exactly one input from "whereOneAndData" && "whereCompoundOneAndData"!`, `Expected "whereCompoundOneAndData" or "whereOneAndData" input!`, the same for `sourceAnd…`), finds the id of every compound item and replaces the compound argument by the non-compound one: `{ whereCompoundOne, data }` → `{ whereOne: { id }, data }`, `{ whereKeyToSource, whereCompoundTarget, data }` → `{ whereKeyToSource, whereTarget: { id }, data }`. Not found: as in [where-compound-one.md](./where-compound-one.md) WC12. |
| PI8 | ✅ `updateManyEntities`: `getPrevious` and `prepareBulkData` read `whereOneAndData` and take `whereOne` / `data` of every item; one `find` by `OR` of `whereOne`, results restored to the order of items. All `whereOne` items must use the same key (`Incorrect key in whereOne item …`), because entities are matched with items by that key. |
| PI9 | ✅ `copyMany…`: `unpairSourceAndTarget(args)` splits `sourceAndTargetAndData` / `sourceAndTarget` into `whereKeyToSource[]`, `whereTarget[]` and `data[]` (missing `data` → `{}`), and `getCommonManyData` works on these arrays. It returns `null` for the args of `copyX` / `copyXWithChildren`, so the shared `prepareBulkData` of `copyEntity` and `copyEntityWithChildren` use it to tell the list mutation from the single one. |
| PI10 | ✅ `whereTarget` must be in every item or in none of them (`Expected "whereTarget" in every item or in none of them!`): `getCommonManyData` either updates the existing targets or creates/updates by the scalar opposite field for the whole call. Supporting a mix would need per-item modes in `getCommonManyData` and in the `getPrevious` of `copyManyEntities`, which reads "update or create" from the first result item. |
| PI11 | ✅ `workOutMutations` takes the same argument shapes as the GraphQL mutations (with mongo ids), e.g. `{ actionGeneralName: 'updateManyEntities', args: { whereOneAndData: [...] } }`. |

## 3. Tests

- ✅ `src/types/actionAttributes/whereCompoundOne.test.ts`: signatures with and without `uniqueCompoundIndexes`.
- ✅ `src/types/inputs/createEntityWhereOneAndDataInputType.test.ts`, `composeCopySourceAndTargetInputCreator.test.ts`: the item inputs.
- ✅ `transformPairedItems.test.ts`, `unpairSourceAndTarget.test.ts`.
- ✅ `normalizeWhereCompoundOne/whereCompoundOne.mtest.ts`: through the GraphQL schema with global ids (`whereCompoundOneAndData`, `sourceAndCompoundTargetAndData`, "both" / "none" errors).
- ✅ Resolver tests of `updateMany`, `copyMany`, `copyManyWithChildren`, `workOutMutations`, `calculatedFields`.
