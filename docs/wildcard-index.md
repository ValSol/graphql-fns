# `wildcardIndex`: filtered fields of one root wildcard index

> How fields with `wildcardIndex: true` are indexed by one wildcard index of the collection instead of own indexes, what this changes in the GraphQL schema and how the index is synced.
> Identifiers: `WI…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Tests: `src/mongooseModels/wildcardIndex.mtest.ts`, `src/mongooseModels/composeWildcardProjection.test.ts`, `src/utils/wildcardAsIndexed.test.ts`, `composeAllEntityConfigs.test.ts` ("check wildcard index fields").

## 1. Why

| ID | Fact |
|---|---|
| WI1 | 📖 Every field with `index: true` gets its own index (a sortable one `{ f: 1, _id: 1 }`, [connection-pagination.md](./connection-pagination.md) CP10), every not `parent` relational field gets one even without `index` (before `wildcardIndex`: always, now WI6), and MongoDB allows at most 64 indexes per collection ([limitations.md](./limitations.md) LM19). Fields that are only filtered by (ids of parents, of owners, of editors…) don't need sortable indexes. |
| WI2 | ✅ A wildcard index `{ '$**': 1 }` with `wildcardProjection` indexes every listed field (and every element of an array field) under its own path, so one index serves an equality, `$in` or range condition on any of them. Explain of MongoDB 8.0: a condition on one field uses `IXSCAN(WildcardIndex)`; for `a AND b` the planner tries a plan per field of the index and picks one, the other condition is checked after `FETCH`. |
| WI3 | ✅ Several wildcard indexes (one per group of fields) give nothing more: wildcard indexes never take part in index intersection (with single-field indexes `AND_SORTED` is considered but usually rejected, hash intersection is off by default). So `a AND b` uses one index in all variants. That's why the fields are not grouped and stay at the root of the document. |

## 2. Config

| ID | Fact |
|---|---|
| WI4 | ✅ `wildcardIndex: true` is allowed for text, int, float, dateTime, boolean, enum (scalar and array), relational (not `parent`) and duplex fields of a **tangible** entity (`wildcardIndexFieldKinds`). For other kinds `composeEntityConfig` throws `Forbidden wildcard index field: "x" of "geospatialFields" in entity: "X" while only … fields are allowed!`, for a field of an embedded or virtual entity `Forbidden wildcard index field: "x" in embedded entity: "X"!`. The types allow `wildcardIndex` only on the allowed kinds (`WildcardIndexableFieldProperties`), but the field types of embedded entities are the same, so there it is checked only at runtime. |
| WI5 | ✅ `wildcardIndex` and `index` are independent: `index` gives the own index (and sorting, for a scalar field), `wildcardIndex` puts the field into the wildcard index. Both on one field are allowed but make no sense: every condition on the field that the wildcard index serves is served by the own index too, and some only by the own one (`x_ne` / `x_nin` of a value, WI15; the `$lookup` of a reverse filter `<oppositeName>_`, WI14). So a field that must have `index: true` (for sorting, for a reverse filter, for `x_ne` / `x_nin`) gets no `wildcardIndex`: it would only add keys to the wildcard index and slow down writes. The only condition the wildcard index serves better, `x_exists: true` (WI15), is no reason to keep both. `unique` keeps its own unique index too. |
| WI6 | ✅ A relational field always had its own index; with `wildcardIndex` (and without `index`) it gets none, the wildcard index replaces it for filters, but not for the `$lookup` of the reverse filter `<oppositeName>_` in SBE (WI14). |

## 3. MongoDB index

| ID | Fact |
|---|---|
| WI7 | ✅ `createEntitySchema` adds one index `{ '$**': 1 }` named `WildcardIndex` with `wildcardProjection: { f1: 1, f2: 1, … }` of all fields with `wildcardIndex` (`composeWildcardProjection`); without such fields there is no index. It counts towards the 64 indexes as one. |
| WI8 | ✅ `syncIndexes` of Mongoose doesn't compare `wildcardProjection` (`isIndexEqual` compares only keys, `unique`, `sparse`, `partialFilterExpression`, `expireAfterSeconds`, `collation`, and weights of a text index), so a changed set of fields would leave the old index. Names are not compared either, so any root wildcard index (`{ '$**': 1 }`, e.g. created by hand) would pass for the schema one. `syncModelIndexes` therefore drops, before `syncIndexes`, every root wildcard index whose name is not `WildcardIndex` or whose projection differs from the schema one (as a set of fields, the order doesn't matter; no projection means all fields), and `syncIndexes` creates `WildcardIndex` again. `IndexNotFound` of this drop is ignored: the index is already dropped by a concurrent sync, e.g. of another instance of the application started at the same time. Without `wildcardIndex` fields a root wildcard index is dropped by `syncIndexes` itself. With the same fields the index is kept (the same `$indexStats` `since`). While the index is rebuilt the fields are filtered without it, as with every rebuilt index ([mongoose-models.md](./mongoose-models.md) MM11). |
| WI9 | ✅ Conditions that a wildcard index doesn't serve: `x_exists: false`, equality to `null`, `x_ne` / `x_nin` of a value, equality to a whole not empty array or object. They give correct results but scan the collection. Plans of every operator: WI15. |

## 4. GraphQL schema

| ID | Fact |
|---|---|
| WI10 | ✅ The SDL of the entity and its `…CreateInput` / `…UpdateInput` don't change: the field is stored at the root as before. |
| WI11 | ✅ For filters a field with `wildcardIndex` is the same as an indexed one (`wildcardAsIndexed`): it gets all operators of an indexed field in `XWhereInput`, `XWhereWithoutBooleanOperationsInput` and `XRestrictedWhereInput`; text and enum fields get into `XTextNamesEnum` (`XDistinctValues`, `XManyDistinctValues`); a relational field with `wildcardIndex` gives the `<oppositeName>_` filter (e.g. `shops_` of `Holding`) in `WhereInput` of the related entity, as an indexed one does. |
| WI12 | ✅ Sorting is only by `index`: a field with only `wildcardIndex` is not in `XSortEnum` (`getSortableFieldNames` is unchanged), `sort: { sortBy: [x_ASC] }` is a GraphQL validation error. |
| WI13 | 📖 Filters are converted to MongoDB conditions as before: the paths don't change, so resolvers, aggregations, `personalFilters` and keyset pagination need no changes. The exception is the reverse filter `<oppositeName>_`: its `$lookup` may scan the child collection instead of using the wildcard index (WI14). |

## 5. Query plans

> Verified by `explain('executionStats')` on MongoDB 8.0.34 (`internalQueryFrameworkControl: trySbeRestricted`, the default) with a copy of a real collection of 7268 documents, in two variants: the fields only in `WildcardIndex` and the same fields with own `{ f: 1 }` indexes.

| ID | Fact |
|---|---|
| WI14 | ✅ The reverse filter `<oppositeName>_` (WI11, e.g. `shops_` of `HoldingWhereInput`) becomes a `$lookup` with `foreignField` = the relational field of the child entity (`Shop.holding`), while `x_` of a not `parent` relational field or of a duplex field joins by `foreignField: '_id'` (`composeWhereInput`). When the pipeline runs in SBE, `$lookup` doesn't use a wildcard index for `foreignField`: it picks `HashJoin` (one full scan of the child collection per query) while the child collection has at most `internalQueryCollectionMaxNoOfDocumentsToChooseHashJoin` (10 000) documents and `internalQueryCollectionMaxDataSizeBytesToChooseHashJoin` (100 MB), otherwise `NestedLoopJoin` (a full scan per parent document); with an own `{ holding: 1 }` index it picks `IndexedLoopJoin`. The classic `$lookup` (e.g. after `$match: { _id }`, which is not pushed down to SBE) does use `WildcardIndex` (`indexesUsed: ["WildcardIndex"]`), so the restriction is of SBE only. A field that is the `foreignField` of a reverse filter really used in queries needs `index: true` instead of `wildcardIndex: true` (both make no sense, WI5); it is set on the child field, as the `parent: true` pair forbids `index` by its type. It is not added automatically: every relational field with `wildcardIndex` has such a pair, so all own indexes would come back. Duplex fields are not affected: their `$lookup` joins by `foreignField: '_id'`. |
| WI15 | ✅ Plans of the `where` operators of a field that is only in `WildcardIndex` (table below). In a `$or` one branch without an index makes the whole `$or` a collection scan. A `$or` branch that consists only of an `x_` filter is not derived into the pre-match ([aggregate-pre-match.md](./aggregate-pre-match.md) PM10), so such an `$or` doesn't narrow the documents before the `$lookup` whatever the indexes are, and an `x_exists: false` in another branch makes nothing worse there. |

WI14: `$lookup` of a reverse filter for 22 parent documents:

| `foreignField` (`Shop.holding`) | Strategy | Documents examined |
|---|---|---|
| only in `WildcardIndex` | `HashJoin` | 7290 |
| own `{ holding: 1 }` | `IndexedLoopJoin` | 2076 |
| only in `WildcardIndex`, child collection of 11 268 documents | `NestedLoopJoin` | 247 918 |

To reproduce: a child collection with `{ '$**': 1 }`, `wildcardProjection: { holding: 1 }` and without `{ holding: 1 }`; `db.holding_things.explain('executionStats').aggregate([{ $match: { show: true } }, { $lookup: { from: 'shop_things', localField: '_id', foreignField: 'holding', as: 'x' } }])` gives `strategy: "HashJoin"`; after `createIndex({ holding: 1 })` the same query gives `strategy: "IndexedLoopJoin"`.

WI15: plans of `where` operators:

| Condition | Plan |
|---|---|
| `x: <id>`, `x_in`, `x: <id>` of an array element | `IXSCAN(WildcardIndex)` |
| `x_exists: true` | `IXSCAN(WildcardIndex)`, reads only the documents with the field (better than an own index, which scans all keys, `null` included) |
| `x_ne: null` | `IXSCAN(WildcardIndex)` |
| `{ x: [] }` (empty array) | `IXSCAN(WildcardIndex)`: empty arrays are in the index |
| `x_exists: false` | `COLLSCAN` |
| `x: null` | `COLLSCAN` |
| `x_ne: <id>` | `COLLSCAN` (an own index serves it) |
| `x_nin: [...]` | `COLLSCAN` (an own index serves it) |
| `x_size`, `x_notsize` | `COLLSCAN` (with an own index too) |
| `$or` with at least one branch from the `COLLSCAN` rows | `SUBPLAN` → `COLLSCAN` |
| `AND` of an indexed condition and `x_exists: false` | `IXSCAN(WildcardIndex)` by the indexed one, the rest is checked after `FETCH` |
