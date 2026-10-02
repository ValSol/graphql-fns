## Part 5. Restricting the generated API

By default every tangible entity gets the whole set of queries, mutations, subscriptions and child fields (part 1, step 7; part 2, step 5). `generalConfig.inventory` limits this set for the whole API. The examples use the entities of part 2 (`Currency`, `Country`, `City` with relational links `Country.currency` and `City.country`); the resulting schemas were generated and checked ✅. The internals (matching, validation, the helper) are described in [inventory.md](../inventory.md).

### Step 1. The shape of `inventory`

```ts
inventory: {
  name: 'main',            // a label, used only in error messages
  include?: true | { Query?, Mutation?, Subscription? },
  exclude?: true | { Query?, Mutation?, Subscription? },
}
```

Each of `Query` / `Mutation` / `Subscription` is `true` (all actions of the type) or an object `{ <actionName>: true | ['<EntityName>', …] }`: the action for all entities or only for the listed ones. An absent type means none of its actions ✅.

- **`include`** is a whitelist: only what is listed exists. `include: { Query: true }` removes all mutations and subscriptions ✅.
- **`exclude`** is a blacklist: everything exists except what is listed. `exclude: { Subscription: true }` removes all subscriptions ✅.
- Both can be combined: an action exists if `include` covers it and `exclude` does not 📖.

`inventory` removes actions both from the schema (SDL) and from the resolvers 📖. The `node` query always stays ✅.

### Step 2. Action names

In `inventory` actions are named by **general names**, with `Entity` / `Entities` in place of the entity name, and the entities are listed separately ✅:

| Type | General action names (for `Country`: the generated name) |
|---|---|
| `Query`, root | `entity` (`Country`), `entities` (`Countries`), `entitiesThroughConnection`, `entitiesByUnique`, `entityCount`, `entityCounts`, `entityExistences`, `entityDistinctValues` |
| `Query`, child fields | `childEntity` (scalar link: `City.country`), `childEntities` (array link: `Country.cities`), `childEntitiesThroughConnection` (`citiesThroughConnection`), `childEntityCount` (`citiesCount`), `childEntityDistinctValues` (`citiesDistinctValues`), `childEntityGetOrCreate` (`…GetOrCreate` of duplex fields) |
| `Mutation` | `createEntity`, `createManyEntities`, `updateEntity`, `updateManyEntities`, `updateFilteredEntities`, `updateFilteredEntitiesReturnScalar`, `pushIntoEntity`, `deleteEntity`, `deleteManyEntities`, `deleteFilteredEntities`, `deleteFilteredEntitiesReturnScalar`, `deleteEntityWithChildren`, `deleteManyEntitiesWithChildren`, `deleteFilteredEntitiesWithChildren`, `deleteFilteredEntitiesWithChildrenReturnScalar`, `copyEntity`, `copyManyEntities`, `copyEntityWithChildren`, `copyManyEntitiesWithChildren` |
| `Subscription` | `createdEntity`, `updatedEntity`, `deletedEntity` |

Custom actions (part 7) and actions of representations (part 8) are named by their general names too (`entitySummary`, `entitiesForCatalog`, …) 📖.

**Validation.** `composeTypeDefsAndResolvers` checks `generalConfig.inventory` and throws a `TypeError` for ✅:

- a key other than `name`, `include`, `exclude`, or a type other than `Query` / `Mutation` / `Subscription`;
- an unknown action name; for a generated name the message suggests the general one: `Countries` → `{ Query: { entities: ["Country"] } }`;
- an unknown entity, or an entity for which the action is not possible (e.g. `pushIntoEntity` for an entity without array fields, `…WithChildren` without a duplex parent link, part 2); the message lists the entities the action is available for:

  ```
  Incorrect entity name: "Contry" in "Query": "entities" of inventory "G" (include): entity not found!
  ```

`true` values are not checked (there is nothing to check).

### Step 3. Child fields are actions too

The fields of links (part 2, step 5) are the child `Query` actions **of the target entity**: `Country.cities` exists if `['Query', 'childEntities', 'City']` is allowed, `City.country` if `['Query', 'childEntity', 'Country']` is ✅. The variants of array links are separate actions: `citiesThroughConnection`, `citiesCount`, `citiesDistinctValues` need `childEntitiesThroughConnection`, `childEntityCount`, `childEntityDistinctValues` ✅.

This is a feature: an inventory can **close relation fields** while the entities themselves stay available. With `include` the child actions have to be listed explicitly:

```ts
// only the root queries → the entities are available, their relation fields are not:
// Country { id createdAt updatedAt code }, no "currency", no "cities"
include: { Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] } }
```

When the relation fields are needed, **`addChildActions`** adds the child queries for the entities whose root queries are included ✅:

```ts
import { addChildActions } from 'graphql-fns';

const generalConfig: GeneralConfig = {
  allEntityConfigs,
  inventory: addChildActions(
    { name: 'main', include: { Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] } } },
    { allEntityConfigs }, // the rest of the general config: add "custom" and "representations" if you have them
  ),
};
// include.Query becomes:
// { entity: ['Country', 'City'], entities: ['Country', 'City'],
//   childEntity: ['Country'],             → City.country
//   childEntities: ['Country', 'City'] }  → Country.cities (and Currency.countries, if Currency were included)
// Country { … cities }, City { … country }; Country.currency stays closed: Currency is not included
```

✅ Checked on the generated schema.

- Root → child: `entity` → `childEntity`, `entities` → `childEntities`, `entitiesThroughConnection` → `childEntitiesThroughConnection`, `entityCount` → `childEntityCount`, `entityDistinctValues` → `childEntityDistinctValues`, the same for representation keys; `childEntityGetOrCreate` is never added ✅; `entityCounts` and `entityExistences` have no child queries 📖.
- An entity is added only where the child query is possible: `entities: ['Country', 'City']` adds `childEntities: ['City']` (for `Country.cities`), but not `Country`, which is referred to only by scalar fields ✅.
- Child queries already listed are kept; `exclude`, `Mutation`, `Subscription` are not changed; an `include` without an object `Query` is returned as is ✅.
- The helper is not applied implicitly: call it for `generalConfig.inventory` and, if needed, separately for every role of `inventoryByRoles` (step 5) ✅.

### Step 4. Typical inventories

```ts
// 1. no subscriptions (no "pubsub" in the context needed, part 1, step 5)
inventory: { name: 'main', exclude: { Subscription: true } }

// 2. read-only API: all queries and child fields, no mutations and subscriptions
inventory: { name: 'main', include: { Query: true } }

// 3. everything except deletes and "…ByUnique" queries
inventory: {
  name: 'main',
  exclude: {
    Subscription: true,
    Query: { entitiesByUnique: true },
    Mutation: {
      deleteEntity: true,
      deleteManyEntities: true,
      deleteFilteredEntities: true,
      deleteFilteredEntitiesReturnScalar: true,
    },
  },
}

// 4. all queries, but only cities can be created and updated
inventory: {
  name: 'main',
  include: { Query: true, Mutation: { createEntity: ['City'], updateEntity: ['City'] } },
}

// 5. a small read API over two entities with their relation fields
inventory: addChildActions(
  { name: 'main', include: { Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] } } },
  { allEntityConfigs },
)
```

✅ All five inventories were generated: e.g. the 4th gives `Mutation { createCity updateCity }` and keeps all queries and child fields.

`exclude` grows with the config: new entities and actions appear automatically. `include` suits an API that must not grow by itself; list its child actions or use `addChildActions`.

### Step 5. Inventory is not authorization

`generalConfig.inventory` is the same for all users: what it removes does not exist for anyone. Different sets of actions for different users (roles) are set by `serversideConfig.inventoryByRoles` with the same shape of inventories, together with `getUserAttributes` and `containedRoles` (part 10). The schema keeps the actions of `generalConfig.inventory`; the resolvers check the user's inventory at run time 📖. `composeServersideConfig` validates the role inventories like the general one, and every action and entity of a role must also be in the general inventory (`… not found in general inventory!`) 📖.

### Checklist

- [ ] no subscriptions needed → `exclude: { Subscription: true }`;
- [ ] general action names (`entities`, `createEntity`, …) and entity names, not the generated names: wrong ones are rejected with a hint;
- [ ] with `include`, relation fields exist only with their child actions: list them or wrap the inventory in `addChildActions`; leave them out on purpose to close relation fields;
- [ ] per-user restrictions belong to `inventoryByRoles` (part 10), not to `generalConfig.inventory`.

---

[← Part 4](04-entity-level-options.md) · [Contents](README.md) · [Part 6 →](06-calculated-fields.md)
