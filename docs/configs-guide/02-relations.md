## Part 2. Relations between entities

Part 2 continues part 1: the arrays now refer to each other. All examples below were run with `inventory: { name: 'main', exclude: { Subscription: true } }` and `({ mongooseConn })` as the context.

### Starting point

In source data references are usually natural keys, not ids:

```ts
const currencies = [{ code: 'UAH' }, { code: 'PLN' }, { code: 'EUR' }];

const countries = [
  { code: 'UA', name: 'Ukraine', euMember: false, currencyCode: 'UAH', neighbourCodes: ['PL'] },
  { code: 'PL', name: 'Poland', euMember: true, currencyCode: 'PLN', neighbourCodes: ['UA'] },
];

const cities = [
  { name: 'Kyiv', population: 2950000, countryCode: 'UA' },
  { name: 'Lviv', population: 720000, countryCode: 'UA' },
  { name: 'Warsaw', population: 1860000, countryCode: 'PL' },
];

// a saved selection: "all EU members", whatever countries are in the collection
const countryGroups = [{ name: 'EU', countries: { euMember: true } }];
```

`currencyCode`, `neighbourCodes`, `countryCode` are not stored as they are: they become links to entities (step 4).

### Step 1. Choose the kind of link

| Kind | Declared | Stored in MongoDB | The other side | Use when |
|---|---|---|---|---|
| `relationalFields` | on the referencing entity only | ids on the referencing side | an array field with the name `oppositeName` is **added automatically** to the target; it is read-only and not stored, it is computed by a query | "many X refer to Y" (`Country.currency`), "X has a list of Y" (`Country.neighbours`), including links to the same entity |
| `duplexFields` | on **both** entities, each pointing to the other | ids on both sides, kept in sync by every mutation | a regular duplex field, can be changed from either side | only when you need `…WithChildren` or `copy…` mutations (see below), e.g. a country and its cities |
| `filterFields` | on the entity that holds the filter | the filter as a JSON string, not ids | none | linked (child) entities selected not by a list of their ids, as with `relationalFields`, but by any selector over the target collection; the result changes as the collection changes or the value of the filter field changes |

Relational and duplex fields can point only to tangible entities; this is checked by `composeAllEntityConfigs` 📖.

**Relational or duplex?** By default use `relationalFields`. `duplexFields` are more resource-intensive: every mutation that changes a link writes both sides and keeps them in sync. They are absolutely necessary only for two groups of mutations, which are generated only if there is a duplex link:

- `…WithChildren` (`deleteXWithChildren`, `deleteManyXsWithChildren`, `deleteFilteredXsWithChildren…`, `copyXWithChildren`, `copyManyXsWithChildren`): they also need to know who is the parent, i.e. `parent: true` on one half (with a scalar opposite half);
- `copy…` (`copyX`, `copyManyXs`): they copy the values of same-named fields between entities linked by a duplex field.

If you need neither, a relational link gives the same reading and filtering (steps 5–6) at a lower cost.

**Relational or filter?** A relational field selects linked entities by the list of their ids stored in it. A filter field selects them by any selector over the target collection (`{ euMember: true }`, `{ population_gt: 1000000 }`, …), so nothing has to be updated when matching entities are added or removed. The selector itself can change dynamically too: it is a regular field value, it can take any `CountryWhereInput` and so select anything in the target collection, e.g. `updateCountryGroup(whereOne: { name: "EU" }, data: { countries: { euMember: true, population_gt: 10000000 } })` (the field is in `CountryGroupCreateInput` / `CountryGroupUpdateInput` as `CountryWhereInput` ✅). In the API the selector is an object; it is stored in MongoDB as a JSON string (step 3) and with `variants: ['stringified']` is returned as that string by `countriesStringified` ✅. Naturally, not every user should have the right to change it: restrict `update…` of such entities by the authorization of part 10.

### Step 2. Declare the links in `graphql-fns.general.config.ts`

```ts
const entityConfigs: SimplifiedEntityConfig[] = [
  {
    name: 'Currency',
    textFields: [{ name: 'code', unique: true, required: true }, { name: 'name' }],
    // "countries" is added here automatically as the opposite of Country.currency
  },
  {
    name: 'Country',
    textFields: [{ name: 'code', unique: true, required: true }, { name: 'name', index: true }],
    booleanFields: [{ name: 'euMember', index: true }],
    relationalFields: [
      { name: 'currency', configName: 'Currency', oppositeName: 'countries', index: true },
      { name: 'neighbours', configName: 'Country', oppositeName: 'neighbourOfCountries', array: true, index: true },
    ],
    duplexFields: [
      { name: 'cities', configName: 'City', oppositeName: 'country', array: true, parent: true },
    ],
  },
  {
    name: 'City',
    textFields: [{ name: 'name', index: true }],
    intFields: [{ name: 'population', index: true }],
    duplexFields: [
      { name: 'country', configName: 'Country', oppositeName: 'cities', required: true, index: true },
    ],
  },
  {
    name: 'CountryGroup',
    textFields: [{ name: 'name', unique: true }],
    filterFields: [
      { name: 'countries', configName: 'Country', array: true, variants: ['plain', 'stringified'] },
    ],
  },
];
```

Rules (violations throw in `composeAllEntityConfigs`) 📖:

- **relational**: `configName` is the target entity; `oppositeName` is the name of the field added to the target (`Currency.countries`, `Country.neighbourOfCountries`). It must not clash with the target's own fields, and two relational fields must not add the same `oppositeName` to one entity. Do not declare the opposite field yourself.
- **duplex**: declare both halves. The `oppositeName` of each half is the `name` of the other, the `configName` of each half is the entity of the other. At most one half has `parent: true`.
- **filter**: `array: true` stores a list filter (`YWhereInput`) and the field returns a list; without `array` it stores a single-entity filter (`YWhereOneInput`) and returns one entity. `variants`: `plain` (default) gives the child fields, `stringified` adds `countriesStringified: String` with the stored JSON ✅.
- Options: `array`, `required` (the link must be set on create ✅), `index` (needed to filter by the link, step 6 ✅), `freeze`.

In the example `Country.cities ↔ City.country` is duplex because cities are owned by a country and deleted with it; `Country.currency` and `Country.neighbours` need no such mutations, so they are relational. `parent: true` on `Country.cities` and a scalar opposite field `City.country` make the cities **children** of a country: this adds `deleteCountryWithChildren`, `deleteManyCountriesWithChildren`, `deleteFilteredCountriesWithChildren…` and `copyCountryWithChildren` / `copyManyCountriesWithChildren` ✅. `copy…` mutations also appear for entities linked by a duplex field that have fields with the same names (here `City` and `Country` both have `name`) ✅; they are not needed for loading data.

### Step 3. What is stored

```js
// country_things
{ _id: ObjectId('…f595'), code: 'UA', euMember: false,
  currency: ObjectId('…f58f'),               // relational, scalar
  neighbours: [ObjectId('…f596')],           // relational, array
  cities: [ObjectId('…f5a3'), ObjectId('…f5a4')] }  // duplex, array

// city_things
{ _id: ObjectId('…f5a3'), name: 'Kyiv', country: ObjectId('…f595') }  // duplex, scalar

// currency_things — no "countries": the opposite of a relational field is not stored
{ _id: ObjectId('…f58f'), code: 'UAH' }

// countrygroup_things
{ _id: ObjectId('…f5a9'), name: 'EU', countries: '{"euMember":true}' }
```

✅ (the Mongo documents above are shortened.)

### Step 4. Load the arrays

**Order**: first the entities that are referenced, then the ones that refer to them. A link is set with `connect` and a **global id** returned by the API; a raw Mongo `_id` in `connect` fails with `Cast to ObjectId failed` ✅. So the loader builds "natural key → id" maps from the results of `createMany…`:

```ts
const run = async (source: string, variableValues?: Record<string, unknown>) => {
  const { data, errors } = await graphql({ schema, source, variableValues, contextValue: { mongooseConn } });
  if (errors) throw errors[0];
  return data as Record<string, any>;
};

const idsByCode = (items: { id: string; code: string }[]) =>
  Object.fromEntries(items.map(({ id, code }) => [code, id]));

// 1. currencies: refer to nothing
const { createManyCurrencies } = await run(
  `mutation ($data: [CurrencyCreateInput!]!) { createManyCurrencies(data: $data) { id code } }`,
  { data: currencies },
);
const currencyIds = idsByCode(createManyCurrencies);

// 2. countries: refer to currencies; neighbours refer to countries, so they wait for pass 4
const { createManyCountries } = await run(
  `mutation ($data: [CountryCreateInput!]!) { createManyCountries(data: $data) { id code } }`,
  {
    data: countries.map(({ currencyCode, neighbourCodes, ...rest }) => ({
      ...rest,
      currency: { connect: currencyIds[currencyCode] },
    })),
  },
);
const countryIds = idsByCode(createManyCountries);

// 3. cities: "country" is required, so countries must exist; Country.cities is filled automatically
await run(
  `mutation ($data: [CityCreateInput!]!) { createManyCities(data: $data) { id } }`,
  {
    data: cities.map(({ countryCode, ...rest }) => ({
      ...rest,
      country: { connect: countryIds[countryCode] },
    })),
  },
);

// 4. links to the same entity: a second pass over the created countries
await run(
  `mutation ($whereOne: [CountryWhereOneInput!]!, $data: [CountryUpdateInput!]!) {
    updateManyCountries(whereOne: $whereOne, data: $data) { id }
  }`,
  {
    whereOne: countries.map(({ code }) => ({ code })),
    data: countries.map(({ neighbourCodes }) => ({
      neighbours: { connect: neighbourCodes.map((code) => countryIds[code]) },
    })),
  },
);

// 5. filter fields hold a filter, not ids: load them as they are
await run(
  `mutation ($data: [CountryGroupCreateInput!]!) { createManyCountryGroups(data: $data) { id } }`,
  { data: countryGroups },
);
```

Every step of this scheme was checked ✅. Things to know:

- **Duplex links are synced automatically**: creating a city with `country: { connect }` also adds it to `Country.cities`; moving a city to another country removes it from the old one ✅. Set a duplex link from one side only.
- **Nested create** is an alternative for trees: one `createCountry` creates the country, its currency and its cities ✅:

  ```graphql
  mutation {
    createCountry(data: {
      code: "SK", name: "Slovakia", euMember: true,
      currency: { create: { code: "SKK" } },
      cities: { create: [{ name: "Bratislava" }, { name: "Kosice" }] }
    }) { id cities { name country { code } } }
  }
  ```

  In `cities.create` the `country` field is not required (type `CityCreateThru_country_FieldInput`): it is filled with the id of the country being created ✅.
- Scalar links take `{ connect: ID }` or `{ create: {...} }`; array links take `{ connect: [ID!], create: [...], createPositions: [Int!] }` ✅.
- A self-reference or a cycle (`neighbours`) cannot be set in the same `createMany…` that creates the targets: create first, then connect by `updateMany…` (pass 4 above).

**Directly through Mongoose** (part 1, step 6 B) works for relations too, but then you do the library's job yourself: generate the ids in advance (`new mongoose.Types.ObjectId()`), map the natural keys to them, and write **both** halves of every duplex link (`Country.cities` and `City.country`). The opposite fields of relational links are not stored, so nothing is written for them. Documents written consistently this way are read, filtered and deleted with children through the API as usual ✅.

### Step 5. Read through the links

Every link becomes a child field in the type ✅:

| Field | Type |
|---|---|
| scalar link (`currency`, `country`) | `currency: Currency` |
| array link, the opposite of a relational link, array filter field (`neighbours`, `neighbourOfCountries`, `countries`, `cities`) | `cities(where, sort, pagination): [City!]!` |
| — | `citiesThroughConnection(where, sort, after, before, first, last): CityConnection!` |
| — | `citiesCount(where): Int!` |
| — | `citiesDistinctValues(where, options): [String!]!` |
| filter field with `variants: ['stringified']` | `countriesStringified: String` |

```graphql
{
  Currency(whereOne: { code: "UAH" }) { countries { code } countriesCount }

  Country(whereOne: { code: "UA" }) {
    currency { code }
    neighbours { code }
    neighbourOfCountries { code }
    cities(sort: { sortBy: [population_DESC] }) { name }
    citiesCount
    citiesThroughConnection(first: 1) { edges { node { name } } }
  }

  CountryGroup(whereOne: { name: "EU" }) {
    countries(sort: { sortBy: [name_ASC] }) { code }
    countriesStringified
  }
}
```

✅ The countries of a filter field are found at query time: a country created later with `euMember: true` appears in the `EU` group without changing the group.

### Step 6. Filter by the links

A relational or duplex field with `index: true` adds to `…WhereInput` ✅:

| Operator | Meaning | Example |
|---|---|---|
| `x`, `x_in`, `x_nin`, `x_ne` | by the ids of the linked entities (for an array field `x` means "contains") | `Countries(where: { neighbours: "<id of PL>" })` |
| `x_exists` | the link is set (scalar fields) | `Countries(where: { currency_exists: false })` |
| `x_size`, `x_notsize` | the number of links (array fields) | `Countries(where: { neighbours_size: 0 })` |
| `x_` | by the fields of the linked entity (only its indexed fields, without `AND`/`OR`/`NOR`) | `Countries(where: { currency_: { code_in: ["PLN", "EUR"] } })` |

The opposite side of an indexed relational link gets only `x_`: `Currencies(where: { countries_: { code_in: ["UA"] } })`, `Countries(where: { neighbourOfCountries_: { … } })` ✅. Without `index: true` none of these operators exist: `Cities(where: { country_: … })` works only because `City.country` has `index: true` ✅.

### Step 7. Change and delete

- `updateX(data: { currency: { connect: "<id>" } })` replaces a scalar link; `{ connect: null }` removes it ✅.
- `updateCountryGroup(data: { countries: { … } })` replaces the stored selector of a filter field; `freeze: true` forbids that after create.
- `updateX(data: { neighbours: { connect: [...] } })` **replaces** the whole list (`connect: []` clears it) ✅. To add to a list use `pushIntoX(data: { neighbours: { connect: [...] } })` 📖.
- **Deleting a linked entity cleans the links** to it: after `deleteCurrency(UAH)` the `currency` of Ukraine is unset, after `deleteCountry(PL)` Poland is pulled from `neighbours` of Ukraine ✅.
- If the entity is referenced by a **`required`** duplex field, it cannot be deleted while such references exist: `deleteCountry(UA)` with cities fails with `Try unset required field: "country" for entity: "City"!` ✅ Either move/delete the cities first or use `deleteCountryWithChildren`, which deletes the country together with its cities ✅.

### Checklist

- [ ] one kind of link per reference: relational (one side stores), duplex (both sides store, `parent` for ownership), filter (a condition);
- [ ] relational: declared on the referencing side only, `oppositeName` unique in the target; duplex: both halves point to each other;
- [ ] `index: true` on links you will filter by, including filtering from the opposite side;
- [ ] load referenced arrays first, map natural keys to the global ids returned by `createMany…`, connect by those ids;
- [ ] self-references and cycles in a second pass with `updateMany…`;
- [ ] `required` duplex links: delete the owner with `…WithChildren` or detach the children first.

---

[← Part 1](01-plain-arrays.md) · [Contents](README.md) · [Part 3 →](03-nested-objects-and-geodata.md)
