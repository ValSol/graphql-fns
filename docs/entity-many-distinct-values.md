# `XManyDistinctValues`: distinct values of several targets in one query

> How the `entityManyDistinctValues` query (`XManyDistinctValues`) returns the distinct values of several fields of one selection in one MongoDB aggregation, and how `XDistinctValues` with relational filters shares its stages.
> Identifiers: `EM…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> The list of actions and their SDL is in [schema-and-resolvers-analysis.md](./schema-and-resolvers-analysis.md) §3 (Q9).

`XDistinctValues` returns the values of one field. A client that fills several filters of one list (e.g. continents, languages and currencies of the found countries) would need one `XDistinctValues` per field, each repeating the common conditions, lookups and full-text search. `XManyDistinctValues` takes the common conditions once and a list of targets, each with optional additional conditions, and returns one list of values per item.

```graphql
{
  CountryManyDistinctValues(
    where: { euMember: false }
    restrictedWhereAndTarget: [
      { target: continent }
      { target: code, where: { population_gt: 10000000 } }
    ]
  )
}
# → [<continents of not EU>, <codes of not EU with population > 10M>]
```

## 1. Schema

| ID | Fact |
|---|---|
| EM1 | ✅ `XManyDistinctValues(where: XWhereInput, restrictedWhereAndTarget: [XRestrictedWhereAndTargetInput!]!, search: String, token: String): [[String!]!]!` (`entityManyDistinctValuesQueryAttributes`). `search` exists only if X has a text field with `weight`, as in `XDistinctValues`. |
| EM2 | ✅ `input XRestrictedWhereAndTargetInput { target: XTextNamesEnum!, where: XRestrictedWhereInput }`: `target` is the enum of `XDistinctValuesOptionsInput`, `where` is optional and has no relational filters `x_` (as the items of `XCounts`, [entity-counts.md](./entity-counts.md) EC2). |
| EM3 | ✅ The action exists for the same entities as `XDistinctValues`: tangible, with indexed text (`index` / `unique`) or enum (`index`) fields. `XTextNamesEnum` has its own input creator (`createEntityTextNamesEnumType`) used by both inputs, so it is defined once in the schema. |
| EM4 | ✅ The general action name is `entityManyDistinctValues`; `actionName` gives `${name}ManyDistinctValues`, with a representation key `${name}ManyDistinctValues${key}`. |

## 2. Runtime

`createEntityManyDistinctValuesQueryResolver` (`src/resolvers/queries/createEntityManyDistinctValuesQueryResolver`) builds one aggregation:

```js
[
  { $match: { $text: { $search } } },    // only with "search"
  { $match: preMatch },                  // merged into the "$text" match with "search", see aggregate-pre-match.md
  ...lookups,                            // of the relational filters "x_" of "where"
  { $match: where + filter },            // only if not empty
  { $facet: {                            // composeFacet
      0: [{ $match: item0.where }, ...composeDistinctValuesStages(item0.target)],  // no "$match" without "where"
      1: [...],
  } },
]
```

`composeDistinctValuesStages(target)` (`src/resolvers/utils`):

```js
// "languages", "continent": an array or a scalar field ("$unwind" of a scalar keeps the document)
[{ $unwind: '$languages' }, { $group: { _id: '$languages' } }, { $sort: { _id: 1 } }]
// "names.text": an embedded path
[{ $project: { _id: 0, value: '$names.text' } }, { $unwind: '$value' }, { $unwind: '$value' },
 { $group: { _id: '$value' } }, { $sort: { _id: 1 } }]
```

| ID | Fact |
|---|---|
| EM5 | ✅ Every list is the same as `XDistinctValues` returns for `where` AND the item's `where`, with the same `search` and filter (tested against both for relational and plain `where`, with and without `search`). |
| EM6 | ✅ Empty values are dropped as in `XDistinctValues` (`.filter(Boolean)`): `null`, `''` **and `0`**. `$unwind` drops only missing / `null` / `[]`. |
| EM7 | ✅ Values are in BSON order (`$sort: { _id: 1 }`), the order `distinct` returns, so both queries give equal lists. |
| EM8 | ✅ `$unwind` of a dotted path does not go through an array of embedded documents (`$unwind: '$a.b'` with `a: [{ b }]` gives nothing), so a dotted target is projected first (`'$a.b'` gives the array of `b`, nested if `b` is an array too) and unwound once per path segment, which flattens it as `distinct` does. |
| EM9 | ✅ The authorization filter is merged only with `where`, so it restricts every list once; items are composed without it (`composeWhereInput(item.where, entityConfig, { forRestrictedWhere: true })`). A relational filter `x_` in an item throws `Relational field: "x_" forbidden in restricted where of "X" entity …` (as EC9). |
| EM10 | ✅ No access (`filter` is `null`) gives `[]` for every item, an empty `restrictedWhereAndTarget` gives `[]`, both without a query to MongoDB. |
| EM11 | 📖 The `$facet` output is one document, limited to 16 MB with all lists together. Enum targets are far below it; a text target with many long values (e.g. titles of a large collection) may exceed it. |
| EM12 | ✅ The raw resolver accepts any target `XDistinctValues` accepts, including fields outside `XTextNamesEnum` (int fields, ids, embedded paths); only the schema restricts `target` to the enum. Values are returned as stored (numbers stay numbers). |

## 3. `XDistinctValues` with relational filters

| ID | Fact |
|---|---|
| EM13 | ✅ With lookups (a relational filter `x_` in `where`), `XDistinctValues` runs one aggregation: the same head as above followed by `composeDistinctValuesStages(target)`: one round trip, no id list through Node. |
| EM14 | 📖 Without lookups `XDistinctValues` runs `distinct` with `where` and `$text`. |

## 4. Inventory, global ids and exports

| ID | Fact |
|---|---|
| EM15 | ✅ `entityManyDistinctValues` is a root `Query` action of `inventory`; `unwindInverntoryOptions` lists it for every tangible entity. There is no child query, so `addChildActions` does not map it 📖. |
| EM15a | ✅ An inventory that includes only `{ Query: { entityManyDistinctValues: true } }` gives a schema with `XManyDistinctValues` (for entities with targets), `node` and their inputs only: no mutations, subscriptions, other queries or `XDistinctValuesOptionsInput`; the query works through it with global ids in the items, relational `where` and `search` (`entityManyDistinctValuesThroughSchema.mtest.ts`). |
| EM16 | ✅ `resolverDecorator` and `customResolverDecorator` (`getTransformerAndConfig`) transform arguments of type `…RestrictedWhereAndTargetInput` by `transformWhereAndSearch`: `where` of every item from global ids, `target` as is ([resolver-decorators.md](./resolver-decorators.md) §3). |
| EM17 | ✅ `composeQueryResolver('X_ManyDistinctValues', generalConfig, serversideConfig)` returns the raw resolver (created with `inAnyCase`, so regardless of `inventory`): mongo ids in `where` and the items, `involvedFilters` in the 5th argument. |
| EM18 | 📖 `createEntityManyDistinctValuesQueryResolver` is exported from the package. |
