# Connections: keyset pagination

> How connections (`XsThroughConnection`, child connection fields) select a page after (before) a cursor, and which indexes serve them.
> Identifiers: `CP…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Limits of the API are in [limitations.md](./limitations.md) (LM33, LM35).

The external API is the Relay Connection: `first` / `after` / `last` / `before` and `pageInfo { hasNextPage hasPreviousPage startCursor endCursor }`; a cursor is an opaque string. Every connection is resolved by `createEntitiesThroughConnectionQueryResolver` (child connections reach it through `createChildEntitiesThroughConnectionQueryResolver`), which picks one of three ways to page by the order of the query:

| Order | Way | Cursor |
|---|---|---|
| `sort` (without `near`), or no order at all (`id_ASC`) | keyset: `getKeysetConnection` | base64 of EJSON `{ sortBy, values }` |
| the ids of the parent's field (a child connection without `sort`, `near`, `search`) | positions in the array: `getParentIdsConnection` | base64 of `<_id>:<position>` |
| `near`; `search` without `sort` | `skip`: `getSkipConnection` | base64 of `<_id>:<shift>` |

## 1. The order is total

| ID | Fact |
|---|---|
| CP1 | ✅ `addIdTieBreaker` ends `sortBy` with `id` (unless it already has `id_…`) **in the direction of the last key**: `[group_ASC, label_DESC]` → `[…, id_DESC]`, `[label_DESC, group_ASC]` → `[…, id_ASC]`. Without any order the sort is `[id_ASC]`. So no two documents are equal by the sort keys and every page is a continuation of the previous one. |
| CP2 | ✅ The direction of `id` follows the last key so that the index `{ f: 1, _id: 1 }` (CP10) serves both `f_ASC` (`{ f: 1, _id: 1 }`) and `f_DESC` (`{ f: -1, _id: -1 }`, the index read backward). |
| CP3 | ✅ `near` with `sort` gets `id` the same way and is ordered by the sort keys ($nearSphere / `$geoNear` only select). `near` without `sort` is ordered by the distance and then by `_id`: the list resolver adds `$sort: { <field>_distance: 1, _id: 1 }` (CP12), `getShift` counts the position with the same keys. `search` without `sort` keeps the order of the text score. |

## 2. Keyset

`getKeysetConnection` (`src/resolvers/queries/utils/keyset`) reads a page with one query to the list resolver: the condition "after (before) the cursor" is added to `where` (the internal arg `keysetFilter_from_connection`), the size is `first + 1` (`last + 1`) to learn if there is more. `before` / `last` read in the reversed sort and reverse the page.

| ID | Fact |
|---|---|
| CP4 | ✅ The cursor keeps the values of the sort keys of its node and the `sortBy` it was composed for (`toKeysetCursor`); EJSON keeps the types of `Date` and `ObjectId`. A missing value is kept as `null`: MongoDB sorts a missing value as `null`. The sort fields are added to the projection of the page, so the nodes have them even if the client didn't select them. The cursor is opaque but not secret: base64 shows the values of the sort fields of the node (the fields the client sorts by). |
| CP5 | ✅ For keys `k1…kn` (`kn` is `_id`) "after" is `k1 > v1 OR (k1 = v1 AND k2 > v2) OR …`, where `>` is `$gt` for ASC and `$lt` for DESC (`composeKeysetFilter`). The keys after `id` are dropped (`composeKeysetSortKeys`). With several keys the condition also gets the range of the first key (`k1 >= v1`): it bounds the scan of the index. |
| CP6 | ✅ `null` is less than any value (MongoDB sorts it first in ASC, last in DESC), and `$gt` / `$lt` don't compare values of different types: "greater than `null`" is `{ k: { $ne: null } }`, "less than `v`" is `{ $or: [{ k: { $lt: v } }, { k: null }] }`, nothing is less than `null`. `_id` is never `null`. |
| CP7 | ✅ The next page consists of the documents that come after the cursor values, whatever has happened to the cursor document: deleted, changed or no longer matching `where`, the page continues right after its place. Documents added before the cursor don't shift the page. |
| CP8 | ✅ `hasPreviousPage` of `after` (`hasNextPage` of `before`) is exact: one more query with `first: 1` for a document on the other side of the cursor, the cursor document included (the "inclusive" negation of the page condition). Without a cursor it is `false`. The two queries run in parallel. |
| CP9 | ✅ A cursor that can't be decoded, that has another `sortBy` (the client changed the sort) or whose values are not scalars, `Date` or `ObjectId` (a value gets into the filter, so an object with operators is rejected) is ignored: the very first (last) page is returned, without an error. Cursors of the previous format (`<_id>:<shift>`) are ignored the same way. |

## 3. Indexes

| ID | Fact |
|---|---|
| CP10 | ✅ Every sortable field of a tangible entity (`getSortableFieldNames`: scalar text, int, float, date, boolean and enum fields with `index: true`, the fields of `XSortEnum`) gets the compound index `{ f: 1, _id: 1 }` (`f_1__id_1`) instead of the single-field `{ f: 1 }`; `createdAt` and `updatedAt` get `{ createdAt: 1, _id: 1 }` and `{ updatedAt: 1, _id: 1 }`. The prefix `f` serves the filters by `f` as the single-field index did, so the number of indexes is the same; only a field that is both `unique` and `index` gets one more (it keeps the unique `{ f: 1 }`). The sync of the library (`syncIndexes`) drops the old `f_1`, `createdAt_1`, `updatedAt_1` and builds the new ones on the first use of the model. Array fields and fields of embedded entities keep single-field indexes. |
| CP11 | 📖 A sort by one key (plus `id`) is served by the index: the page is read from the index in order, starting at the cursor. A sort by several keys has no compound index (only `uniqueCompoundIndexes` are created), so MongoDB sorts the documents after the cursor in memory (top-k for `first + 1`); it's still cheaper than `skip`, which sorts all the documents before the cursor too. |

## 4. `near`: the order of equal distances

| ID | Fact |
|---|---|
| CP12 | ✅ Without `sort` the list resolver queries `near` by an aggregate (`$geoNear`, it adds the distance field) and sorts by `<field>_distance` and `_id`; `$nearSphere` of `find` would leave documents at the same distance (e.g. at the same point) in no definite order. |
| CP13 | ✅ To keep the sort bounded, `narrowGeoNearToPage` first reads the distance of the document that ends the page in the `$geoNear` order (`$skip: skip + limit - 1`, `$limit: 1`) and narrows `maxDistance` to it (with a tiny margin): the documents not farther than it are enough to compose the page, so only `skip + limit` documents plus the ones at the boundary distance are sorted. Without a limit all the matching documents are sorted. |
| CP14 | ✅ `near` still pages by `skip` (`getSkipConnection`): the cursor keeps the position, and if the cursor entity isn't found at it the position is counted again by `$setWindowFields` (`getShift`). A cursor entity that is deleted or no longer matches gives the very first (last) page. |

## 5. Child connections by the ids of the parent

| ID | Fact |
|---|---|
| CP15 | ✅ A child connection without `sort`, `near` and `search` keeps the order of the ids in the parent's field (`objectIds_from_parent`, `$indexOfArray`). Its key is the position in the array: the page after the cursor is selected by `_id: { $in: <the ids after the cursor's position> }`, `before` by the ids before it in the reversed order. The position is found by the id of the cursor in the current array, and the position kept in the cursor is used only if the id is no longer there. |
