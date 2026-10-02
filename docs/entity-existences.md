# `XExistences`: several existence checks in one query

> How the `entityExistences` query (`XExistences`) checks whether at least one entity is selected by each of several pairs of `where` and `search`.
> Identifiers: `EE…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> The list of actions and their SDL is in [schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md) §3 (Q8).

A client often needs to know only whether there is anything to show: whether to show a tab, enable a filter option or a "show more" link. `XCount` and `XCounts` answer this too, but they go through all selected entities. `XExistences` checks every condition with a separate query that stops on the first selected entity, and returns one boolean per condition.

```graphql
{
  CityExistences(whereAndSearch: [
    {}
    { where: { name: "Kyiv" } }
    { where: { country: "<global id of Country>" } }
  ])
}
# → [<any city>, <a city named Kyiv>, <a city of the country>]
```

## 1. Schema

| ID | Fact |
|---|---|
| EE1 | ✅ `XExistences(whereAndSearch: [XWhereAndSearchInput!]!, token: String): [Boolean!]!` for every tangible X (`entityExistencesQueryAttributes`). There is no `near` (as in `XCount`). |
| EE2 | ✅ `input XWhereAndSearchInput { where: XWhereInput = {}  search: String }` (`createEntityWhereAndSearchInputType`). `where` is the full `XWhereInput`, with relational filters `x_` (unlike `XRestrictedWhereInput` of `XCounts`, see [entity-counts.md](./entity-counts.md) EC2). `search` exists only if X has a text field with `weight`, the same condition as the `search` argument of `XCount`. |
| EE3 | ✅ The general action name is `entityExistences`; `actionName` gives `${name}Existences`, with a representation key `${name}Existences${key}`. |

## 2. Runtime

`createEntityExistencesQueryResolver` (`src/resolvers/queries/createEntityExistencesQueryResolver`) runs one query per item of `whereAndSearch`, at most `serversideConfig.entityExistencesConcurrency` (10 by default) at once (`mapWithConcurrency`):

```js
// no lookups and no "search"
Entity.find(where + filter, { _id: 1 }).limit(1)

// otherwise
[
  { $match: { $text: { $search } } },    // only with "search"
  ...lookups,                            // of the relational filters "x_" of "where"
  { $match: where + filter },            // only if not empty
  { $limit: 1 },
  { $project: { _id: 1 } },
]
```

| ID | Fact |
|---|---|
| EE4 | ✅ The authorization filter (`involvedFilters`) is merged with `where` of every item (`mergeWhereAndFilter`). Separately allowed `where` and filter that select nothing together give `false`. |
| EE5 | ✅ The result has the length and order of `whereAndSearch`; `{}` (or `{ where: {} }`) is `true` if the collection has at least one entity allowed by the filter. |
| EE6 | ✅ If the user has no access (`filter` is `null`) the result is `false` for every item, without a query to MongoDB. An empty `whereAndSearch` gives `[]` without a query. |
| EE7 | 📖 Every query stops on the first selected entity (`limit(1)` / `$limit: 1`) and returns only `_id`. With an index that covers `where`, it is a covered query. If nothing is selected, the query goes through everything the index does not exclude, as `XCount` does. |
| EE8 | 📖 The queries are independent, so each item gets its own lookups and its own full-text search. The connection pool of the driver (`maxPoolSize`, 100 by default) is shared by all requests of the process, so without a limit a long `whereAndSearch` would take the whole pool and other requests would wait in its queue. The length of `whereAndSearch` itself is not limited. |
| EE8a | ✅ `serversideConfig.entityExistencesConcurrency` (a positive integer, 10 by default) is the max number of queries one `XExistences` runs at once; the results keep the order of `whereAndSearch`. A value that is not a positive integer throws `"entityExistencesConcurrency" has to be a positive integer, got: …!` when the resolver is created. After the first failed query no new query is started and the error is rethrown. Choose it well below `maxPoolSize` of the connection. |
| EE9 | ✅ Global ids: `resolverDecorator` and `customResolverDecorator` (`getTransformerAndConfig`) transform arguments of type `…WhereAndSearchInput` (single or list) by `transformWhereAndSearch`, which applies `whereFromGlobalIds` to `where` of every item and keeps `search` ([resolver-decorators.md](./resolver-decorators.md) §3). The raw resolver takes mongo ids. |

## 3. Inventory and exports

| ID | Fact |
|---|---|
| EE10 | ✅ `entityExistences` is a root `Query` action of `inventory` (`{ Query: { entityExistences: ['Country'] } }`); `unwindInverntoryOptions` lists it for every tangible entity. |
| EE11 | 📖 There is no child query `childEntityExistences`, so `addChildActions` does not map `entityExistences`. |
| EE11a | ✅ `composeQueryResolver('X_Existences', generalConfig, serversideConfig)` returns the raw resolver (created with `inAnyCase`, so regardless of `inventory`): mongo ids in `where`, `involvedFilters` in the 5th argument, as the other `X_…` keys ([resolver-decorators.md](./resolver-decorators.md) §1). |
| EE12 | 📖 `createEntityExistencesQueryResolver` is exported from the package, as `createEntityCountsQueryResolver`. |
