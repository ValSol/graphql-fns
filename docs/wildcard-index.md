# `wildcardIndex`: filtered fields of one root wildcard index

> How fields with `wildcardIndex: true` are indexed by one wildcard index of the collection instead of own indexes, what this changes in the GraphQL schema and how the index is synced.
> Identifiers: `WI…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Tests: `src/mongooseModels/wildcardIndex.mtest.ts`, `src/mongooseModels/composeWildcardProjection.test.ts`, `src/utils/wildcardAsIndexed.test.ts`, `composeAllEntityConfigs.test.ts` ("check wildcard index fields").

## 1. Why

| ID | Fact |
|---|---|
| WI1 | 📖 Every field with `index: true` gets its own index (a sortable one `{ f: 1, _id: 1 }`, [connection-pagination.md](./connection-pagination.md) CP10), every relational field gets one always, and MongoDB allows at most 64 indexes per collection ([limitations.md](./limitations.md) LM19). Fields that are only filtered by (ids of parents, of owners, of editors…) don't need sortable indexes. |
| WI2 | ✅ A wildcard index `{ '$**': 1 }` with `wildcardProjection` indexes every listed field (and every element of an array field) under its own path, so one index serves an equality, `$in` or range condition on any of them. Explain of MongoDB 8.0: a condition on one field uses `IXSCAN(WildcardIndex)`; for `a AND b` the planner tries a plan per field of the index and picks one, the other condition is checked after `FETCH`. |
| WI3 | ✅ Several wildcard indexes (one per group of fields) give nothing more: wildcard indexes never take part in index intersection (with single-field indexes `AND_SORTED` is considered but usually rejected, hash intersection is off by default). So `a AND b` uses one index in all variants. That's why the fields are not grouped and stay at the root of the document. |

## 2. Config

| ID | Fact |
|---|---|
| WI4 | ✅ `wildcardIndex: true` is allowed for text, int, float, dateTime, boolean, enum (scalar and array), relational (not `parent`) and duplex fields of a **tangible** entity (`wildcardIndexFieldKinds`). For other kinds `composeEntityConfig` throws `Forbidden wildcard index field: "x" of "geospatialFields" in entity: "X" while only … fields are allowed!`, for a field of an embedded or virtual entity `Forbidden wildcard index field: "x" in embedded entity: "X"!`. The types allow `wildcardIndex` only on the allowed kinds (`WildcardIndexableFieldProperties`), but the field types of embedded entities are the same, so there it is checked only at runtime. |
| WI5 | ✅ `wildcardIndex` and `index` are independent: `index` gives the own index (and sorting, for a scalar field), `wildcardIndex` puts the field into the wildcard index. Both on one field are allowed but redundant: the own index already serves filters. `unique` keeps its own unique index too. |
| WI6 | ✅ A relational field always had its own index; with `wildcardIndex` (and without `index`) it gets none, the wildcard index replaces it. |

## 3. MongoDB index

| ID | Fact |
|---|---|
| WI7 | ✅ `createEntitySchema` adds one index `{ '$**': 1 }` named `WildcardIndex` with `wildcardProjection: { f1: 1, f2: 1, … }` of all fields with `wildcardIndex` (`composeWildcardProjection`); without such fields there is no index. It counts towards the 64 indexes as one. |
| WI8 | ✅ `syncIndexes` of Mongoose doesn't compare `wildcardProjection` (`isIndexEqual` compares only keys, `unique`, `sparse`, `partialFilterExpression`, `expireAfterSeconds`, `collation`, and weights of a text index), so a changed set of fields would leave the old index. `syncModelIndexes` therefore drops `WildcardIndex` before `syncIndexes` if its projection in the database differs from the schema one (as a set of fields, the order doesn't matter), and `syncIndexes` creates it again. With the same fields the index is kept (the same `$indexStats` `since`). While the index is rebuilt the fields are filtered without it, as with every rebuilt index ([mongoose-models.md](./mongoose-models.md) MM11). |
| WI9 | 📖 Conditions that a wildcard index doesn't serve (MongoDB restrictions): `x_exists: false`, equality to `null`, equality to a whole array or object. They give correct results but scan the collection. |

## 4. GraphQL schema

| ID | Fact |
|---|---|
| WI10 | ✅ The SDL of the entity and its `…CreateInput` / `…UpdateInput` don't change: the field is stored at the root as before. |
| WI11 | ✅ For filters a field with `wildcardIndex` is the same as an indexed one (`wildcardAsIndexed`): it gets all operators of an indexed field in `XWhereInput`, `XWhereWithoutBooleanOperationsInput` and `XRestrictedWhereInput`; text and enum fields get into `XTextNamesEnum` (`XDistinctValues`, `XManyDistinctValues`); a relational field with `wildcardIndex` gives the `<oppositeName>_` filter (e.g. `shops_` of `Holding`) in `WhereInput` of the related entity, as an indexed one does. |
| WI12 | ✅ Sorting is only by `index`: a field with only `wildcardIndex` is not in `XSortEnum` (`getSortableFieldNames` is unchanged), `sort: { sortBy: [x_ASC] }` is a GraphQL validation error. |
| WI13 | 📖 Filters are converted to MongoDB conditions as before: the paths don't change, so resolvers, aggregations, `personalFilters` and keyset pagination need no changes. |
