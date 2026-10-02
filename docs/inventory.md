# Inventory

> `generalConfig.inventory` selects which actions exist in the schema; `serversideConfig.inventoryByRoles` selects which of them every role may call.
> Identifiers: `IN…` facts, `?IN…` open questions. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.

## 1. Shape

```ts
type Inventory = {
  name: string; // used only in error messages
  include?: true | InventoryOptions; // white list
  exclude?: true | InventoryOptions; // black list
};

type InventoryOptions = {
  Query?: true | { [actionGeneralName: string]: true | string[] }; // entity names
  Mutation?: true | { [actionGeneralName: string]: true | string[] };
  Subscription?: true | { [actionGeneralName: string]: true | string[] };
};
```

Keys of the second level are **general** action names (`entity`, `entities`, `createEntity`, `createdEntity`, …, see `src/types/actionAttributes`), names of custom actions (`generalConfig.custom`) and names of representation actions (`entitiesForCatalog`, `childEntityForCatalog`, …). Generated names (`Country`, `Countries`, `createCountry`) are not accepted.

## 2. Matching (`checkInventory`)

| ID | Fact |
|---|---|
| IN1 | 📖 Every action is checked by a chain `[actionType, actionGeneralName, entityName]` (`src/utils/inventory/checkInventory.ts`), e.g. `['Query', 'entities', 'Country']`; representation actions use the root entity name and the general name with the key (`['Query', 'entitiesForCatalog', 'Country']`, `src/utils/checkRepresentationAction`). |
| IN2 | 📖 `include` restricts on every level: the chain must be matched at least partially (`true` or an array containing the item ends the match). A deeper `include` than the chain still matches, so `checkInventory(['Mutation'], inventory)` is `true` if any mutation is included (`composeGqlResolvers` creates `Mutation`/`Subscription` resolver maps this way). |
| IN3 | 📖 `exclude` removes only fully covered chains. |
| IN4 | 📖 Results are cached per inventory object (a `WeakMap`), except in jest. |
| IN5 | 📖 Child fields (`Country.cities`, `City.country`, filter fields…) are Query actions of the **target** entity: `childEntity`, `childEntities`, `childEntitiesThroughConnection`, `childEntityCount`, `childEntityDistinctValues`, `childEntityGetOrCreate`. So `include: { Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] } }` produces `Country` without `cities` and `City` without `country` until `childEntities: ['City']` and `childEntity: ['Country']` are included too (✅ `addChildActions.mtest.ts`: `Cannot query field "cities" on type "Country"`). This lets an inventory close relation fields for particular clients while the entities stay available; when the fields are needed, `addChildActions` (§6) adds the child queries. Array fields of embedded entities (`arrayEntitiesThroughConnection`, `arrayEntityCount`) have `actionType: 'Field'` and are not checked. |
| IN6 | 📖 Without `inventory` every action is allowed, including all subscriptions. |

## 3. Unwinding and validation (`unwindInverntoryOptions`)

`src/utils/inventory/unwindInverntoryOptions.ts` turns `InventoryOptions` into `SimplifiedInventoryOptions` — `{ Query: { actionGeneralName: entityName[] }, Mutation: …, Subscription: … }` — and rejects everything it can not unwind.

| ID | Fact |
|---|---|
| IN7 | 📖 All possible actions of a type are collected first: standard actions allowed (`actionAllowed`) for every tangible entity, custom and representation actions (`mergeRepresentationIntoCustom(generalConfig, 'forCustomResolver')`) whose `specificName` is not empty for the entity, and for `Query` child actions of entities referred by relational, duplex, plain filter and calculated filter fields of **any** entity (the same fields as in `createEntityType`; arrays give array child actions, scalars give scalar ones). |
| IN8 | ✅ `{}` (no action type) means all actions; `Query: true` means all queries; an absent type means none. |
| IN9 | ✅ A `TypeError` is thrown for: a key other than `Query`/`Mutation`/`Subscription`; a type value that is neither `true` nor an object; an unknown action name; an action value that is neither `true` nor an array; an unknown entity or an entity for which the action is not available (the message lists the entities it is available for). Messages contain the inventory name and `(include)`/`(exclude)`, e.g. `Incorrect entity name: "Contry" in "Query": "entities" of inventory "G" (include): entity not found!` (`src/utils/inventory/checkGeneralInventory.test.ts`). |
| IN10 | ✅ For an unknown action name the message suggests the general name when the name is a generated one (`Countries` → `{ Query: { entities: ["Country"] } }`, also for custom and representation actions) or says that an entity name is used instead of an action name. Generated names of child actions are not recognized (child fields are named by fields). |

## 4. Where it is validated

| ID | Fact |
|---|---|
| IN11 | ✅ `composeGqlTypes` (so `composeTypeDefsAndResolvers`) calls `checkGeneralInventory(generalConfig)` (`src/utils/inventory/checkGeneralInventory.ts`): keys of `inventory` other than `name`, `include`, `exclude` throw; `include`/`exclude` objects are validated by `unwindInverntoryOptions`; `true` or absent values are not checked. |
| IN12 | 📖 `composeServersideConfig` → `getAllEntityNames` unwinds the general inventory and every role inventory of `inventoryByRoles` with the same function, then checks that role actions and entities are present in the general inventory (`… not found in general inventory!`) and collects involved entity names (used to reject redundant `staticFilters`, `staticLimits`, `personalFilters`…). So role inventories get the same checks as IN9 (unknown keys of `exclude` are kept to be rejected), and the child query targets of IN7 (filter fields, fields of non-tangible entities) are accepted there too. |
| IN13 | 📖 `getAllEntityNames` treats a non-object `include` (`true`/absent) as all actions, and an object `include: {}` also as all actions (IN8), although `checkInventory` includes nothing for `include: {}`. |

## 5. Subscriptions and `pubsub`

| ID | Fact |
|---|---|
| IN14 | 📖 `executeAuthorisation` puts `subscriptionCreatedEntityName` / `subscriptionUpdatedEntityName` / `subscriptionDeletedEntityName` into `resolverOptions.subscriptionEntityNames` when the matching subscription is allowed by the inventory; the `report` of `createEntity`, `updateEntity` (and `pushIntoEntity`), `deleteEntity` then returns a function that publishes the event after writes (`composeReport`); other mutations (`createManyEntities`, `updateFilteredEntities`, …) do not report. |
| IN15 | ✅ `composeStandardMutationResolver` and `workOutMutations` (with `returnResult` and `returnReport`) compose the report before any write and call `checkPubsub(context)` if there is one, so without `context.pubsub` such a mutation throws `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!` without changes in the database (`src/resolvers/mutations/missingPubsub.mtest.ts`). `composeReport` keeps the same check for other callers. |

## 6. Adding child queries (`addChildActions`)

`addChildActions(inventory, generalConfig)` (exported, `src/utils/inventory/addChildActions.ts`) is a shortcut for the common case when relation fields have to stay available (IN5): separate child queries let an inventory close relation fields for particular clients, and the helper keeps this possibility by not changing the semantics of `checkInventory`. It returns a new inventory whose `include.Query` also lists the child queries of the entities with included root queries.

| ID | Fact |
|---|---|
| IN16 | ✅ Root → child: `entity` → `childEntity`, `entities` → `childEntities`, `entitiesThroughConnection` → `childEntitiesThroughConnection`, `entityCount` → `childEntityCount`, `entityDistinctValues` → `childEntityDistinctValues`; the same with every representation key (`entitiesForCatalog` → `childEntitiesForCatalog`). `childEntityGetOrCreate` has no root query and is never added; `entityCounts` has no child query and adds nothing. |
| IN17 | ✅ An entity is added only if the child query is possible for it (the lists of IN7), e.g. `entities: ['Country', 'City']` adds `childEntities: ['City']` for `Country.cities` but not `Country`, which is referred only by scalar fields. Root `true` is unwound to the entity list first. |
| IN18 | ✅ Already listed child queries are kept (entities are appended, `true` stays); `exclude`, `Mutation`, `Subscription` and the argument are not changed. `include` that is `true`, absent, without `Query` or with `Query: true` is returned as is (the same object). |
| IN19 | ✅ `include.Query` is validated as in IN9. The helper is not applied implicitly: it can be used for `generalConfig.inventory` and, separately, for every role of `inventoryByRoles` (`src/utils/inventory/addChildActions.test.ts`, `addChildActions.mtest.ts`). |
