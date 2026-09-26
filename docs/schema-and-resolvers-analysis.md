# Генерація GraphQL schema та resolvers у graphql-fns: аналіз

> Кожне твердження має ідентифікатор (`E…` сутності, `F…` поля, `Q…/M…/S…` дії, `C…` дочірні поля, `R…` resolvers, `B…` помилки, `I…` неузгодженості, `?…` питання). Щоб погодитися, заперечити чи уточнити, досить послатися на ID.
> Позначки: ✅ перевірено запуском (тимчасовий jest-probe, вже видалений); 📖 висновок лише з читання коду.
> Статус виправлень: **[виправлено `<commit>`]** біля ID; решта пунктів ще відкриті.
> Описові розділи §0–§7 оновлюються разом із виправленнями й відображають поточну поведінку.

**Журнал виправлень**

| Коміт | Що виправлено |
|---|---|
| `2a2e24d4` | B1, B2, B4, частково B8 (кеш `checkInventory`) — узгоджена перевірка inventory у SDL і resolvers |
| `124e7e33` | B3, B5, B5a, B6 — field-resolvers для всіх сутностей, `WherePayloadInput` без calculated virtual-полів, runtime-фільтр за calculated embedded, geospatial-типи для calculated-полів |
| `da657196` | ?9 — calculated geospatial-значення не конвертуються з Mongo-формату |
| `226010ff` | B9, частково B15 — стандартні мутації повторюють лише transient-помилки транзакцій, помилки прокидаються без обгортки |
| `6002a955` | B9 (доповнення) — `workOutMutations` так само не повторює мутації без транзакцій |
| `a323df29` | B7 — `PushIntoXInput` для duplex-масиву з обов'язковим опозитом використовує `Thru`-input, як Create/Update |

---

## 0. Загальний конвеєр

```
SimplifiedEntityConfig[] ──composeAllEntityConfigs──▶ allEntityConfigs (+ PageInfo, Edge, Connection, Payload-и)
                                                        │
GeneralConfig { allEntityConfigs, enums, inventory, representation, custom, interfaces, manualyUsedEntities }
                                                        │
composeTypeDefsAndResolvers(generalConfig, serversideConfig)
   ├─ composeGqlTypes(generalConfig)            → typeDefs (SDL-рядок) + entityTypeDic
   └─ composeGqlResolvers(generalConfig, entityTypeDic, serversideConfig) → resolvers
```

Порядок кроків у `composeGqlTypes` (`src/types/composeGqlTypes.ts`):
1. Для кожної стандартної дії (`queryAttributes` / `mutationAttributes` / `subscriptionAttributes`, файли `src/types/actionAttributes/*`) і кожної сутності викликається `composeActionSignature`. Сигнатура з'являється, лише якщо:
   `!actionIsChild && actionAllowed(entityConfig) && checkRepresentationAction(...)` (останнє означає `checkInventory([actionType, actionName, entity], inventory)`).
   Мимохідь вона наповнює `inputDic` (input-типи) та `entityTypeDic` (типи тих сутностей, які повертає дія, рекурсивно через `fillEntityTypeDic`).
2. Custom і representation-дії: `mergeRepresentationIntoCustom` → `composeCustomActionSignature`, **тільки для tangible**-сутностей.
3. `processManualyUsedEntities` додає типи сутностей, які не досяжні з жодної дії.
4. Будуються `interface`-и (`composeInterfaceTypeDic`).
5. Результат збирається так: `scalar DateTime`, `scalar Upload`, `interface Node`, `input RegExp`, `input SliceInput`, enum-и (`XEnumeration`), geospatial-типи, interfaces, entity types, inputs, `type Query { node(id: ID!): Node … }`, `type Mutation`, `type Subscription`.

Що важливо: **тип сутності потрапляє в SDL лише тоді, коли він досяжний** з якоїсь дії, дочірнього поля або з `manualyUsedEntities`.

---

## 1. Типи сутностей

| ID | Тип | Звідки | Що генерується в SDL | Дії |
|---|---|---|---|---|
| E1 | **tangible** (типовий, `type` можна не вказувати) | користувач | `type X implements Node & …interfaces { id: ID!, createdAt: DateTime!, updatedAt: DateTime!, [counter: Int!], …поля }` | усі root-дії Query/Mutation/Subscription (§3–5) |
| E2 | **embedded** | користувач | `type X [implements …] { id: ID!, …поля }` (без createdAt/updatedAt) | жодних root-дій; лише поля у tangible (`embeddedFields`) і `arrayEntitiesThroughConnection` / `arrayEntityCount` як дочірні |
| E3 | **virtual** | користувач | `type X { …поля, childFields }` без `id` | жодних дій; використовується як тип повернення custom-дій, `calculatedFields(virtualFields)` і `subscriptionActor` |
| E4 | `PageInfo` (virtual) | вбудований (`pageInfoConfig.ts`) | стандартний PageInfo | — |
| E5 | `XEdge` (virtual) | авто для tangible **і** embedded | `node: X!`, `cursor: String!` | — |
| E6 | `XConnection` (virtual) | авто для tangible і embedded | `pageInfo: PageInfo!`, `edges: [XEdge!]!` | повертається з `XsThroughConnection` і дочірніх `…ThroughConnection` |
| E7 | `XUpdatedPayload` (virtual) | авто для tangible | `node: X!`, `previousNode: X!`, `updatedFields: [String!]!`, `[actor: Actor]` | тип повернення `updatedX` |
| E8 | `XCreatedOrDeletedPayload` (virtual) | авто для tangible | `node: X!`, `[actor: Actor]` | тип повернення `createdX` / `deletedX` |
| E9 | **representation**-конфіг `X{Key}` (або з `representationNameSlicePosition`, напр. `XKeyConnection`) | `generalConfig.representation[Key]` | копія X з include/exclude/add/freeze/unfreeze полями та заміненими на `Y{Key}` посиланнями relational/duplex/filter/child | дії `…{Key}` з `allow[X]` |

Обмеження на імена (`composeAllEntityConfigs`, `composeEntityConfig`): не можна `_`, не можна множину (`pluralize(name) === name`), не можна `DateTime/Node/node/PageInfo`. Поля не можуть мати `_`, закінчення `ThroughConnection` / `GetOrCreate` / `DistinctValues` / (для масивів) `Count`, а filter-поля — `Stringified`. Службові імена `id, createdAt, updatedAt, counter, in, nin, …, connect, create, pageInfo` заборонені (крім virtual). `freeze` у embedded/virtual заборонений.

---

## 2. Види полів і їх відображення

| ID | Вид поля | У типі (output) | CreateInput | UpdateInput (без `freeze`) | WhereInput (лише з `index`/`unique`) |
|---|---|---|---|---|---|
| F1 | text/int/float/dateTime/boolean | `String/Int/Float/DateTime/Boolean`, масив: `name(slice: SliceInput): [T!]!` | так | так | `name`, `_in/_nin/_ne/_gt…/_re`, `_exists`/`_size` (boolean: тільки `name`, `_ne`) |
| F2 | enum | `{enumName}Enumeration` | так | так | `name,_in,_nin,_ne,_re`… |
| F3 | geospatial | `Geospatial{Point\|LineString\|…}` | `Geospatial…Input` | так | Point: `_withinPolygon/…/_aroundLineString`; інші: `_intersects…` |
| F4 | embedded | `name: E` / `name(slice): [E!]!` + варіанти `connection` (`nameThroughConnection`) і `count` (`nameCount`) | `ECreateInput` | `EUpdateInput` | `name: EWhereInput` |
| F5 | relational (tangible→tangible) | дочірні поля C1/C2 | `YCreateChildInput` / `YCreateOrPushChildrenInput` (`connect`/`create`) | те саме | `name, _in, _nin, _ne, name_: YWhereWithoutBooleanOperationsInput` |
| F6 | **parent relational** (автоматично додається у Y як опозит для кожного relational X→Y) | масив: C1 | — | — | `name_: …WhereWithoutBooleanOperationsInput`, якщо в опозита є `index` |
| F7 | duplex (двобічний зв'язок) | C1/C2 (+C3 GetOrCreate) | як F5, але якщо опозит `required`, то `YCreateThru_{opp}_FieldChildInput` / `YCreateOrPushThru_{opp}_FieldChildrenInput` (у Create, Update і PushInto; у такому input поле-опозит необов'язкове й заповнюється id батька) | як Create | як F5 |
| F8 | filter (зберігає фільтр по Y) | `variants: plain` → C1/C2; `stringified` → `nameStringified: String` | масив: `YWhereInput`, скаляр: `YWhereOneInput` (**без frozen**, див. I5) | так | — |
| F9 | calculated | за `calculatedType`, з аргументами `inputTypes` (+`slice` для масивів); `filterFields` як C1/C2 | — | — | — (але у WherePayloadInput — так) |
| F10 | child (тільки virtual) | `name: Y` / `[Y!]!` | — | — | — |

---

## 3. Root Query (для tangible `X`; множина `Xs` через `pluralize`)

| ID | actionName | SDL | Коли є | Resolver creator |
|---|---|---|---|---|
| Q0 | — | `node(id: ID!): Node` | завжди | `createNodeQueryResolver` |
| Q1 | `entity` | `X(whereOne: XWhereOneInput[!], whereCompoundOne: XWhereCompoundOneInput, token: String): X` | tangible (`whereOne` має `!`, якщо немає `uniqueCompoundIndexes`; `whereCompoundOne` є лише з ними) | `createEntityQueryResolver` |
| Q2 | `entities` | `Xs(where, sort, pagination, near?, search?, token): [X!]!` | tangible | `createEntitiesQueryResolver` |
| Q3 | `entitiesThroughConnection` | `XsThroughConnection(where, sort, near?, search?, after, before, first, last, token): XConnection!` | tangible | `createEntitiesThroughConnectionQueryResolver` |
| Q4 | `entitiesByUnique` | `XsByUnique(where: XWhereByUniqueInput!, sort, near?, search?, token): [X!]!` | tangible | `createEntitiesByUniqueQueryResolver` |
| Q5 | `entityCount` | `XCount(where, search?, token): Int!` | tangible | `createEntityCountQueryResolver` |
| Q6 | `entityDistinctValues` | `XDistinctValues(where, search?, options: XDistinctValuesOptionsInput!, token): [String!]!` | tangible, **якщо є text або enum поля** | `createEntityDistinctValuesQueryResolver` |

`near?` → лише якщо є geospatial-поле з `index`; `search?` → лише якщо є textField з `weight`. `sort` є завжди (id/createdAt/updatedAt + скалярні індексовані поля).

## 4. Mutation (для tangible `X`)

| ID | actionName | SDL (args → return) | Додаткова умова `actionAllowed` | Публікує subscription-подію? |
|---|---|---|---|---|
| M1 | `createEntity` | `createX(data: XCreateInput!, token)` → `X!` | — | ✅ `created` |
| M2 | `createManyEntities` | `createManyXs(data: [XCreateInput!]!, token)` → `[X!]!` | — | ❌ |
| M3 | `updateEntity` | `updateX(whereOne: XWhereOneInput!, data: XUpdateInput!, token)` → `X!` | — | ✅ `updated` |
| M4 | `updateManyEntities` | `updateManyXs(whereOne: [..!]!, data: [XUpdateInput!]!, token)` → `[X!]!` | — | ❌ |
| M5 | `updateFilteredEntities` | `updateFilteredXs(where, near?, search?, data: XUpdateInput!, token)` → `[X!]!` | — | ❌ |
| M6 | `updateFilteredEntitiesReturnScalar` | `updateFilteredXsReturnScalar(where, search?, data!, token)` → `Int!` | — | ❌ |
| M7 | `pushIntoEntity` | `pushIntoX(whereOne!, data: PushIntoXInput!, positions: XPushPositionsInput, token)` → `X!` | є хоча б одне не-frozen масивне поле (або filter-поле) | ✅ `updated` |
| M8 | `deleteEntity` | `deleteX(whereOne!, token)` → `X!` | — | ✅ `deleted` |
| M9 | `deleteManyEntities` | `deleteManyXs(whereOne: [..!]!, token)` → `[X!]!` | — | ❌ |
| M10 | `deleteFilteredEntities` | `deleteFilteredXs(where, near?, search?, token)` → `[X!]!` | — | ❌ |
| M11 | `deleteFilteredEntitiesReturnScalar` | `…ReturnScalar(where, search?, token)` → `Int!` | — | ❌ |
| M12 | `deleteEntityWithChildren` | `deleteXWithChildren(whereOne!, options: deleteXWithChildrenOptionsInput, token)` → `X!` | є «діти» (*) | ❌ |
| M13 | `deleteManyEntitiesWithChildren` | `deleteManyXsWithChildren(whereOne: [..]!, options, token)` → `[X!]!` | (*) | ❌ |
| M14 | `deleteFilteredEntitiesWithChildren` | `deleteFilteredXsWithChildren(where, near?, search?, options, token)` → `[X!]!` | (*) | ❌ |
| M15 | `deleteFilteredEntitiesWithChildrenReturnScalar` | `…(where, search?, options, token)` → `Int!` | (*) | ❌ |
| M16 | `copyEntity` | `copyX(whereOnes: XCopyWhereOnesInput!, options: copyXOptionsInput, whereOne: XWhereOneToCopyInput, data: XUpdateInput, token)` → `X!` | (**) | ❌ |
| M17 | `copyManyEntities` | `copyManyXs(whereOnes: [..!]!, options, whereOne: [..!], data: [..!], token)` → `[X!]!` | (**) | ❌ |
| M18 | `copyEntityWithChildren` | `copyXWithChildren(whereOnes!, options, whereOne, token)` → `X!` | (**) і (*) | ❌ |
| M19 | `copyManyEntitiesWithChildren` | `copyManyXsWithChildren(whereOnes: [..!]!, options, whereOne: [..!]!, token)` → `[X!]!` | (**) і (*) | ❌ |
| — | `cloneEntity` | закоментовано в `actionAttributes/index.ts` | — | — |

(*) «Діти» — це duplex-поля X, у яких поле-опозит **скалярне і не `parent`** (`getOppositeFields(...).filter(([, {array, parent}]) => !(array || parent))`).
(**) Існує duplex-поле `f`, для якого `getMatchingFields(X, Y)` дає хоч одне поле, окрім `f` (тобто в X і Y є однойменні поля, які можна скопіювати).

Усі мутації, крім `workOutMutations`, зібрано через `composeStandardMutationResolver(resolverAttributes)`: цикл `getPrevious → prepareBulkData → unwindCore → addPeripheryToCore → optimizeBulkItems → incCounters → executeBulkItems`, потім `produceResult`, `report` (публікація в pubsub) і `finalResult`. Повтор усієї транзакції (до 7 спроб з backoff) відбувається лише для помилок з міткою `TransientTransactionError` / `WriteConflict` і лише коли `serversideConfig.transactions` увімкнено; при `UnknownTransactionCommitResult` повторюється тільки `commitTransaction`. Інші помилки прокидаються як є. Те саме правило діє й для `workOutMutations`.

## 5. Subscription (для tangible `X`)

| ID | SDL | Канал pubsub |
|---|---|---|
| S1 | `createdX(wherePayload: XWherePayloadInput): XCreatedOrDeletedPayload!` | `created-X` |
| S2 | `deletedX(wherePayload): XCreatedOrDeletedPayload!` | `deleted-X` |
| S3 | `updatedX(wherePayload, whichUpdated: XWhichUpdatedInput): XUpdatedPayload!` | `updated-X` |

`XWherePayloadInput` будується з усіх полів (без вимоги `index`) + calculated-полів без `asyncFunc` (або з переліку `allowedCalculatedWithAsyncFuncFieldNames`). Calculated-поля з `calculatedType: 'virtualFields'` у фільтр **не потрапляють** (свідоме рішення, див. B5 і ?10). Runtime-фільтр використовує той самий набір полів (`composeSubscriptionDummyEntityConfig`).

## 6. Дочірні поля всередині типу X (`createEntityType`)

Для relational (включно з parent), duplex, filter(`plain`) та calculated(`filterFields`), що ведуть на Y:

| ID | Поле | Умова | SDL | Field resolver (`composeEntityResolvers`) |
|---|---|---|---|---|
| C1 | масив | `childEntities` дозволено | `f(where, sort, pagination, near?, search?): [Y!]!` | relational/duplex: `createEntityArrayResolver`; parent relational: `createEntityOppositeRelationArrayResolver`; filter: `createEntityFilterArrayResolver` |
| C1a | масив | `childEntitiesThroughConnection` | `fThroughConnection(where, sort, near?, search?, after, before, first, last): YConnection!` | `…ConnectionResolver` (3 варіанти, як вище) |
| C1b | масив | `childEntityCount` | `fCount(where, search?): Int!` | `…CountResolver` |
| C1c | масив | `childEntityDistinctValues` і в Y є text/enum | `fDistinctValues(where, search?, options!): [String!]!` | `…DistinctValuesResolver` |
| C2 | скаляр | `childEntity` дозволено (`checkRepresentationAction`, та сама перевірка, що й для resolver-а; див. B4) | `f: Y[!]` | `createEntityScalarResolver` / `createEntityFilterScalarResolver` |
| C3 | duplex-скаляр, не `required`, опозит скалярний | `childEntityGetOrCreate` | `fGetOrCreate(data: YCreateInput!): Y` (`whereOne` сховано) | `createEntityGetOrCreateResolver` |
| C4 | embedded-масив | `variants` | `plain`: `f(slice): [E!]!`; `connection`: `fThroughConnection(after,before,first,last): EConnection!`; `count`: `fCount: Int!` | `fieldArrayResolver` / `fieldArrayThroughConnectionResolver` / `fieldArrayCountResolver` |
| C5 | будь-яке інше масивне поле | — | `f(slice: SliceInput)` | `fieldArrayResolver` |
| C6 | geospatial | — | `Geospatial…` | звичайні поля: конвертери `…FromMongoToGql`; calculated: без конвертації (`func` повертає GraphQL-формат, див. ?9), масиви — `fieldArrayResolver` |
| C7 | filter `stringified` | — | `fStringified: String` | `fieldFilterStringifiedResolver` |

Field-resolvers (`composeEntityResolvers`) створюються для **кожної** сутності, тип якої є в SDL: tangible, embedded, virtual та їхні representation-версії. Порожні набори не додаються (див. B3).

Кожен дочірній field-resolver усередині обгортає відповідний Query-resolver `createChildEntity*QueryResolver` через `resolverDecorator`, а для representation-конфігів — через `createCustomResolver('Query', 'childEntity…{Key}')`.

---

## 7. Фільтри, що керують генерацією

| ID | Механізм | Де діє |
|---|---|---|
| G1 | `actionAllowed(entityConfig)` | і в типах, і в resolvers (узгоджено) |
| G2 | `inventory` (`include`/`exclude`, ланцюжок `[Kind, action, entity]`; `include` обмежує на всіх рівнях, `exclude` виключає лише повністю покритий ланцюжок, `exclude: true` — усе) | типи: `checkRepresentationAction` (і для root-дій, і для дочірніх полів); resolvers: кожен creator викликає `checkInventory` і повертає `null`; у runtime ролі перевіряються через `inventoryByRoles` в `executeAuthorisation` |
| G3 | `representation[Key].allow[X]` — список дій | типи + resolvers (через `mergeRepresentationIntoCustom` → custom-дії з назвою `${action}${Key}`) |
| G4 | `custom.{Input,Query,Mutation}` + `serversideConfig.{Query,Mutation}` | сигнатура: лише tangible; resolver: `createCustomResolver` для **всіх** сутностей (див. B14) |
| G5 | `manualyUsedEntities` | додає тип, навіть якщо він не досяжний |

Ланцюжок runtime-декораторів: `resolverDecorator` → `transformBefore` (args за суфіксом типу: `CreateInput/UpdateInput/PushIntoInput` → `transformData`; `Where*` → `transformWhere`; `WhereOne*` → `transformWhereOne`; `CopyWhereOnesInput` → `transformWhereOnes`) → `authDecorator` (`executeAuthorisation`: inventoryByRoles, filters, staticFilters, personalFilters → `involvedFilters`, `subscriptionEntityNames`) → resolver → `transformAfter` (глобальні id).

---

## 8. Помилки, підтверджені запуском ✅

| ID | Суть | Місце | Відтворення / наслідок |
|---|---|---|---|
| **B1** **[виправлено `2a2e24d4`]** | `checkInventory`: якщо є і `include`, і `exclude`, а поточний рівень ланцюжка не згаданий в `exclude`, функція **одразу повертає `true`** і не перевіряє `include` на глибших рівнях | `src/utils/inventory/checkInventory.ts:41-43` | `include: {Query: {entities: ['A']}}, exclude: {Mutation: true}` → `checkInventory(['Query','entities','B'])` дає `true` (без exclude дає `false`). Через `executeAuthorisation.ts:315` це стосується і **`inventoryByRoles`, тобто авторизації** |
| **B2** **[виправлено `2a2e24d4`]** | `createChildEntityCountQueryResolver` і `createChildEntityDistinctValuesQueryResolver` перевіряють inventory-ланцюжок `'childEntitiesThroughConnection'` замість `'childEntityCount'` / `'childEntityDistinctValues'` | `queries/createChildEntityCountQueryResolver/index.ts:29`, `queries/createChildEntityDistinctValuesQueryResolver/index.ts:30` | inventory `include: {Query: {entities, childEntities, childEntityCount}}` → поле `Menu.sectionsCount` є в SDL, але запит на нього падає з `TypeError: func is not a function` |
| **B3** **[виправлено `124e7e33`]** | Field-resolvers сутності створюються тільки для tangible **і тільки якщо** в неї є `duplexFields \|\| geospatialFields \|\| relationalFields` | `resolvers/composeGqlResolvers/index.ts:254` | tangible `Holder` з embedded-масивом `variants: ['plain','connection','count']` і `tags: [String]` → `resolvers.Holder` взагалі відсутній: `itemsThroughConnection: ItemConnection!` поверне null (помилка non-null), `slice` ігнорується. Так само (📖) filter-поля без relational/duplex не резолвляться, а embedded-типи ніколи не отримують resolvers (slice/connection/count для вкладених масивів) |
| **B4** **[виправлено `2a2e24d4`]** | `createEntityType` викликає `checkInventory([... 'childEntity' / 'childEntityGetOrCreate' ...])` **без аргументу `inventory`**, тож перевірка завжди `true` | `src/types/createEntityType.ts:253`, `:275` | `exclude: {Query: {childEntity: ['Menu']}}` → у `type Section` є `menu: Menu`, але resolver `Section.menu` не створюється (його creator inventory враховує) |
| **B5** **[виправлено `124e7e33`]** | `WherePayloadInput` падає для calculated-поля з `calculatedType: 'virtualFields'`: у `preFields` немає ключа `virtualFields` | `src/types/inputs/createEntityWherePayloadInputType.ts:67` | `composeTypeDefsAndResolvers` → `TypeError: Cannot read properties of undefined (reading 'push')` |
| **B6** **[виправлено `124e7e33`]** | `composeGeospatialTypes` дивиться лише на `geospatialFields`, а calculated geospatial-поля ігнорує | `src/types/specialized/composeGeospatialTypes.ts:17` | сутність лише з calculated `Point` → `Unknown type "GeospatialPoint"` (і `…PolygonInput` та інші з WherePayload) |
| **B5a** **[виправлено `124e7e33`]** | (знайдено під час виправлення B5) Runtime-фільтр `wherePayload` за calculated embedded-полем падав: dummy-конфіг subscription губив `config` поля (`Cannot destructure property 'name' of 'entityConfig'`) | `src/resolvers/utils/composeSubscriptionDummyEntityConfig/index.ts` | тепер зберігаються `config`, `enumName`, `geospatialType`; calculated virtual-поля не фільтруються ні в SDL, ні в runtime |
| **B7** **[виправлено `a323df29`]** | `PushIntoXInput` для duplex-масиву завжди використовує `YCreateOrPushChildrenInput`, а Create/Update, коли опозит `required`, беруть `YCreateOrPushThru_{opp}_FieldChildrenInput` | `src/types/inputs/createPushIntoEntityInputType.ts:84` | `PushIntoMenuInput.sections: SectionCreateOrPushChildrenInput` → `create: [SectionCreateInput!]`, де обов'язкове `menu: MenuCreateChildInput!`: клієнт змушений вказувати батька, якого й так відомо (для `MenuCreateInput` цього не треба) |
| **B8** (частково: кеш `checkInventory` тепер окремий для кожного об'єкта inventory, **[виправлено `2a2e24d4`]**) | Глобальний кеш resolvers на рівні модуля не враховує аргументи | `resolvers/composeGqlResolvers/index.ts:22,31` | поза jest другий виклик з **іншим** `generalConfig` повертає resolvers першого (`a.resolvers === b.resolvers`). Схожі глобальні кеші без прив'язки до конфігу: `mergeRepresentationIntoCustom` (ключ — `variant`), `parseEntityName`, `composeRepresentationConfig` (ключ — ім'я), `checkInventory` (ключ — `inventory.name`), `resolverDecorator`, subscription creators |

## 9. Помилки, встановлені читанням коду 📖

| ID | Суть | Місце |
|---|---|---|
| **B9** **[виправлено `226010ff`]** | `composeStandardMutationResolver` повторює **будь-яку** помилку 7 разів (backoff ≈ 6,3 с), навіть валідаційну, а наприкінці кидає `new Error(err)`, через що втрачаються тип і повідомлення (`"Error: TypeError: …"`). Без `transactions` повторюються неідемпотентні часткові записи. Для `workOutMutations` саме це виправлено в `3c87337`, а стандартні мутації лишилися з тією ж поведінкою | `resolvers/mutations/composeStandardMutationResolver/index.ts:101-245` |
| **B10** | Коли задано `representation`, `mergeRepresentationIntoCustom` **перезаписує `custom.Subscription`** представницькими subscription-ами. Custom-підписки до того ж не валідуються | `src/utils/mergeRepresentationIntoCustom/index.ts:212-217` |
| B11 | `prev.includes(entityName)`, а в масив потрапляє `entityName2` (опечатка: дублікати, перевірка не працює як задумано) | `mergeRepresentationIntoCustom/index.ts:112` |
| B12 | `composeActionSignature`: якщо у дії не лишилося аргументів, функція виходить **до** `fillEntityTypeDic`, і тип повернення може не потрапити в SDL. Зараз для стандартних дій це недосяжно (завжди є `token`/`where`), але це латентна помилка | `src/types/composeActionSignature.ts:69` |
| B13 | `composeChildActionSignature` повертає або рядок аргументів, або повну сигнатуру `  name: type` (коли аргументів немає); виклики вставляють результат у `(...)`, і SDL стане невалідним | `src/types/composeChildActionSignature.ts:74` vs `:82` |
| B14 | Resolvers для custom-дій створюються для всіх сутностей, а сигнатури в SDL — лише для tangible. Якщо custom `specificName` поверне непорожнє ім'я для embedded/virtual, `makeExecutableSchema` впаде (resolver без поля) | `composeGqlResolvers/index.ts:83` vs `composeGqlTypes.ts:96` |
| B15 (частково: тексти для `prepareBulkData` і `finalResult` виправлено в `226010ff`, лишається `"UpdatedPayload"`) | Скопійовані тексти помилок: `getPrevious have to be setted` для `prepareBulkData`, `report have to be setted` для `finalResult`, `"UpdatedPayload"` у composer для `CreatedOrDeletedPayload` | `composeStandardMutationResolver/index.ts:186,265`; `composeCreatedOrDeletedPayloadVirtualConfig.ts:25` |
| B16 | TS-типи: `ArrayCalculatedField.func` повертає `GraphqlScalar` замість масиву; у union `CalculatedField` двічі повторюється Geospatial; `EmbeddedEntityConfig` виключає `calculatedFields`, а `SimplifiedEmbeddedEntityConfig` їх дозволяє | `src/tsTypes/index.ts:794, 804-807, 839-844` |
| B17 | Дрібниці: у WhereInput для масивного geospatial `_size` немає відступу; коментар «use not required ID in embedded» суперечить `id: ID!`; коментар «only scalar points» у NearInput не відповідає фільтру (усі типи й масиви); `createEntitySortInputType` має недосяжну гілку `if (!fieldLines.length)`; ~~`allowMutations/allowSubscriptions` у `composeGqlTypes` не використовуються~~ (прибрано в `2a2e24d4`); `const all = []` у `fillEntityTypeDic`; `createCloneEntityMutationResolver` має `actionGeneralName: 'updateEntity'` | різні |

## 10. Неузгодженості (можливо, так задумано: потрібне ваше рішення)

| ID | Спостереження |
|---|---|
| I1 | Subscription-події публікують лише `createEntity`, `updateEntity`, `pushIntoEntity`, `deleteEntity`. Масові операції (`createMany…`, `updateMany/Filtered…`, `deleteMany/Filtered/WithChildren…`, `copy…`) подій не створюють, тож підписники їх пропускають |
| I2 | `update/deleteFilteredEntitiesReturnScalar` не мають аргументу `near`, хоча їхні не-скалярні версії мають |
| I3 | `copyManyEntities.whereOne: [X!]` (nullable), а `copyManyEntitiesWithChildren.whereOne: [X!]!`; `copyEntityWithChildren` не має `data`, а `copyEntity` має |
| I4 | У `XWhereOneInput` унікальне text-поле має тип `ID`, тоді як у `WhereByUnique` і `WhereCompoundOne` воно `String` |
| I5 | `XCreateInput` **виключає frozen filter-поля**, хоча інші frozen-поля в CreateInput є (freeze має забороняти лише зміну) — `createEntityCreateInputType.ts:101` |
| I6 | `PushIntoXInput` бере **всі** filter-поля, включно зі скалярними (решта полів відфільтрована за `array`), а `XPushPositionsInput` filter-поля не містить |
| I7 | `freezedFields[X]` робить frozen **рівно** перелічені поля (решта стає `freeze: false`, навіть якщо в базовому конфігу вони frozen); `unfreezedFields` працює навпаки. Якщо задати обидва, переможе останній |
| I8 | `childEntityGetOrCreate` має `actionType: 'Query'`, але може створювати запис: запис даних у Query-полі |
| I9 | `XDistinctValuesOptionsInput` пропонує всі text/enum-поля (також масивні й неіндексовані), а enum має назву `XTextNamesEnum` |
| I10 | `entityCount`/`entityDistinctValues` не мають `near`. Мабуть, це свідомо, бо `$nearSphere` не працює з count/distinct, але варто підтвердити |
| I11 | `composeEntityConfig` не перевіряє, що `configName` у relational/duplex веде на **tangible**, і що `oppositeName` опозита вказує назад саме на це поле |

## 11. Питання до вас

- ?1 B1: ~~якою має бути семантика `include` + `exclude` разом?~~ Вирішено в `2a2e24d4`: `include` обмежує на всіх рівнях, `exclude` виключає лише повністю покритий ланцюжок, `exclude: true` виключає все.
- ?2 B3: ~~чи планувалося, що embedded-типи (і tangible без relational/duplex/geo) отримуватимуть field-resolvers? Якщо так, умову в `composeGqlResolvers:254` треба прибрати або розширити, а embedded-типи обходити теж.~~ Вирішено в `124e7e33`: field-resolvers створюються для всіх сутностей, які є в SDL.
- ?3 I1: події для масових мутацій не публікуються навмисно (продуктивність) чи через недогляд?
- ?4 I5/I6: як правильно поводитися з `freeze` для filter-полів у Create і з скалярними filter-полями в Push?
- ?5 I7: `freezedFields`/`unfreezedFields` мають «перевизначати повністю» чи «доповнювати» базовий `freeze`?
- ?6 B8: чи підтримується кілька різних `generalConfig` в одному процесі (multi-tenant, hot reload, тести поза jest)? Якщо так, кеші треба прив'язати до конфігу (наприклад, `WeakMap` за `generalConfig`).
- ?7 `cloneEntity`: код resolver-а та `createEntityCloneInputType` лишаються. Їх видалити чи відновити?
- ?8 Custom Subscription (`custom.Subscription`): це підтримувана функція? `composeGqlResolvers` приймає лише імена з префіксами `createdEntity*/deletedEntity*/updatedEntity*`.
- ?9 ~~Формат calculated geospatial-значень~~ Відповідь: `func` повертає GraphQL-формат (`{ lng, lat }`). Виправлено в `da657196`: calculated geospatial-поля більше не проходять через Mongo→GraphQL-конвертер (який повертав `null`), масиви зберігають підтримку `slice`.
- ?10 ~~Фільтрація `wherePayload` за calculated virtual-полями~~ Відповідь: не потрібна. Поточна поведінка (virtual-поля не фільтруються) остаточна.
