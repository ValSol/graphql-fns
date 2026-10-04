# Geospatial index paths

> On which path the `2dsphere` index of a geospatial field is built and on which path the geo conditions (`near`, `where`) are composed, so MongoDB can use the index.
> Identifiers: `GI…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Tests: `src/resolvers/utils/mergeWhereAndFilter/geoWithinIndex.mtest.ts`, `src/resolvers/utils/mergeWhereAndFilter/composeWhereInput.test.ts`, `src/resolvers/utils/composeGeospatialKey/composeGeospatialKey.test.ts`.

A geospatial field is stored as GeoJSON: `{ type: 'Point', coordinates: [lng, lat] }`, `{ type: 'Polygon', coordinates: [...] }` etc.

## 1. Index

| ID | Fact |
|---|---|
| GI1 | ✅ `index: true` of a `Point` field creates the `2dsphere` index on the nested array of numbers, not on the field: `{ '<field>.coordinates': '2dsphere' }` (`src/mongooseModels/composeThingSchemaProperties.ts`). For an array of points (`array: true`) it is `{ '<field>.coordinates': '2dsphere' }` too, a multikey index. |
| GI2 | 📖 The path of the index is kept as it is: changing it would need rebuilding the indexes of existing databases. |

## 2. Conditions

`composeGeospatialKey(path, geospatialType)` (`src/resolvers/utils/composeGeospatialKey`) returns `<path>.coordinates` for `Point` and `<path>` for the other types. It is the only place that knows the path of the index; every geo condition uses it.

| ID | Fact |
|---|---|
| GI3 | ✅ `near` of lists: `$geoNear.key` (`composeNearForAggregateInput`) and the `$nearSphere` condition (`composeNearInput`) are composed on `composeGeospatialKey(field, geospatialType)`. |
| GI4 | ✅ `where` operators of a `Point` field that compose `$geoWithin`: `x_withinSphere` (`$centerSphere`), `x_withinPolygon`, `x_withinMultiPolygon`, `x_aroundLineString`, `x_aroundMultiLineString` (`$geometry`) are composed on `<x>.coordinates` by `composeWhereInput`: `{ 'x.coordinates': { $geoWithin: … } }`. The type of the field is taken from the fields object of the entity (`composeFieldsObject`), so the same holds inside embedded objects (`'embedded.x.coordinates'`). |
| GI5 | ✅ A condition on `<x>` itself can't use the index: the plan is COLLSCAN. On `<x>.coordinates` the plan is IXSCAN and the documents are the same, both for a scalar point and for an array of points. `$centerSphere` and `$geometry` work on the legacy coordinate pair `[lng, lat]` as on the GeoJSON point. |
| GI6 | ✅ The operators of the other geospatial types (`x_intersects…`, `$geoIntersects`) stay on `<x>`, where their `2dsphere` index is. `x_exists`, `x_size`, `x_notsize` stay on `<x>` for all types. |
| GI7 | ✅ In a relational filter the condition is composed on `<as>.<x>.coordinates` (e.g. `'ownPlaces_.coordinates.coordinates'`). After `$lookup` there is no index anyway, but the documents selected are the same as with `<as>.<x>`. `composePreMatch` decides by the first segment of the path, so the condition still counts as a lookup condition ([aggregate-pre-match.md](./aggregate-pre-match.md)). |
| GI8 | 📖 `createEntitiesQueryResolver` and `createEntitiesThroughConnectionQueryResolver` turn `near` with `maxDistance` into `<geospatialField>_withinSphere` of `where` when there is `search`; it goes through `composeWhereInput`, so it gets the same path. |
