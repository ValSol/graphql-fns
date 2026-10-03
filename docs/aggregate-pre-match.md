# Pre-match: filtering before the lookups

> How aggregations with relational filters (`x_`) check the conditions that don't need the related documents before running the `$lookup` stages, so MongoDB can use the indexes of the collection.
> Identifiers: `PM…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.

A relational filter `x_: {…}` in `where` (or in the access filter) can only be checked after a `$lookup` that joins the related documents. `mergeWhereAndFilter` returns such lookups next to the composed `where`, and an aggregation used to be built as `[...lookups, { $match: where }]`. MongoDB then reads the whole collection (COLLSCAN) and runs every lookup for every document before it filters anything, even when `where` holds an equality on an indexed field.

MongoDB moves top-level `$match` conjuncts that don't depend on a lookup's `as` ahead of the `$lookup` itself. But the access filter makes the top level of `where` an `$or` whose branches mix local and relational conditions, so it has nothing to move:

```js
{ $or: [
  { districtId: { $eq: 'd1' }, show: { $eq: true }, editors: { $eq: 'u1' } },
  { districtId: { $eq: 'd1' }, show: { $eq: true }, group: { $exists: true }, 'group_.editors': { $eq: 'u1' } },
] }
```

## 1. Pipeline

`composeAggregateHead` (`src/resolvers/utils/mergeWhereAndFilter/composeAggregateHead.ts`) composes the stages that begin an aggregation:

```js
[
  { $match: { $text: { $search }, ...preMatch } },   // only with "search"
  { $sort: { score: { $meta: 'textScore' } } },      // only with "search" and "sortByTextScore"
  { $geoNear: { ...geoNear, query: preMatch } },      // only with "near"; "query" only without "search"
  { $match: preMatch },                               // only without "search" and "near"
  ...lookups,
  { $match: where },                                  // only if not empty
]
```

| ID | Fact |
|---|---|
| PM1 | ✅ The full `{ $match: where }` stays after the lookups, so the documents selected are the same as without the pre-match. The pre-match only removes documents that can't match `where` before they reach the lookups. |
| PM2 | ✅ With `search` the pre-match goes into the same `$match` as `$text`, which has to be the first stage; it is not a separate stage after `$sort`. |
| PM3 | ✅ With `near` the pre-match goes into `$geoNear.query`. `$geoNear` has to be the first stage, and a `$match` after it can't use another index. |
| PM4 | ✅ Without lookups there is no pre-match: `where` itself is checked in the first `$match`. Without local conditions (a purely relational `where`) there is no pre-match either, and the pipeline is the same as before. |
| PM5 | 📖 With both `search` and `near` the order is `$text`, `$sort`, `$geoNear`, as it was before; MongoDB rejects such a pipeline anyway (`$geoNear` must be first and can't be combined with `$text`). The pre-match is then in the `$text` match. |
| PM6 | ✅ The access filter (`involvedFilters`) is merged into `where` by `addFilter` before composing, so its local part gets into the pre-match too. |

## 2. Derivation

`composePreMatch(where, lookups)` (`src/resolvers/utils/mergeWhereAndFilter/composePreMatch.ts`) derives the pre-match from the composed MongoDB `where` (the result of `composeWhereInput`). It returns `null` if nothing is left.

Invariant: the pre-match is a necessary condition of `where`. Every document that matches `where` matches the pre-match; it may be weaker than `where`, never stronger.

| ID | Fact |
|---|---|
| PM7 | ✅ A path is relational if its first dot-separated segment equals the `as` of one of the lookups. All `as` values are top-level: a relational filter inside an embedded field throws in `composeWhereInput`, and a nested relational filter `x_: { y_: … }` gets the lookup `as: 'x_y_'`. Segments are compared whole: `group` and `group.title` are local, `group_` and `group_.title` are relational. |
| PM8 | ✅ An object of conditions is a conjunction: the conditions on local paths are kept, the ones on relational paths are dropped (dropping a conjunct only weakens the condition). Negating operators of a field (`$ne`, `$nin`, `$not: { $size }`) live under the path of the field, so they are kept or dropped with it. |
| PM9 | ✅ `$and`: every item is derived; empty results are left out, and `$and` itself is left out if nothing is left. |
| PM10 | ✅ `$or`: every branch is derived. If any branch gives nothing (it has only relational conditions, so before the lookups it may match any document), the whole `$or` gives nothing. |
| PM11 | ✅ The conditions present with deep-equal values (`fast-deep-equal`: `ObjectId`, `Date` and `RegExp` are compared by value) in every derived branch of `$or` are hoisted next to it as top-level conjuncts. A top-level equality on an indexed field lets the planner use the index regardless of how it plans an `$or`. The rest of the branches stays as `$or` (equal rests are kept once); if a rest is empty, that branch is always true and the `$or` is dropped. |
| PM12 | ✅ A hoisted condition whose path already has another condition at the same level is added to `$and` instead of replacing it. |
| PM13 | ✅ `$nor`: if any of its parts (also inside nested `$and` / `$or` / `$nor`) touches a relational path, the whole `$nor` is dropped: dropping a term inside a negation would make the condition stronger. A purely local `$nor` is kept as it is. |
| PM14 | ✅ `composeWhereInput` emits no other top-level operators than `$and`, `$or` and `$nor`; any other key starting with `$` throws `Got unknown operator …`. |

On the example above the pre-match is:

```js
{ districtId: { $eq: 'd1' }, show: { $eq: true }, $or: [{ editors: { $eq: 'u1' } }, { group: { $exists: true } }] }
```

## 3. Where it is used

| ID | Fact |
|---|---|
| PM15 | ✅ Queries: `createEntityQueryResolver`, `createEntitiesQueryResolver` (`near`, `search`), `createEntityCountQueryResolver` (`search`), `createEntityCountsQueryResolver` (`search`; only the common `where`, the items of `restrictedWhere` can't be relational and run in `$facet`), `createEntityExistencesQueryResolver` (`search`, a pre-match per item), `createEntityDistinctValuesQueryResolver` (`search`) and `queries/utils/getShift` (`near`, `search`). `createEntitiesThroughConnectionQueryResolver` and `createChildEntitiesThroughConnectionQueryResolver` build no aggregation themselves: they use `getShift` and the entities resolver. |
| PM16 | ✅ Mutations: `resolverAttributes/getPrevious` of `UpdateEntity`, `UpdateManyEntities`, `UpdateFilteredEntities` (`near`, `search`), `DeleteEntity`, `DeleteManyEntities`, `DeleteFilteredEntities` (`near`, `search`) and `PushIntoEntity`. |
| PM17 | 📖 Not used where only the composed `where` is needed and the lookups are dropped: `getCommonData` of `CopyEntity` / `CopyManyEntities`, `checkData` (tests the incoming data with `mingo`, without a query to MongoDB) and `composeSubscribePayloadMongoFilter`. In `checkData` a relational condition of the filter is tested against the incoming data, which has no `x_` field, as if the related document were missing (e.g. `$eq` doesn't match, `$ne` matches). |

## 4. Effect

| ID | Fact |
|---|---|
| PM18 | ✅ On 60 documents, an index on `districtId` and the access filter of the example (`composeAggregateHead.mtest.ts`): without the pre-match `EQ_LOOKUP ← COLLSCAN`, 111 documents examined; with it `EQ_LOOKUP ← FETCH ← IXSCAN`, 15 keys and 25 documents examined. |
| PM19 | ✅ Results are the same with and without the pre-match for count, existences, entities and raw pipelines with `search` and `near`, over wheres with `OR` / `NOR` of relational filters (`composeAggregateHead.mtest.ts`). |
| PM20 | 📖 A `where` whose indexed condition lives in the related document (`x_: { districtId: … }`) gets no help: that condition is relational. Querying the ids of the related documents first and filtering by `x_in: [ids]` makes it local. |
