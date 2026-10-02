# `XCounts`: several counts in one query

> How the `entityCounts` query (`XCounts`) counts the entities of several subsets of one selection in one MongoDB aggregation.
> Identifiers: `EC…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> The list of actions and their SDL is in [schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md) §3 (Q7).

`XCount` returns one number. A client that shows counts for several tabs or filter options of one list (e.g. "all / in Europe / large") would need one `XCount` per option, each repeating the common conditions, lookups and full-text search. `XCounts` takes the common conditions once and a list of additional conditions, and returns one count per item of the list.

```graphql
{
  CountryCounts(
    where: { euMember: false }
    restrictedWhere: [{}, { continent: EUROPE }, { population_gt: 10000000 }]
  )
}
# → [<all not EU>, <not EU in Europe>, <not EU with population > 10M>]
```

## 1. Schema

| ID | Fact |
|---|---|
| EC1 | ✅ `XCounts(where: XWhereInput, restrictedWhere: [XRestrictedWhereInput!]!, search: String, token: String): [Int!]!` for every tangible X (`entityCountsQueryAttributes`). `search` exists only if X has a text field with `weight`, as in `XCount`. There is no `near` (as in `XCount`, see analysis I10). |
| EC2 | ✅ `XRestrictedWhereInput` (`createEntityRestrictedWhereInputType`) has the same fields as `XWhereInput` (`id_in`, `createdAt_…`, `updatedAt_…`, `counter_…`, operators of indexed and unique fields, `AND` / `OR` / `NOR`) **except relational filters** `x_` (of relational, parent relational and duplex fields). Relational and duplex fields themselves are kept (`x`, `x_in`, `x_nin`, `x_ne`, `x_exists` / `x_size`). |
| EC3 | ✅ An indexed embedded field is `x: ERestrictedWhereInput` (`ERestrictedWhereInput` has the fields of `EWhereInput`). There is no `XRestrictedWhereWithoutBooleanOperationsInput`: in `XWhereInput` that input is used only by `x_`. |
| EC4 | ✅ The general action name is `entityCounts`; `actionName` gives `${name}Counts`, with a representation key `${name}Counts${key}`. |

## 2. Runtime

`createEntityCountsQueryResolver` (`src/resolvers/queries/createEntityCountsQueryResolver`) builds one aggregation:

```js
[
  { $match: { $text: { $search } } },    // only with "search"
  ...lookups,                            // of the relational filters "x_" of "where"
  { $match: where + filter },            // only if not empty
  { $facet: {                            // composeFacet
      0: [{ $match: restrictedWhere[0] }, { $count: 'count' }],  // no "$match" for {}
      1: [...],
  } },
]
```

| ID | Fact |
|---|---|
| EC5 | ✅ The authorization filter (`involvedFilters`) is merged only with `where` (`mergeWhereAndFilter`), so it restricts every count once; items of `restrictedWhere` are composed without the filter (`composeWhereInput(item, entityConfig, { forRestrictedWhere: true })`). Separately allowed `where` and filter that select nothing together give zeros. |
| EC6 | ✅ The result has the length and order of `restrictedWhere`; `{}` counts all entities selected by `where`, `search` and the filter. |
| EC7 | ✅ `$count` returns no document for an empty input, so a facet without matches is `[]`, not `[{ count: 0 }]`, and is returned as `0`. `$facet` returns one document even when the common stages select nothing (by `where`, by lookups of `x_`, by `search` or by the filter): every count is then `0`. |
| EC8 | ✅ If the user has no access (`filter` is `null`) the result is zeros, one per item of `restrictedWhere`, without a query to MongoDB. An empty `restrictedWhere` gives `[]` without a query: MongoDB does not accept `$facet` without fields. |
| EC9 | ✅ A relational filter `x_` in an item of `restrictedWhere` (possible only when the raw resolver is called directly, e.g. from a custom resolver: the schema has no such fields, EC2) throws `Relational field: "x_" forbidden in restricted where of "X" entity …`. The check is the `forRestrictedWhere` option of `composeWhereInput` / `mergeWhereAndFilter`, also inside `AND` / `OR` / `NOR`. Lookups of the items are not supported because all items are applied in one `$facet` after the common lookups. |
| EC10 | ✅ Global ids: `resolverDecorator` and `customResolverDecorator` (`getTransformerAndConfig`) transform arguments of type `…RestrictedWhereInput` (single or list) by `whereFromGlobalIds`, as `…WhereInput` ([resolver-decorators.md](./resolver-decorators.md) §3). The raw resolver takes mongo ids. |

## 3. Inventory and exports

| ID | Fact |
|---|---|
| EC11 | ✅ `entityCounts` is a root `Query` action of `inventory` (`{ Query: { entityCounts: ['Country'] } }`); `unwindInverntoryOptions` lists it for every tangible entity. |
| EC12 | 📖 There is no child query `childEntityCounts` (no `citiesCounts` field), so `addChildActions` does not map `entityCounts`, and `composeQueryResolver` has no `Counts` suffix. |
| EC13 | 📖 `createEntityCountsQueryResolver` is exported from the package, as `createEntityCountQueryResolver`. |
| EC14 | 📖 An entity whose name ends with `Restricted` collides with another entity: `FooRestrictedWhereInput` is both the where of `FooRestricted` and the restricted where of `Foo`. This is not checked. |
