## Part 3. Nested objects and geodata

Part 3 covers properties whose values are objects: plain nested objects (`embeddedFields`) and geometries (`geospatialFields`). As in part 2, the examples were run with subscriptions excluded by `inventory` and `({ mongooseConn })` as the context.

### Starting point

```ts
const countries = [
  {
    code: 'UA',
    names: [
      { lang: 'uk', text: 'Україна' },
      { lang: 'en', text: 'Ukraine' },
      { lang: 'pl', text: 'Ukraina' },
    ],
    capital: { name: 'Kyiv', population: 2950000, location: { type: 'Point', coordinates: [30.52, 50.45] } },
    territory: { type: 'MultiPolygon', coordinates: [[[[22, 44], [40, 44], [40, 52], [22, 52], [22, 44]]]] },
  },
];

const cities = [
  { name: 'Kyiv', location: { type: 'Point', coordinates: [30.52, 50.45] } },
  { name: 'Lviv', location: { type: 'Point', coordinates: [24.03, 49.84] } },
  { name: 'Warsaw', location: { type: 'Point', coordinates: [21.01, 52.23] } },
];
```

`names` and `capital` are nested objects, `location` and `territory` are GeoJSON geometries.

### Step 1. Nested objects: embedded entities

A nested object is described by its own entity config with `type: 'embedded'` and is referred to from an `embeddedFields` field by `configName`:

```ts
const entityConfigs: SimplifiedEntityConfig[] = [
  {
    name: 'Translation',
    type: 'embedded',
    textFields: [{ name: 'lang', index: true }, { name: 'text', index: true }],
  },
  {
    name: 'Capital',
    type: 'embedded',
    textFields: [{ name: 'name' }],
    intFields: [{ name: 'population' }],
    geospatialFields: [{ name: 'location', geospatialType: 'Point' }],
  },
  {
    name: 'Country',
    textFields: [{ name: 'code', unique: true, required: true }],
    embeddedFields: [
      { name: 'names', configName: 'Translation', array: true, index: true, variants: ['plain', 'connection', 'count'] },
      { name: 'capital', configName: 'Capital' },
    ],
    geospatialFields: [{ name: 'territory', geospatialType: 'MultiPolygon', index: true }],
  },
  {
    name: 'City',
    textFields: [{ name: 'name', index: true }],
    geospatialFields: [{ name: 'location', geospatialType: 'Point', index: true }],
  },
];
```

- An embedded entity has **no collection** of its own and no root queries or mutations: it is stored inside the document of its owner ✅. It gets a GraphQL type (`Translation`, `Capital`) with an `id` field: every nested object gets its own `_id` in MongoDB ✅.
- An embedded entity may have scalar, enum, geospatial and other embedded fields, but no relational, duplex, filter or calculated fields and no `freeze` (types / `composeAllEntityConfigs`) 📖. Links to other collections stay on the tangible owner (part 2).
- The same embedded config can be used by several fields and entities.

When to embed instead of a separate entity with a link (part 2): the nested objects belong to one owner only, are always read and written together with it, and do not need to be queried on their own.

### Step 2. Options of an embedded field

| Option | Effect |
|---|---|
| `array: true` | a list of nested objects |
| `variants` (arrays only) | `plain` (default): `names(slice): [Translation!]!`; `connection`: `namesThroughConnection(first, after, last, before)`; `count`: `namesCount: Int!` ✅ |
| `index: true` | the field is indexed in MongoDB, together with the nested fields marked `index: true` (the whole chain must be indexed, see below) 📖, and appears in `…WhereInput` as `names: TranslationWhereInput` (and `names_size`, `names_notsize` for arrays) ✅ |
| `nullable: true` (arrays only) | `null` allowed instead of `[]` |

**Indexes of nested fields.** Put `index: true` on a nested field only if you will select by it, and then on **every field along the chain** from the tangible entity to it: here `Country.names` and `Translation.lang` / `Translation.text`. For an embedded object inside an embedded object (`Country.capital` → `Capital.address` → `Address.city`) that means `capital`, `address` and `city`. A nested `index: true` without indexed embedded fields above it creates no Mongo index 📖 and the path to it does not appear in `where` ✅ (`capital` has no `index`, so `where` has no `capital`).

### Step 3. Geodata: geospatial fields

`geospatialType`: `Point`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`; `array: true` and `index: true` are allowed.

**Two formats** ✅:

| | Point | Polygon | MultiPolygon |
|---|---|---|---|
| MongoDB (GeoJSON) | `{ type: 'Point', coordinates: [lng, lat] }` | `{ type: 'Polygon', coordinates: [[[lng, lat], …]] }` | `{ type: 'MultiPolygon', coordinates: [[[[lng, lat], …]]] }` |
| GraphQL API | `{ lng, lat }` | `{ externalRing: { ring: [{ lng, lat }, …] }, internalRings: [{ ring: […] }] }` | `{ polygons: [<polygon>, …] }` |

`LineString`: `{ coordinates: [{ lng, lat }, …] }`, `MultiLineString`: `{ lineStrings: [<lineString>, …] }`. The library converts between the formats itself; the converters are also exported: `pointFromMongoToGql` / `pointFromGqlToMongo`, `lineString…`, `multiLineString…`, `polygon…`, `multiPolygon…` (`…FromMongoToGql` turns GeoJSON into the API format).

A ring of a polygon must be closed (the last point equals the first one), otherwise MongoDB rejects the document of an indexed field: `Loop is not closed, first vertex does not equal last vertex` ✅.

**Index**: `index: true` creates a `2dsphere` index 📖 and is required for the geo operators of `where` and for `near` (step 6); without it the field is only stored and returned.

### Step 4. Load the arrays

Nested objects go into the create input as they are. Geometries have to be converted from GeoJSON to the API format:

```ts
import { multiPolygonFromMongoToGql, pointFromMongoToGql } from 'graphql-fns';

await run(
  `mutation ($data: [CountryCreateInput!]!) { createManyCountries(data: $data) { id code } }`,
  {
    data: countries.map(({ capital, territory, ...rest }) => ({
      ...rest,
      capital: { ...capital, location: pointFromMongoToGql(capital.location) },
      territory: multiPolygonFromMongoToGql(territory),
    })),
  },
);

await run(
  `mutation ($data: [CityCreateInput!]!) { createManyCities(data: $data) { id name } }`,
  { data: cities.map(({ location, ...rest }) => ({ ...rest, location: pointFromMongoToGql(location) })) },
);
```

✅ Stored document:

```js
{
  code: 'UA',
  names: [{ _id: ObjectId('…'), lang: 'uk', text: 'Україна' }, …],
  capital: { _id: ObjectId('…'), name: 'Kyiv', population: 2950000,
             location: { type: 'Point', coordinates: [30.52, 50.45] } },
  territory: { type: 'MultiPolygon', coordinates: [[[[22, 44], [40, 44], [40, 52], [22, 52], [22, 44]]]] },
}
```

**Directly through Mongoose** (part 1, step 6 B) the GeoJSON of the source is written as it is, no conversion needed; such documents are read through the API as usual ✅.

### Step 5. Read

```graphql
{
  Country(whereOne: { code: "UA" }) {
    names(slice: { begin: 0, end: 2 }) { lang text }
    namesCount
    namesThroughConnection(first: 1) { edges { node { text } } pageInfo { hasNextPage } }
    capital { name location { lng lat } }
    territory { polygons { externalRing { ring { lng lat } } } }
  }
}
```

✅ An embedded array gets one field per variant: `names(slice)` for `plain` (the default variant, used when `variants` is omitted), `namesThroughConnection(…)` for `connection`, `namesCount` for `count`. Arrays of scalar values (`languages`) always have `slice`.

### Step 6. Filter

**By nested fields** (the embedded field has `index: true`) ✅:

```graphql
{
  Countries(where: { names: { lang: "en", text: "Poland" } }) { code }
  Countries(where: { names: { text_re: [{ pattern: "^Ukr" }] } }) { code }
  Countries(where: { names: { _index: 0, lang: "uk" } }) { code }
}
```

> ⚠️ The conditions in `names: {…}` are **not** applied to one element (it is not `$elemMatch`): each may match a different element of the array. `{ lang: "en", text: "Ukraina" }` finds Ukraine, because it has an `en` element and (another) element with the text `Ukraina` ✅. `_index: n` makes the conditions apply to the element at position `n` ✅.

**By geometry** (the geospatial field has `index: true`) ✅:

| Field type | Operators of `where` |
|---|---|
| `Point` | `x_withinPolygon`, `x_withinMultiPolygon`, `x_withinSphere` (`{ center, radius }`), `x_aroundLineString`, `x_aroundMultiLineString` (a corridor: `{ coordinates / lineStrings, distance }`) |
| other types | `x_intersectsPoint`, `x_intersectsPolygon`, `x_intersectsMultiPolygon`, `x_intersectsCircleApproximatedByPolygon` (`{ center, radius, steps }`) |
| all | `x_exists` (scalar), `x_size` / `x_notsize` (arrays) |

**By distance**: lists (`Xs`, `XsThroughConnection`, `updateFiltered…`, `deleteFiltered…`) get a `near` argument if the entity has an indexed geospatial field. The result is sorted from the nearest ✅:

```graphql
{
  # cities within 100 km of the point
  Cities(where: { location_withinSphere: { center: { lng: 30.5, lat: 50.4 }, radius: 100000 } }) { name }

  # the countries whose territory contains the point
  Countries(where: { territory_intersectsPoint: { lng: 23.0, lat: 50.0 } }) { code }

  # cities not farther than 300 km, nearest first
  Cities(near: { geospatialField: location, coordinates: { lng: 23.0, lat: 50.0 }, maxDistance: 300000 }) { name }
}
```

Distances (`radius`, `distance`, `maxDistance`, `minDistance`) are in meters ✅.

### Step 7. Change

- `updateX(data: { capital: {…} })` **replaces the whole nested object**: `updateCountry(data: { capital: { population: 3000000 } })` leaves `name` and `location` empty ✅. Send the complete object.
- `updateX(data: { names: [...] })` replaces the whole array ✅. To add or insert elements, send the whole new array.
- Geometries are replaced as a whole, like any scalar value.

### Checklist

- [ ] a nested object that belongs to one owner → an embedded config (`type: 'embedded'`) + an `embeddedFields` field; a shared or separately queried object → a tangible entity and a link (part 2);
- [ ] `index: true` only on the nested fields you will filter by, and on every embedded field along the chain to them; `variants` for connection / count of arrays;
- [ ] filter conditions on an embedded array match any elements, use `_index` for a position;
- [ ] geometries: convert GeoJSON with `…FromMongoToGql` when loading through the API, close polygon rings;
- [ ] `index: true` on geospatial fields used in `where` or `near`; distances in meters;
- [ ] update of an embedded object or array sends the whole value.

---

[← Part 2](02-relations.md) · [Contents](README.md) · [Part 4 →](04-entity-level-options.md)
