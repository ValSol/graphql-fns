## Part 8. Representations

A representation is another view of the same entities: its own set of fields and actions under its own names, over the **same collections**. Typical uses: a public catalog without internal fields, an editor that may change only some fields, a client-specific shape with extra calculated fields. The internals are in [representations.md](../representations.md). The examples use the entities of part 2 (`Currency`, `Country` with an extra text field `internalNote`, `City`, relational `Country.currency` and `City.country`) and were run on MongoDB with subscriptions excluded by `inventory` ✅.

### Step 1. Declare representations in the general config

```ts
import { composeAllEntityConfigs, composeRepresentations } from 'graphql-fns';
import type { GeneralConfig, RepresentationAttributes } from 'graphql-fns';

const allEntityConfigs = composeAllEntityConfigs(entityConfigs);

// a public read-only catalog
const ForCatalog: RepresentationAttributes = {
  representationKey: 'ForCatalog',
  allow: {
    Country: ['entity', 'entities', 'entitiesThroughConnection', 'childEntity', 'childEntities'],
    City: ['entities', 'childEntities'],
    Currency: ['childEntity'],
  },
  excludeFields: { Country: ['internalNote'] },
  addFields: { Country: { calculatedFields: [{ name: 'label', calculatedType: 'textFields' }] } },
};

// an editor: reads and updates countries, cannot change their codes
const ForEditor: RepresentationAttributes = {
  representationKey: 'ForEditor',
  allow: { Country: ['entity', 'updateEntity'] },
  includeFields: { Country: ['code', 'name', 'internalNote'] },
  freezedFields: { Country: ['code'] },
};

const generalConfig: GeneralConfig = {
  allEntityConfigs,
  representations: composeRepresentations([ForCatalog, ForEditor], allEntityConfigs),
  inventory: { name: 'main', exclude: { Subscription: true } },
};
```

| Property | Meaning |
|---|---|
| `representationKey` | the suffix of all names of the representation |
| `allow` | per entity, the actions of the representation, by general names (`entity`, `entities`, `childEntities`, `updateEntity`, …, part 5). An entity absent from `allow` is not in the representation |
| `excludeFields` / `includeFields` | drop the listed fields / keep only the listed ones |
| `addFields` | extra fields as in a simplified entity config (scalar, enum, embedded, calculated, …; relational, duplex and filter fields are forbidden) |
| `freezedFields` / `unfreezedFields` | set / remove `freeze` for the listed fields (frozen fields are not in `…UpdateInput`) |
| `interfaces` | GraphQL interfaces of the representation types (part 4) |
| `involvedOutputRepresentationKeys` | per entity, another representation whose type the actions **return**: the arguments stay in this representation (see below) |

`composeRepresentations` checks the keys (unique, valid names) and the attributes 📖. The root API of part 1 stays as it is: representations only add types and actions.

**`involvedOutputRepresentationKeys`** separates what an action takes from what it returns. With

```ts
const ForEditor: RepresentationAttributes = {
  representationKey: 'ForEditor',
  allow: { Country: ['entity', 'createEntity', 'updateEntity'] },
  includeFields: { Country: ['code', 'internalNote'] },
  involvedOutputRepresentationKeys: { Country: { outputEntity: 'ForCatalog' } },
};
```

the editor sends data in its own shape but gets the result as the catalog sees it ✅:

```graphql
CountryForEditor(whereOne: CountryForEditorWhereOneInput!, token: String): CountryForCatalog
createCountryForEditor(data: CountryForEditorCreateInput!, token: String): CountryForCatalog!
updateCountryForEditor(whereOne: CountryForEditorWhereOneInput!, data: CountryForEditorUpdateInput!, token: String): CountryForCatalog!
```

- It applies to all actions of the representation for that entity; `ForEditor` then has no `CountryForEditor` type of its own in the results.
- `outputEntity` must be the key of **another** representation that includes the entity; the own key or `''` (the root API) is rejected by `composeRepresentations`: `involvedOutputRepresentationKeys attribute of representation "ForEditor" has an incorrect keys: "{"outputEntity":""}"!` ✅
- For authorization the action then involves two entities: the input one (`Country` through `ForEditor`) and the output one (`CountryForCatalog`), each checked with its own filters 📖.

### Step 2. What is generated

Names are the root names with the key ✅:

```graphql
type CountryForCatalog implements Node {
  id: ID!  createdAt: DateTime!  updatedAt: DateTime!
  code: String!  name: String  population: Int      # no internalNote
  currency: CurrencyForCatalog
  cities(where: CityForCatalogWhereInput, sort: CityForCatalogSortInput, pagination: PaginationInput): [CityForCatalog!]!
  label: String                                     # from addFields
}
type CityForCatalog implements Node { … country: CountryForCatalog }
type CurrencyForCatalog implements Node { … countries(…): [CountryForCatalog!]! }
type CountryForEditor implements Node { id … code: String! name: String internalNote: String }

type Query {
  CountryForCatalog(whereOne: CountryForCatalogWhereOneInput!, token: String): CountryForCatalog
  CountriesForCatalog(where: …, sort: …, pagination: …, token: String): [CountryForCatalog!]!
  CountriesThroughConnectionForCatalog(…): CountryForCatalogConnection!
  CitiesForCatalog(…): [CityForCatalog!]!
  CountryForEditor(whereOne: CountryForEditorWhereOneInput!, token: String): CountryForEditor
  …
}
type Mutation {
  updateCountryForEditor(whereOne: CountryForEditorWhereOneInput!, data: CountryForEditorUpdateInput!, token: String): CountryForEditor!
  …
}
input CountryForEditorUpdateInput { name: String internalNote: String }   # no frozen "code"
```

- Action names: the generated names with the key appended (`CountriesForCatalog`, `updateCountryForEditor`); in `inventory` their general names are `entitiesForCatalog`, `updateEntityForEditor`, … (part 5). The position of the key in type names can be changed by `representationNameSlicePosition` of the entity config 📖.
- Link fields of a representation type point to the representation types of the related entities (`currency: CurrencyForCatalog`), so a client stays inside its representation.
- Hidden fields are really absent: `CountryForCatalog { internalNote }` fails with `Cannot query field "internalNote" on type "CountryForCatalog"` ✅; frozen fields are not in the update input ✅.

### Step 3. Links are switched on and off from both sides

By design, a link of a representation is switched on or off as a whole, on both sides: it exists only as a pair of fields, and each field of the pair is served by a child action of its target (part 5, step 3). The composition checks this and throws on a half-open link ✅:

- `Currency.countries` (the opposite of `Country.currency`) requires `childEntities` (or another array child action) in `allow.Country`:
  `Have to set "childEntities" or "childEntitiesThroughConnection" or "childEntityCount" or "childEntityDistinctValues" as "allow" for representationKey: "ForCatalog" & entity: "Country" to connect through "countries" field!`
- Removing only one side (`excludeFields: { Currency: ['countries'] }`) is not allowed:
  `Expected a relationalField with name "countries" in representation config "CurrencyForCatalog" to connect through "currency" field!`

So for every link of the represented entities either allow the child actions of both sides, or drop both fields (`excludeFields` / `includeFields` on both entities, as `ForEditor` does with `includeFields`). The variants of array links (`citiesThroughConnection`, `citiesCount`, …) exist only with their child actions in `allow` ✅.

### Step 4. Same data, own ids

- All representations and the root API read and write the same collections: `updateCountryForEditor(… data: { internalNote: "changed" })` is seen by `Country { internalNote }` ✅.
- Global ids carry the key: the same country is `…:Country:` in the root API and `…:Country:ForCatalog` in the catalog ✅. `node(id)` returns the type of the id's representation (`CountryForCatalog`) ✅, and a representation id is accepted by the root queries too (`Country(whereOne: { id: <catalog id> })`) ✅.

### Step 5. Server side

- A resolver of a representation action is generated from the standard resolver of the root entity **only if it is not set explicitly** in the server-side config: `createCustomResolver` first looks for a resolver creator under the general name of the action in `serversideConfig.Query` / `Mutation` (e.g. `serversideConfig.Query.entitiesForCatalog`, written as for custom actions, part 7) and uses it; only when there is none does it generate one 📖. So nothing is required in the server-side config, and any representation action can be replaced by your own resolver. A typical reason to replace a mutation is to do several standard mutations in one transaction by `workOutMutations` ([part 11, step 3](11-transactions.md#step-3-several-standard-mutations-in-one-transaction-workoutmutations), example B ✅).
- Callbacks of calculated fields added by `addFields` are keyed by the **representation** name ✅; inherited calculated fields keep the callbacks of the root name (part 6):

  ```ts
  calculatedFields: {
    CountryForCatalog: {
      label: { fieldsToUseNames: ['code', 'name'], func: (args, data) => `${data.name} (${data.code})` },
    },
  },
  ```

  ✅ `CountriesForCatalog { label }` → `"Ukraine (UA)"`; `fieldsToUseNames` of inherited fields may use root fields hidden by the representation ([representations.md](../representations.md) RP11).
- Different users usually get different representations: the root API for admins, `…ForCatalog` for everybody. That is done by `inventoryByRoles` (part 10) with the general names of the representation actions.

### Checklist

- [ ] a view with other fields or actions over the same data → a representation, not a new entity;
- [ ] `allow` lists the actions by general names, including the child actions of both sides of every kept link;
- [ ] a link is kept or dropped as a pair;
- [ ] calculated fields of `addFields` get callbacks under the representation name (`CountryForCatalog`);
- [ ] access of users to representations is set by `inventoryByRoles` (part 10).

---

[← Part 7](07-custom-actions.md) · [Contents](README.md) · [Part 9 →](09-subscriptions.md)
