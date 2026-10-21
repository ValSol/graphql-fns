# Connections: keyset pagination

> How connections (`XsThroughConnection`, child connection fields) select a page after (before) a cursor, and which indexes serve them.
> Identifiers: `CP…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Limits of the API are in [limitations.md](./limitations.md) (LM33, LM35).

The external API is the Relay Connection: `first` / `after` / `last` / `before` and `pageInfo { hasNextPage hasPreviousPage startCursor endCursor }`; a cursor is an opaque string. Every connection is resolved by `createEntitiesThroughConnectionQueryResolver` (child connections reach it through `createChildEntitiesThroughConnectionQueryResolver`), which picks one of three ways to page by the order of the query:

| Order | Way | Cursor |
|---|---|---|
| `sort` (with or without `near`), `near` without `sort` (by the distance), or no order at all (`id_ASC`) | keyset: `getKeysetConnection` | base64 of EJSON `{ order: { sortBy, near? }, values }` |
| the ids of the parent's field (a child connection without `sort`, `near`, `search`) | positions in the array: `getParentIdsConnection` | base64 of `<_id>:<position>` |
| `search` without `sort` | `skip`: `getSkipConnection` | base64 of `<_id>:<shift>` |

## 1. The order is total

| ID | Fact |
|---|---|
| CP1 | ✅ `addIdTieBreaker` ends `sortBy` with `id` (unless it already has `id_…`) **in the direction of the last key**: `[group_ASC, label_DESC]` → `[…, id_DESC]`, `[label_DESC, group_ASC]` → `[…, id_ASC]`. Without any order the sort is `[id_ASC]`. A field repeated in `sortBy` takes the position of its first key and the direction of its last key, as MongoDB sorts by it (`[label_ASC, group_ASC, label_DESC]` → `[label_DESC, group_ASC, id_ASC]`): the keyset condition must use the same keys as the sort. So no two documents are equal by the sort keys and every page is a continuation of the previous one. |
| CP2 | ✅ The direction of `id` follows the last key so that the index `{ f: 1, _id: 1 }` (CP10) serves both `f_ASC` (`{ f: 1, _id: 1 }`) and `f_DESC` (`{ f: -1, _id: -1 }`, the index read backward). |
| CP3 | ✅ `near` with `sort` gets `id` the same way and is ordered by the sort keys (`$nearSphere` / `$geoNear` only select). `near` without `sort` gets the sort `[<field>_distance_ASC, id_ASC]`: `<field>_distance` is the distance that `$geoNear` adds (CP12), an internal key that is not in `XSortEnum`. `search` without `sort` keeps the order of the text score. |

## 2. Keyset

`getKeysetConnection` (`src/resolvers/queries/utils/keyset`) reads a page with one query to the list resolver: the condition "after (before) the cursor" is added to `where` (the internal arg `keysetFilter_from_connection`), the size is `first + 1` (`last + 1`) to learn if there is more. `before` / `last` read in the reversed sort and reverse the page.

| ID | Fact |
|---|---|
| CP4 | ✅ The cursor keeps the values of the sort keys of its node and the order it was composed for (`toKeysetCursor`): `sortBy` and, for the distance, the point of `near` (`[geospatialField, lng, lat]`), since the distance depends on the point; `maxDistance` / `minDistance` don't change the order and are not kept; EJSON keeps the types of `Date` and `ObjectId`. A missing value is kept as `null`: MongoDB sorts a missing value as `null`. The sort fields are added to the projection of the page, so the nodes have them even if the client didn't select them. The cursor is opaque but not secret: base64 shows the values of the sort fields of the node (the fields the client sorts by). |
| CP5 | ✅ For keys `k1…kn` (`kn` is `_id`) "after" is `k1 > v1 OR (k1 = v1 AND k2 > v2) OR …`, where `>` is `$gt` for ASC and `$lt` for DESC (`composeKeysetFilter`). The keys after `id` are dropped (`composeKeysetSortKeys`). With several keys the condition also gets the range of the first key (`k1 >= v1`): it bounds the scan of the index. |
| CP6 | ✅ `null` is less than any value (MongoDB sorts it first in ASC, last in DESC), and `$gt` / `$lt` don't compare values of different types: "greater than `null`" is `{ k: { $ne: null } }`, "less than `v`" is `{ $or: [{ k: { $lt: v } }, { k: null }] }`, nothing is less than `null`. `_id` is never `null`. |
| CP7 | ✅ The next page consists of the documents that come after the cursor values, whatever has happened to the cursor document: deleted, changed or no longer matching `where`, the page continues right after its place. Documents added before the cursor don't shift the page. |
| CP8 | ✅ `hasPreviousPage` of `after` (`hasNextPage` of `before`) is exact: one more query with `first: 1` for a document on the other side of the cursor, the cursor document included (the "inclusive" negation of the page condition). Without a cursor it is `false`. The two queries run in parallel. |
| CP9 | ✅ A cursor that can't be decoded, that has another `sortBy` (the client changed the sort) or another point of `near` or whose values are not scalars, `Date` or `ObjectId` (a value gets into the filter, so an object with operators is rejected), or whose distance (of `near`) is not a finite non-negative number (it bounds `$geoNear`, which rejects such a distance) is ignored: the very first (last) page is returned, without an error. Cursors of the previous format (`<_id>:<shift>`) are ignored the same way. |

## 3. Indexes

| ID | Fact |
|---|---|
| CP10 | ✅ Every sortable field of a tangible entity (`getSortableFieldNames`: scalar text, int, float, date, boolean and enum fields with `index: true`, the fields of `XSortEnum`) gets the compound index `{ f: 1, _id: 1 }` (`f_1__id_1`) instead of the single-field `{ f: 1 }`; `createdAt` and `updatedAt` get `{ createdAt: 1, _id: 1 }` and `{ updatedAt: 1, _id: 1 }`. The prefix `f` serves the filters by `f` as the single-field index did, so the number of indexes is the same; only a field that is both `unique` and `index` gets one more (it keeps the unique `{ f: 1 }`). The sync of the library (`syncIndexes`) drops the old `f_1`, `createdAt_1`, `updatedAt_1` and builds the new ones on the first use of the model. Array fields and fields of embedded entities keep single-field indexes. |
| CP11 | 📖 A sort by one key (plus `id`) is served by the index: the page is read from the index in order, starting at the cursor. A sort by several keys has no compound index (only `uniqueCompoundIndexes` are created), so MongoDB sorts the documents after the cursor in memory (top-k for `first + 1`); it's still cheaper than `skip`, which sorts all the documents before the cursor too. |

## 4. `near`: pages by the distance

| ID | Fact |
|---|---|
| CP12 | ✅ Without `sort` (or with the sort by `<field>_distance` of a connection) the list resolver queries `near` by an aggregate (`$geoNear`, it adds the distance field) and sorts by `<field>_distance` and `_id`; `$nearSphere` of `find` would leave documents at the same distance (e.g. at the same point) in no definite order. The list query `Xs(near: …)` gets the same order. The nodes of such a connection have the distance field (it composes the cursor); GraphQL doesn't return it. |
| CP13 | ✅ To keep the sort by the ascending distance bounded, `narrowGeoNearToPage` first reads the distance of the document that ends the page in the `$geoNear` order (`$skip: skip + limit - 1`, `$limit: 1`) and narrows `maxDistance` to it (with a tiny margin): the documents not farther than it are enough to compose the page, so only `skip + limit` documents plus the ones at the boundary distance are sorted. Without a limit all the matching documents are sorted. |
| CP14 | ✅ The keyset condition of `near` (CP5 with the distance as the first key) is matched after `$geoNear`, not in its `query`: the distance exists only after it. `$geoNear` itself is narrowed by the cursor distance (with a tiny margin): `after` sets `minDistance` to it, `before` sets `maxDistance` (the user's `minDistance` / `maxDistance` are kept if they are narrower). So `after` reads only the documents from the cursor distance on, bounded by CP13; `before` / `last` read in the descending distance, which `$geoNear` doesn't give, so all the documents nearer than the cursor are sorted (the cost grows with the depth backward). A page continues after the cursor distance even if the cursor entity was deleted or moved. `near` with `sort` pages by the sort keys the same way, with the keyset condition after `$geoNear`. |
| CP15 | ✅ Only `search` without `sort` pages by `skip` (`getSkipConnection`): the cursor keeps the position, and if the cursor entity isn't found at it the position is counted again by `$setWindowFields` (`getShift`). A cursor entity that is deleted or no longer matches gives the very first (last) page. |

## 5. Child connections by the ids of the parent

| ID | Fact |
|---|---|
| CP16 | ✅ A child connection without `sort`, `near` and `search` keeps the order of the ids in the parent's field (`objectIds_from_parent`, `$indexOfArray`). Its key is the position in the array: the page after the cursor is selected by `_id: { $in: <the ids after the cursor's position> }`, `before` by the ids before it in the reversed order. A repeated id is the entity at the position of its first occurrence (as `$indexOfArray` orders it): the ids are deduplicated first, and the positions are the positions in the deduplicated array, so the ids after a position never contain an entity before it. The position is found by the id of the cursor in the current array, and the position kept in the cursor is used only if the id is no longer there. |
