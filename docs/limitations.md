# Limitations: what graphql-fns does not do with MongoDB and GraphQL

> graphql-fns generates a GraphQL schema and resolvers from entity configs. To keep that possible, it uses a deliberately narrow part of MongoDB and of GraphQL. This document lists those simplifications in one place: what the library does not do, what follows from it, and what to do instead.
> Identifiers: `LM…`. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only. Where a fact is already described elsewhere, the row links to it.

The three main rules from which most of the limits follow:

1. **The API offers only what an index can serve.** Filters, sorting and distinct values of the generated schema exist only for fields with `index: true`; a field that is only `unique` gets a part of the operators and no sorting (LM20, LM31). A field without an index can be stored and read, but the client cannot select or order by it (LM20, LM31, LM36).
2. **A document is flat for links.** Links between entities (relational, duplex, filter fields) live only at the root of a tangible document, never inside embedded objects (LM6).
3. **Writes replace values.** A mutation sets a field to a new value: there are no MongoDB update operators (`$inc`, `$push`, …), no upserts and no version checks (LM40–LM42).

These are limits of the **generated** actions. Calculated fields, representation actions with their own resolvers, custom actions and manually created fields run your own code with the MongoDB connection of the request, and get past many of them; [section 9](#9-getting-past-the-limits) maps the limits to these mechanisms.

## 1. Data model

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM1 | ✅ One MongoDB collection per tangible entity, named by the library: `<name in lower case>_things` (model `<Name>_Thing`); the counters of `counter: true` live in `counter_variables`. There is no option for a collection name, a database per entity, capped or time-series collections. | An existing collection with another name cannot be served as is: migrate it, or serve it by manually created fields ([infrastructure guide, part 5](infrastructure-guide/05-manually-created.md)). |
| LM2 | 📖 Three kinds of configs: `tangible` (a document of its collection), `embedded` (a subdocument, only inside a tangible or another embedded entity), `virtual` (exists only in the API, never stored). An embedded entity has an `id` but no `createdAt` / `updatedAt` and no root actions ([schema-and-resolvers-analysis.md](schema-and-resolvers-analysis.md) E1–E3). | A nested object that must be queried, linked or paginated on its own has to be a tangible entity. |
| LM3 | 📖 Stored field kinds: `textFields`, `intFields`, `floatFields`, `booleanFields`, `dateTimeFields`, `enumFields` (stored as strings), `geospatialFields`, `embeddedFields`, `relationalFields`, `duplexFields`, `filterFields` (a where object stored as a string). Calculated fields are never stored ([calculated-fields.md](calculated-fields.md) CF21). Not supported: `Decimal128`, 64-bit integers, binary data, free-form objects (`Mixed`, JSON), maps, `ObjectId` fields other than links, arrays of arrays. | Money: an `intFields` value in minor units, or a `floatFields`. Free-form data: a `textFields` with JSON of your own, or an embedded config with explicit fields. |
| LM4 | 📖 `intFields` are GraphQL `Int`: 32-bit signed. | Larger values (counters of bytes, timestamps in ms) do not fit: use `floatFields` or `dateTimeFields`. |
| LM5 | 📖 Geospatial values are GeoJSON of five types: `Point`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`; no `MultiPoint`, no `GeometryCollection`, no legacy coordinate pairs. Coordinates are WGS84 (`2dsphere`). | A set of points: an array geospatial field of `Point`s (`array: true`). |
| LM6 | ✅ Links live only at the root of a tangible document: an embedded config cannot have `relationalFields`, `duplexFields`, `filterFields` or `calculatedFields`. TypeScript reports such a config at compile time; a config TypeScript does not check (read from JSON, or cast with `as`) is rejected at startup: `composeAllEntityConfigs` throws `Embedded entity "Address" must not have "relationalFields"!`. | "An address with its owner" inside a house: make the address a tangible entity linked to the house, or put the link on the house. |
| LM7 | 📖 A relational / duplex field points to exactly one tangible entity (`configName`); there are no polymorphic links (to "a country or a city") and no links to embedded or virtual entities ([schema-and-resolvers-analysis.md](schema-and-resolvers-analysis.md) DD9). | One field per target entity, or an intermediate entity. |
| LM8 | ✅ A relational link is stored on one side only (an `ObjectId` or an array of them, always indexed); its opposite side is a query. A duplex link is stored on both sides and every mutation keeps them in sync ([configs-guide/02](configs-guide/02-relations.md)). | Relational is cheaper to write, duplex is needed for `…WithChildren` and ownership. |
| LM9 | ✅ Referential integrity is kept by the mutations of the library, not by MongoDB: deleting an entity cleans the links to it, a `required` duplex reference blocks the deletion ([configs-guide/02, step 7](configs-guide/02-relations.md#step-7-change-and-delete)). | Writes of your own server code (resolvers, scripts, migrations) go through `workOutMutations`: it runs the standard mutations (`deleteEntity`, `updateEntity`, …) with their cleanup of links and their checks ✅. It needs only the two configs and `{ mongooseConn }` as the context ✅, bypasses authorization ([configs-guide/11, step 3](configs-guide/11-transactions.md#step-3-several-standard-mutations-in-one-transaction-workoutmutations)) and runs an action excluded by `inventory` only with `inAnyCase: true` 📖. Writes made directly to the collections (`deleteOne` of the driver, other services) bypass the integrity and can leave dangling ids. |
| LM10 | 📖 `_id` is always an `ObjectId` generated by MongoDB; there are no custom or natural ids. The API exposes global ids: base64 of `<_id>:<Entity>:<representation>`; `createdAt` / `updatedAt` are always kept. | Natural keys go to a `unique` field (`code`) and are queried by `whereOne` / `whereCompoundOne`. |
| LM11 | 📖 Validation on write is limited to what the config can express: `required`, `unique`, `uniqueCompoundIndexes`, the values of an enum, the type of the value. There are no lengths, ranges, patterns or cross-field rules. | Check such rules in a manually created mutation or a custom action ([configs-guide/07](configs-guide/07-custom-actions.md)), or in the client. |
| LM12 | 📖 Scalar fields are nullable in GraphQL unless `required`; `nullable` applies only to arrays: `[T!]!` by default, `[T!]` with `nullable: true`. An array never contains `null`. | — |

## 2. Indexes

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM13 | 📖 The config creates only these indexes: an ascending single-field index for every `index: true` (and for every relational field, always), a unique index for `unique` (`sparse` when the field is not `required`), unique compound indexes from `uniqueCompoundIndexes`, one text index, `2dsphere` indexes of geospatial fields, and `createdAt` / `updatedAt`. No non-unique compound indexes, no descending, hashed, wildcard, partial or TTL indexes, no collation (case-insensitive) indexes. | A query that needs a compound index (`where: { country, population_gt }` sorted by `population`) uses one of the single-field indexes. Extra indexes created by hand are dropped by the sync of the library (LM15). |
| LM14 | 📖 `unique` is not available for boolean, enum, geospatial and embedded fields, and not inside embedded configs (`Must not have an "unique" field in an "embedded" document!`). A unique optional field allows many documents without the field (sparse index); a unique compound index treats an absent field as `null` ([where-compound-one.md](where-compound-one.md) WC3). | — |
| LM15 | ✅ The indexes of the collections of the config are brought in line with it: missing ones are created, the ones not in the config are dropped ([mongoose-models.md](mongoose-models.md) MM12, MM13). | Indexes cannot be added outside the config; collections not in the config are never touched. |
| LM16 | 📖 A field of an embedded entity is indexed (and filterable) only if every embedded field on the path to it has `index: true` ([configs-guide/03](configs-guide/03-nested-objects-and-geodata.md)). | — |
| LM17 | 📖 At most one text index: it is built from every text field with a `weight`, nested embedded paths included, named `TextIndex`, without `default_language`, so MongoDB applies the English stemming and stop words. | Another language or several text indexes are not possible through the config. |
| LM18 | ✅ The `2dsphere` index of a `Point` field is on `<x>.coordinates`, of other geometries on `<x>` ([geospatial-index-paths.md](geospatial-index-paths.md) GI5). | — |
| LM19 | 📖 `createThingSchema` throws when an entity needs more than 64 indexes (the MongoDB limit). | — |

## 3. Filters (`where`)

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM20 | ✅ `XWhereInput` has operators only for fields with `index: true`; a field without an index is absent (`CityWhereInput` has no `note` for `{ name: 'note' }`). A `unique` field without `index` gets `_in`, `_nin`, `_ne`, the ranges and `_re`, but no plain equality: select one entity by it with `whereOne`. Boolean, enum, geospatial and embedded fields need `index`; calculated fields and filter fields are never in `where` (they are in `wherePayload` of subscriptions: [configs-guide/09](configs-guide/09-subscriptions.md)). | Add `index: true` to every field the client filters by. |
| LM21 | 📖 The operators: equality, `_ne`, `_in`, `_nin`, `_gt`, `_gte`, `_lt`, `_lte` (text, numbers, dates), `_re` (text and enums; `{ pattern, flags }`), `_exists` (scalar fields), `_size` / `_notsize` (arrays), the geospatial operators (`_withinPolygon`, `_withinSphere`, `_aroundLineString`, … for points; `_intersects…` for other geometries), `AND` / `OR` / `NOR`. Missing: `$elemMatch`, `$all`, `$not` of a field, `$mod`, `$type`, `$expr` (comparing two fields), `id` equality (`id_in` only). | "Contains all of": `AND` of several equalities on the array field. |
| LM22 | 📖 On an array of scalars `field: value` means "contains the value"; `_in` means "contains one of". | — |
| LM23 | ✅ On an array of embedded objects the conditions on different subfields are independent, there is no `$elemMatch`: `slots: { room: "A", start_gt: 10 }` becomes `{ "slots.room": …, "slots.start": … }` and matches a document where one slot is in room A and **another** starts after 10. `_index` addresses one fixed position (`slots.0.room`). | Conditions that must hold for the same element need a tangible entity instead of the embedded array. |
| LM24 | ✅ `AND` / `OR` / `NOR` exist only at the root of `XWhereInput`, not inside an embedded input and not inside `x_` (`…WhereWithoutBooleanOperationsInput`). | Move the alternative to the root: `OR: [{ country_: { … } }, { country_: { … } }]`. |
| LM25 | ✅ Filters by a linked entity `x_` exist only for indexed links and only for indexed fields of the target ([configs-guide/02, step 6](configs-guide/02-relations.md#step-6-filter-by-the-links)). Each `x_` is a `$lookup` of an aggregation pipeline; chains (`country_: { currency_: { … } }`) add a `$lookup` per level. They are not allowed inside embedded fields ([aggregate-pre-match.md](aggregate-pre-match.md) PM7) and in restricted wheres ([entity-counts.md](entity-counts.md) EC9). | A frequent filter by a field of a linked entity costs a lookup per query; consider a denormalized field. |
| LM26 | ✅ A level of `x_` may combine its own fields with several nested filters (`country_: { name: "B", currency_: { … }, president_: { … } }`); its conditions are combined with AND, like the root, and there is no OR inside a level (LM24). | An alternative of linked conditions: `OR` at the root with a `country_` in each branch. |
| LM27 | ✅ The server-side filters (`filters`, `staticFilters`, restricted wheres of code) are composed by the same function but are not limited to indexed fields: `{ note: "x" }` on a field without an index is accepted. | Such a filter runs on every query of the role; without an index it scans the collection. |
| LM28 | 📖 Case-insensitive matching exists only through `_re` with the flag `i`; no collation. A regular expression that is not anchored at the start (`^…`) cannot use the index efficiently. | — |
| LM29 | 📖 `search` (MongoDB `$text`) exists only if a text field has a `weight`. It matches whole words after stemming, not substrings; the results are sorted by the text score; with `near` it is resolved first into the ids, which `near` then filters and (in queries) orders by distance, so the text-score order is lost ([aggregate-pre-match.md](aggregate-pre-match.md) PM5). | Substrings: `_re`. |
| LM30 | 📖 `near` takes one indexed geospatial field and always sorts by distance; it is not available in `XCount`, `XCounts`, `XExistences`, `XDistinctValues` ([schema-and-resolvers-analysis.md](schema-and-resolvers-analysis.md) DD3). | Selection by area without sorting: the geospatial operators of `where`. |

## 4. Sorting and pagination

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM31 | ✅ `sort: { sortBy: [...] }` takes `id`, `createdAt`, `updatedAt` and the **scalar** text, int, float, date, boolean and enum fields with `index: true`. Not by array fields, subfields of embedded objects, fields of linked entities, calculated fields, `counter`, or a field that is only `unique` (without `index`): for `{ code: unique }, { name: index }, { tags: array, index }` and `counter: true` the enum is `id_…`, `createdAt_…`, `updatedAt_…`, `name_…`. | Sort by a value of a linked entity: denormalize it into an indexed field. |
| LM32 | 📖 No collation: text is sorted by binary order (upper case before lower case, accented letters after `z`). | A normalized copy of the field (lower case) for sorting. |
| LM33 | 📖 The list query `Xs` adds no tie-breaker: documents with equal sort values come in an order MongoDB does not guarantee, so pages of `pagination: { skip }` may repeat or skip such documents. A tie-breaker is not added there because the single-field index of the sort key cannot serve a sort by two keys: MongoDB would sort the whole matching set in memory even for a small page. Connections (`XsThroughConnection`) add it: `id_ASC` ends their `sortBy` (unless it already has `id_…`) and is their sort when none is given; `near`, and `search` without `sort`, keep their own order. | For `Xs` with `skip` end `sortBy` with `id_ASC` when the sort values can be equal. |
| LM34 | ✅ The list query `Xs` has an optional `pagination: { skip, first }` and **no default size**: without it the whole matching collection is returned. Child arrays have `slice`. The only maximum is `staticLimits: { X: n }` of the server-side config: it caps every list of the entity for everybody, whatever `pagination` asks for ✅ ([configs-guide/10, step 6](configs-guide/10-authorization.md#step-6-constant-restrictions-staticfilters-and-staticlimits)), and the `first` / `last` of its connections 📖. | Set `staticLimits` for large collections, or limit the size in the GraphQL server (a validation rule or a plugin). |
| LM35 | ✅ Connections (`XsThroughConnection`) take `first` / `after` / `last` / `before`. A cursor is base64 of `<_id>:<shift>`, and the page after it is read with `skip: shift` 📖, so the cost of a page grows with its depth. Only when the entity at that position is no longer the cursor entity (the data before it changed) is the position computed again, by `$setWindowFields` over the whole filtered and sorted set; sorts by several keys and by `id_ASC` / `id_DESC` continue right after the cursor entity. A cursor whose entity was deleted or no longer matches `where` gives the **first page** again, without an error. | Deep pagination of large sets: filter by a range of an indexed field instead (`createdAt_gt` of the last item, [infrastructure guide, part 7, step 6](infrastructure-guide/07-subscriptions-production.md#step-6-breaks-of-the-stream-reading-what-was-missed)). A client that must not show items twice after deletions skips the ids it has already shown. |

## 5. Aggregation

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM36 | 📖 There is no general aggregation API (`$group`, sums, averages, histograms). The generated queries count and list values: `XCount`, `XCounts`, `XExistences` ([entity-counts.md](entity-counts.md), [entity-existences.md](entity-existences.md)), `XDistinctValues` and `XManyDistinctValues` — the last two only for **indexed** text and enum fields, "to not execute `distinct` on the whole collection" (comment of `createEntityTextNamesEnumType`; [entity-many-distinct-values.md](entity-many-distinct-values.md)). | Statistics: a manually created query ([infrastructure guide, part 5](infrastructure-guide/05-manually-created.md), `Stats`) or a calculated field. |
| LM37 | 📖 Joined data comes only through the child fields of links; there are no ad hoc joins and no computed columns other than calculated fields ([configs-guide/06](configs-guide/06-calculated-fields.md)). | — |

## 6. Writing

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM38 | 📖 The mutations have fixed shapes: `createX`, `updateX`, `deleteX`, their `…Many…` and `…Filtered…` variants, `copy…`, `…WithChildren` ([schema-and-resolvers-analysis.md](schema-and-resolvers-analysis.md) §4). There is no root upsert; the only "get or create" is a child field (`…GetOrCreate`, open question ?1 there). | Upsert: a query and then `create` / `update`, or `workOutMutations` in a transaction. |
| LM39 | ✅ An update replaces the value of a field; an array (of scalars, embedded objects or links) is replaced as a whole: `connect: [...]` sets the full list ([configs-guide/02, step 7](configs-guide/02-relations.md#step-7-change-and-delete); DD7). | Adding an item = sending the whole new list. |
| LM40 | 📖 No MongoDB update operators: no `$inc`, `$push`, `$pull`, `$addToSet`, `$min`, `$max`. A change that depends on the current value is a read and a write. | Two concurrent "+1000" lose one of them; do it in a manually created mutation with `transactions: true` (a write conflict is retried) or with your own `updateOne` with `$inc`. |
| LM41 | 📖 The generated mutations check no version of a document: the last write wins. | `workOutMutations` with `lockedData` in a resolver of your own (9.2). |
| LM42 | ✅ A mutation is several writes (one `bulkWrite` per collection). It is atomic only with `serversideConfig.transactions: true`, which needs a replica set; queries never run in a transaction ([configs-guide/11](configs-guide/11-transactions.md)). | — |
| LM43 | ✅ Only `createX`, `updateX`, `deleteX` publish subscription events; bulk mutations and writes made outside the library publish nothing; MongoDB change streams are not used ([configs-guide/09, step 2](configs-guide/09-subscriptions.md#step-2-which-mutations-publish); DD1). | Clients that must see bulk changes refetch. |

## 7. The GraphQL schema

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM44 | 📖 The whole schema is generated from the configs; names follow fixed rules: entity names singular and without `_`, plural forms by `pluralize`, generated suffixes and operator suffixes reserved ([configs-guide/01](configs-guide/01-plain-arrays.md)). | Other names: representations ([configs-guide/08](configs-guide/08-representations.md)) or manually created fields. |
| LM45 | 📖 Type system: object types, the `Node` interface, interfaces declared in the configs (the fields must have exactly the same types in every implementation, [configs-guide/04](configs-guide/04-entity-level-options.md)), enums, inputs. No unions; the only custom scalar is `DateTime` (graphql-scalars); no `Upload`, no JSON scalar. | — |
| LM46 | 📖 The generated SDL has no descriptions, no `@deprecated` and no custom directives. | Documentation of the API lives outside the schema; a field is removed by `inventory` / representations, not deprecated. |
| LM47 | ✅ Custom subscriptions are not supported (`custom.Subscription` throws); only `createdX`, `updatedX`, `deletedX` and their representations exist ([schema-and-resolvers-analysis.md](schema-and-resolvers-analysis.md) DD6). | A subscription of your own is a manually created field with its own `pubsub` channel. |
| LM48 | ✅ Denied access is not an error: `null`, `[]`, `0` or no events; the client cannot tell "not allowed" from "not found" ([schema-and-resolvers-analysis.md](schema-and-resolvers-analysis.md) A10). | — |

## 8. Execution

| ID | Limitation | Consequence / what to do |
|---|---|---|
| LM49 | ✅ **No batching of child fields (no DataLoader)**: a link field is resolved by its own query for every parent. `Cities { name country { name } }` with 6 cities of 2 countries made 1 `city_things.find` and **6** `country_things.findOne`, one per city, the same country read several times. | An async calculated field instead of the link field: one query for the whole list (§9, measured there). |
| LM50 | 📖 No limits of query depth or complexity in the library; page size: LM34. | Add them in the GraphQL server (validation rules or plugins of Yoga / Apollo). |
| LM51 | 📖 No caching of results; every query reads MongoDB (the async part of calculated fields runs once per root resolver call, [calculated-fields.md](calculated-fields.md) CF6). | Cache in the client (Relay store) or in front of the server. |

## 9. Getting past the limits

The sections above describe the generated actions. Four mechanisms of the library run code of your own next to them, with the MongoDB connection of the request (`context.mongooseConn`), so everything Mongoose and the MongoDB driver can do is available there:

| Mechanism | What it is | What the library still does | Guide |
|---|---|---|---|
| Calculated fields | a field of an entity computed by `asyncFunc` (once per root query, for all its entities) and `func` (per entity) | the field is part of the entity type: it is selected like any field, inherited by representations, carried by subscription events | [configs-guide/06](configs-guide/06-calculated-fields.md), [calculated-fields.md](calculated-fields.md) |
| Representation actions | the actions of a representation; any of them can get its own resolver instead of the generated one | the signature, `inventory`, authorization, conversion of ids | [configs-guide/08, step 5](configs-guide/08-representations.md#step-5-server-side), [configs-guide/11, example B](configs-guide/11-transactions.md) |
| Custom actions | signatures of your own, generated for every entity, with resolvers of your own | `inventory`, authorization (the filters of the user in the 5th argument), conversion of ids, child fields of the returned entities | [configs-guide/07](configs-guide/07-custom-actions.md) |
| Manually created fields | SDL and resolvers of your own, merged with the generated schema | nothing: authorization and ids are the job of the resolver | [infrastructure guide, part 5](infrastructure-guide/05-manually-created.md) |

Inside such resolvers the standard resolvers remain the building blocks (`composeQueryResolver`, `create…MutationResolver`, `workOutMutations`), so an operation can combine a MongoDB call of your own with the authorization and the writes of the library.

### 9.1. The N+1 of link fields: calculated fields

The same data as `Cities { name country { name } }` (LM49), from an async calculated field of `City` whose `asyncFunc` reads the countries of all cities at once:

```ts
// generalConfig: City
calculatedFields: [{ name: 'countryName', calculatedType: 'textFields', async: true }],

// serversideConfig.calculatedFields.City
countryName: {
  fieldsToUseNames: ['country'],
  asyncFunc: async (args, resolverCreatorArg, { context }, entityOrEntities) => {
    const cities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];

    // one query for the countries of all cities
    const countries = await context.mongooseConn.connection.db
      .collection('country_things')
      .find({ _id: { $in: cities.map(({ country }) => country) } }, { projection: { name: 1 } })
      .toArray();

    return new Map(countries.map(({ _id, name }) => [String(_id), name]));
  },
  func: (args, data, resolverArg, names) => names.get(String(data.country)) ?? null,
},
```

Measured on 6 cities of 2 countries ✅:

| Query | Reads of MongoDB |
|---|---|
| `Cities { name country { name } }` | 1 `city_things.find` + **6** `country_things.findOne` |
| `Cities { name countryName }` | 1 `city_things.find` + 1 call of `asyncFunc` with all 6 cities (one `find` of the countries) |
| `Countries { name cities { name countryName } }` | 1 `country_things.find` + 1 `city_things.find` **per country** (the child list is a link field) + 1 call of `asyncFunc` per child list (3 and 3 cities) |

- `asyncFunc` batches the entities of one list. A child list selected under each parent is still a query per parent; put the calculated field on the **parent** instead (`Country.largestCity` of [configs-guide/06, step 3](configs-guide/06-calculated-fields.md#step-3-async-fields-one-call-for-the-whole-list): one call for all countries ✅).
- A calculated field returns a value: a scalar, an enum, an embedded or a virtual object (`calculatedType: 'virtualFields'` with the fields you need), not an entity with its own child fields and actions. It cannot be filtered or sorted by in the generated `where` / `sort` (LM20, LM31): it is computed after the query.
- Per-entity aggregates are the same pattern: the number of cities of a country, its largest city, the sum of a field of linked entities, all in one `asyncFunc` call (LM36, LM37).

### 9.2. Which limit, which way

| Limits | Way past them |
|---|---|
| LM49 (N+1) | an async calculated field, on the level whose list is selected (9.1) ✅ |
| LM36, LM37 (aggregation) | per entity: a calculated field ✅; over a collection: a manually created query (`Stats` of the [infrastructure guide, part 5](infrastructure-guide/05-manually-created.md)) or a custom query (`CountrySummary` of [configs-guide/07](configs-guide/07-custom-actions.md)) ✅ |
| LM20, LM21, LM23, LM25, LM31 (filters and sorts the schema cannot express: a field without an index, `$elemMatch`, a sort by a field of a linked entity) | a custom query whose resolver runs its own query or pipeline and returns the raw documents; the library converts the ids and resolves the child fields of the result ([configs-guide/07, step 4](configs-guide/07-custom-actions.md#step-4-resolvers-in-the-server-side-config) ✅). Apply the filter of the user (`resolverOptions.involvedFilters`) to your query yourself 📖 |
| LM9 (integrity of writes outside the API) | `workOutMutations` in a resolver or a script: the standard mutations, with the cleanup of links, without the GraphQL layer ✅ |
| LM11 (validation) | a custom mutation, or an own resolver of a representation mutation, checks the data and then calls the standard resolver: `importCountries` with an unknown currency fails and writes nothing ([configs-guide/07](configs-guide/07-custom-actions.md)) ✅ |
| LM38, LM40 (upsert, `$inc`, `$push`) | the same kind of resolver with its own `updateOne` / `findOneAndUpdate` 📖; several standard writes in one transaction by `workOutMutations` ([configs-guide/11, example B](configs-guide/11-transactions.md)) ✅ |
| LM41 (version checks) | `workOutMutations` with `lockedData`: the chain fails if the data read earlier has changed ([configs-guide/11, step 6](configs-guide/11-transactions.md#step-6-optimistic-locking-lockeddata)) 📖 |
| LM43 (events of your own writes) | a standard resolver called with `subscriptionEntityNames` publishes like the generated mutation ([infrastructure guide, part 6, step 8](infrastructure-guide/06-subscriptions-local.md#step-8-a-manually-created-mutation-publishes-only-if-told-to)) ✅; `workOutMutations` with `returnReport` 📖 |
| LM44 (names and shapes per client) | representations: their own names, fields, frozen fields and added calculated fields ([configs-guide/08](configs-guide/08-representations.md)) ✅ |
| LM45, LM46, LM47 (unions, a JSON scalar, descriptions, `@deprecated`, subscriptions of your own) | manually created type definitions are ordinary SDL merged with the generated one 📖 |
| LM1, LM3, LM13 (an existing collection, BSON types the configs lack, indexes of other kinds) | a Mongoose model of your own on a collection outside the config, served by manually created fields; the index sync of the library never touches collections outside the config ([mongoose-models.md](mongoose-models.md) MM13 ✅) |

What stays as it is:

- the indexes of the collections of the config are exactly those of the config: an index added by hand is dropped by the sync (LM15) ✅;
- the generated `where`, `sort` and child fields keep their limits; the ways above add operations next to them;
- a resolver that reads MongoDB directly sees all documents: the roles and filters of the config apply only through the standard resolvers or the `involvedFilters` you merge in yourself ([configs-guide/10, step 8](configs-guide/10-authorization.md#step-8-what-a-client-sees-on-denial)).

## Checklist for a new entity

- [ ] every field the client filters, sorts or lists distinct values by has `index: true` (and every embedded field on the path to it);
- [ ] links are at the root of a tangible entity; a nested object that needs links, its own queries or per-element conditions is a tangible entity;
- [ ] `sortBy` of `Xs` with `skip` ends with `id_ASC` when the sort values can be equal (LM33);
- [ ] data of linked entities shown in long lists comes from an async calculated field, not from a link field (LM49);
- [ ] large collections have `staticLimits`, or the server limits query size (LM34, LM50);
- [ ] counters and other read-modify-write changes are done in a transaction or with your own atomic update (LM40).
