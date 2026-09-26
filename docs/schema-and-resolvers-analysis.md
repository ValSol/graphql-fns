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
| `dc922b25` | B10, ?8 — нестандартні (custom, створені вручну) subscriptions явно заборонені: `custom.Subscription` дає зрозумілу помилку |
| `39794e6e` | B8, B8a — усі кеші прив'язані до об'єктів конфігів (`createObjectBoundStore`), перетворювачі аргументів складаються для кожного resolver-а |
| `e8b906de` | B11–B17 — дрібні виправлення: сигнатури дій без аргументів, custom-resolvers лише для tangible, TS-типи, тексти помилок, мертвий код |
| `81f368db` | I2, I4, I5, I6, I9, I11, ?7 — неузгодженості схеми за вашими рішеннями, видалено `cloneEntity`; I7, I10 — так задумано; I3, I8 — відкладено |
| `0fb7a9fe` | B20 — однакова умова «діти» (`parent: true` + скалярний опозит) у схемі й resolvers `…WithChildren` |
| `e2303727` | Q6 (варіант Б), B18, B19, B21 — перейменування аргументів `copy…` (`whereSource`, `whereKeyToTarget`), необов'язковий `whereKeyToTarget` у `copyManyXsWithChildren`, порядок записів у `copyMany…` |

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

Кешування: поза jest проміжні результати кешуються, але окремо для кожного об'єкта `generalConfig` / `serversideConfig` / `entityConfig` (`src/utils/createObjectBoundStore.ts`). Повторний виклик із тими самими об'єктами повертає кешований результат, а інший конфіг отримує свій.

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
| F8 | filter (зберігає фільтр по Y як рядок) | `variants: plain` → C1/C2; `stringified` → `nameStringified: String` | масив: `YWhereInput`, скаляр: `YWhereOneInput` (frozen теж, див. I5) | так (без frozen) | — (у `PushIntoXInput` filter-полів немає, див. I6) |
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
| Q6 | `entityDistinctValues` | `XDistinctValues(where, search?, options: XDistinctValuesOptionsInput!, token): [String!]!` | tangible, **якщо є індексовані text (`index`/`unique`) або enum (`index`) поля** (див. I9) | `createEntityDistinctValuesQueryResolver` |

`near?` → лише якщо є geospatial-поле з `index`; `search?` → лише якщо є textField з `weight`. `sort` є завжди (id/createdAt/updatedAt + скалярні індексовані поля).

## 4. Mutation (для tangible `X`)

| ID | actionName | SDL (args → return) | Додаткова умова `actionAllowed` | Публікує subscription-подію? |
|---|---|---|---|---|
| M1 | `createEntity` | `createX(data: XCreateInput!, token)` → `X!` | — | ✅ `created` |
| M2 | `createManyEntities` | `createManyXs(data: [XCreateInput!]!, token)` → `[X!]!` | — | ❌ |
| M3 | `updateEntity` | `updateX(whereOne: XWhereOneInput!, data: XUpdateInput!, token)` → `X!` | — | ✅ `updated` |
| M4 | `updateManyEntities` | `updateManyXs(whereOne: [..!]!, data: [XUpdateInput!]!, token)` → `[X!]!` | — | ❌ |
| M5 | `updateFilteredEntities` | `updateFilteredXs(where, near?, search?, data: XUpdateInput!, token)` → `[X!]!` | — | ❌ |
| M6 | `updateFilteredEntitiesReturnScalar` | `updateFilteredXsReturnScalar(where, near?, search?, data!, token)` → `Int!` | — | ❌ |
| M7 | `pushIntoEntity` | `pushIntoX(whereOne!, data: PushIntoXInput!, positions: XPushPositionsInput, token)` → `X!` | є хоча б одне не-frozen масивне поле (або filter-поле) | ✅ `updated` |
| M8 | `deleteEntity` | `deleteX(whereOne!, token)` → `X!` | — | ✅ `deleted` |
| M9 | `deleteManyEntities` | `deleteManyXs(whereOne: [..!]!, token)` → `[X!]!` | — | ❌ |
| M10 | `deleteFilteredEntities` | `deleteFilteredXs(where, near?, search?, token)` → `[X!]!` | — | ❌ |
| M11 | `deleteFilteredEntitiesReturnScalar` | `…ReturnScalar(where, near?, search?, token)` → `Int!` | — | ❌ |
| M12 | `deleteEntityWithChildren` | `deleteXWithChildren(whereOne!, options: deleteXWithChildrenOptionsInput, token)` → `X!` | є «діти» (*) | ❌ |
| M13 | `deleteManyEntitiesWithChildren` | `deleteManyXsWithChildren(whereOne: [..]!, options, token)` → `[X!]!` | (*) | ❌ |
| M14 | `deleteFilteredEntitiesWithChildren` | `deleteFilteredXsWithChildren(where, near?, search?, options, token)` → `[X!]!` | (*) | ❌ |
| M15 | `deleteFilteredEntitiesWithChildrenReturnScalar` | `…(where, near?, search?, options, token)` → `Int!` | (*) | ❌ |
| M16 | `copyEntity` | `copyX(whereSource: XWhereSourceInput!, options: copyXOptionsInput, whereKeyToTarget: XWhereKeyToTargetInput, data: XUpdateInput, token)` → `X!` | (**) | ❌ |
| M17 | `copyManyEntities` | `copyManyXs(whereSource: [..!]!, options, whereKeyToTarget: [..!], data: [..!], token)` → `[X!]!` | (**) | ❌ |
| M18 | `copyEntityWithChildren` | `copyXWithChildren(whereSource!, options, whereKeyToTarget, token)` → `X!` | (**) і (*) | ❌ |
| M19 | `copyManyEntitiesWithChildren` | `copyManyXsWithChildren(whereSource: [..!]!, options, whereKeyToTarget: [..!], token)` → `[X!]!` | (**) і (*) | ❌ |
| — | `cloneEntity` | видалено (див. ?7) | — | — |

(*) «Діти» — записи, на які X посилається через duplex-поля з **`parent: true`**, у яких поле-опозит **скалярне** (`getNotArrayOppositeDuplexFields`: `parent && !oppositeArray`). Ту саму умову (утиліта `getChildDuplexFields`) використовують і схема (`actionAllowed` усіх `…WithChildren`-мутацій, enum `deleteXWithChildrenOptionsInput`), і виконання (видалення з дітьми в `processFieldToDelete`, копіювання дерева в `composeCreateTree`); до `0fb7a9fe` схема перевіряла іншу умову (див. B20).
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
| C1c | масив | `childEntityDistinctValues` і в Y є індексовані text/enum-поля | `fDistinctValues(where, search?, options!): [String!]!` | `…DistinctValuesResolver` |
| C2 | скаляр | `childEntity` дозволено (`checkRepresentationAction`, та сама перевірка, що й для resolver-а; див. B4) | `f: Y[!]` | `createEntityScalarResolver` / `createEntityFilterScalarResolver` |
| C3 | duplex-скаляр, не `required`, опозит скалярний | `childEntityGetOrCreate` | `fGetOrCreate(data: YCreateInput!): Y` (`whereOne` сховано) | `createEntityGetOrCreateResolver` |
| C4 | embedded-масив | `variants` | `plain`: `f(slice): [E!]!`; `connection`: `fThroughConnection(after,before,first,last): EConnection!`; `count`: `fCount: Int!` | `fieldArrayResolver` / `fieldArrayThroughConnectionResolver` / `fieldArrayCountResolver` |
| C5 | будь-яке інше масивне поле | — | `f(slice: SliceInput)` | `fieldArrayResolver` |
| C6 | geospatial | — | `Geospatial…` | звичайні поля: конвертери `…FromMongoToGql`; calculated: без конвертації (`func` повертає GraphQL-формат, див. ?9), масиви — `fieldArrayResolver` |
| C7 | filter `stringified` | — | `fStringified: String` | `fieldFilterStringifiedResolver` |

Field-resolvers (`composeEntityResolvers`) створюються для **кожної** сутності, тип якої є в SDL: tangible, embedded, virtual та їхні representation-версії. Порожні набори не додаються (див. B3).

Дочірні поля та їхні resolvers з'являються лише якщо дія можлива для Y (`actionAllowed`, перевіряється в `checkRepresentationAction`) і дозволена inventory/representation.

Кожен дочірній field-resolver усередині обгортає відповідний Query-resolver `createChildEntity*QueryResolver` через `resolverDecorator`, а для representation-конфігів — через `createCustomResolver('Query', 'childEntity…{Key}')`.

---

## 7. Фільтри, що керують генерацією

| ID | Механізм | Де діє |
|---|---|---|
| G1 | `actionAllowed(entityConfig)` | і в типах, і в resolvers (узгоджено) |
| G2 | `inventory` (`include`/`exclude`, ланцюжок `[Kind, action, entity]`; `include` обмежує на всіх рівнях, `exclude` виключає лише повністю покритий ланцюжок, `exclude: true` — усе) | типи: `checkRepresentationAction` (і для root-дій, і для дочірніх полів); resolvers: кожен creator викликає `checkInventory` і повертає `null`; у runtime ролі перевіряються через `inventoryByRoles` в `executeAuthorisation` |
| G3 | `representation[Key].allow[X]` — список дій | типи + resolvers (через `mergeRepresentationIntoCustom` → custom-дії з назвою `${action}${Key}`) |
| G4 | `custom.{Input,Query,Mutation}` + `serversideConfig.{Query,Mutation}` — «custom» тут означає нестандартні дії, описані вручну (на відміну від стандартних, що генеруються з `actionAttributes`); representation-дії всередині теж перетворюються на custom-дії (G3) | сигнатура: лише tangible; resolver: `createCustomResolver` теж лише для tangible (див. B14); `custom.Subscription` заборонено (лише стандартні та representation-subscriptions) |
| G5 | `manualyUsedEntities` | додає тип, навіть якщо він не досяжний |

Ланцюжок runtime-декораторів: `resolverDecorator` → `transformBefore` (args за суфіксом типу: `CreateInput/UpdateInput/PushIntoInput` → `transformData`; `Where*` → `transformWhere`; `WhereOne*` → `transformWhereOne`; `WhereSourceInput` → `transformWhereSource`) → `authDecorator` (`executeAuthorisation`: inventoryByRoles, filters, staticFilters, personalFilters → `involvedFilters`, `subscriptionEntityNames`) → resolver → `transformAfter` (глобальні id).

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
| **B8** **[виправлено `39794e6e`]** (кеш `checkInventory` — раніше, у `2a2e24d4`) | Глобальний кеш resolvers на рівні модуля не враховує аргументи | `resolvers/composeGqlResolvers/index.ts:22,31` | поза jest другий виклик з **іншим** `generalConfig` повертає resolvers першого (`a.resolvers === b.resolvers`). Схожі глобальні кеші без прив'язки до конфігу: `mergeRepresentationIntoCustom` (ключ — `variant`), `parseEntityName`, `composeRepresentationConfig` (ключ — ім'я), `checkInventory` (ключ — `inventory.name`), `resolverDecorator`, subscription creators |
| **B8a** **[виправлено `39794e6e`]** | (знайдено під час виправлення B8) `resolverDecorator` кешував перетворювачі аргументів за ключем з імен і типів аргументів **без імені сутності**, тож поза jest resolvers однієї дії для всіх сутностей перетворювали аргументи з конфігом першої | `resolvers/utils/resolverDecorator/index.ts` | напр. глобальні id relational/duplex-полів у `where` другої сутності не розкодовувалися; тепер перетворювачі складаються для кожного resolver-а окремо |

## 9. Помилки, встановлені читанням коду 📖

| ID | Суть | Місце |
|---|---|---|
| **B9** **[виправлено `226010ff`]** | `composeStandardMutationResolver` повторює **будь-яку** помилку 7 разів (backoff ≈ 6,3 с), навіть валідаційну, а наприкінці кидає `new Error(err)`, через що втрачаються тип і повідомлення (`"Error: TypeError: …"`). Без `transactions` повторюються неідемпотентні часткові записи. Для `workOutMutations` саме це виправлено в `3c87337`, а стандартні мутації лишилися з тією ж поведінкою | `resolvers/mutations/composeStandardMutationResolver/index.ts:101-245` |
| **B10** **[виправлено `dc922b25`]** | Коли задано `representation`, `mergeRepresentationIntoCustom` **перезаписує `custom.Subscription`** представницькими subscription-ами. Custom-підписки до того ж не валідуються | `src/utils/mergeRepresentationIntoCustom/index.ts:212-217` |
| B11 **[виправлено `e8b906de`]** | `prev.includes(entityName)`, а в масив потрапляє `entityName2` (опечатка: дублікати, перевірка не працює як задумано) | `mergeRepresentationIntoCustom/index.ts:112` |
| B12 **[виправлено `e8b906de`]** | `composeActionSignature`: якщо у дії не лишилося аргументів, функція виходить **до** `fillEntityTypeDic`, і тип повернення може не потрапити в SDL. Зараз для стандартних дій це недосяжно (завжди є `token`/`where`), але це латентна помилка | `src/types/composeActionSignature.ts:69` |
| B13 **[виправлено `e8b906de`]** | `composeChildActionSignature` повертає або рядок аргументів, або повну сигнатуру `  name: type` (коли аргументів немає); виклики вставляють результат у `(...)`, і SDL стане невалідним | `src/types/composeChildActionSignature.ts:74` vs `:82` |
| B14 **[виправлено `e8b906de`]** | Resolvers для custom-дій створюються для всіх сутностей, а сигнатури в SDL — лише для tangible. Якщо custom `specificName` поверне непорожнє ім'я для embedded/virtual, `makeExecutableSchema` впаде (resolver без поля) | `composeGqlResolvers/index.ts:83` vs `composeGqlTypes.ts:96` |
| B15 **[виправлено `e8b906de`]** (тексти для `prepareBulkData` і `finalResult` — у `226010ff`) | Скопійовані тексти помилок: `getPrevious have to be setted` для `prepareBulkData`, `report have to be setted` для `finalResult`, `"UpdatedPayload"` у composer для `CreatedOrDeletedPayload` | `composeStandardMutationResolver/index.ts:186,265`; `composeCreatedOrDeletedPayloadVirtualConfig.ts:25` |
| B16 **[виправлено `e8b906de`]** | TS-типи: `ArrayCalculatedField.func` повертає `GraphqlScalar` замість масиву; у union `CalculatedField` двічі повторюється Geospatial; `EmbeddedEntityConfig` виключає `calculatedFields`, а `SimplifiedEmbeddedEntityConfig` їх дозволяє | `src/tsTypes/index.ts:794, 804-807, 839-844` |
| B17 **[виправлено `e8b906de`]** | Дрібниці: у WhereInput для масивного geospatial `_size` немає відступу; коментар «use not required ID in embedded» суперечить `id: ID!`; коментар «only scalar points» у NearInput не відповідає фільтру (усі типи й масиви); `createEntitySortInputType` має недосяжну гілку `if (!fieldLines.length)`; ~~`allowMutations/allowSubscriptions` у `composeGqlTypes` не використовуються~~ (прибрано в `2a2e24d4`); `const all = []` у `fillEntityTypeDic`; `createCloneEntityMutationResolver` має `actionGeneralName: 'updateEntity'` | різні |
| **B18** **[виправлено `e2303727`]** | `copyManyXsWithChildren` має **обов'язковий** `whereOne: [XWhereOneToCopyInput!]!`, а під час виконання використовується той самий `getCommonManyData`, що й у `copyManyXs`. У режимі Б (масивний опозит) можна лише оновлювати існуючі X, не створювати нові копії. У режимі А (скалярний опозит) мутація не працює взагалі: будь-який `whereOne`, навіть `[]`, дає `Needless whereOne arg!`. Детально див. §12 | `types/actionAttributes/copyManyEntitiesWithChildrenMutationAttributes.ts`; `resolvers/mutations/createCopyManyEntitiesMutationResolver/resolverAttributes/getCommonData.ts` |
| **B19** **[виправлено `e2303727`]** | `copyManyXs` / `copyManyXsWithChildren` поєднують записи **за індексом** (`entities[i]` ↔ `whereOnes[i]` ↔ `data[i]` ↔ `whereOne[i]`), хоча Y знаходяться одним `find({ OR: whereOnes })`, а X — `find({ _id: { $in: ids } })` / `find({ OR: whereOne })`. MongoDB не гарантує порядок результатів, тож `data[i]` може потрапити не в ту копію, а в режимі А Y може поєднатися з чужим X (дані скопіюються не туди). Детально див. §12 | `resolvers/mutations/createCopyManyEntitiesMutationResolver/resolverAttributes/getCommonData.ts` |
| **B20** **[виправлено `0fb7a9fe`]** | Умова «є діти» в SDL і під час виконання різна. Виконання (`getNotArrayOppositeDuplexFields`) вважає дітьми лише duplex-поля з власним **`parent: true`** і скалярним опозитом. `actionAllowed` усіх `copy…WithChildren` / `delete…WithChildren` і enum `deleteXWithChildrenOptionsInput` перевіряють лише, що опозит скалярний і не `parent` (`!(array \| parent)`). Наслідок: для сутності з duplex-полем без `parent: true`, але зі скалярним опозитом, генеруються `…WithChildren`-мутації, які дітей не копіюють і не видаляють (працюють як звичайні), а `fieldsToDelete` пропонує поля, які ні на що не впливають | `types/actionAttributes/*WithChildren*MutationAttributes.ts`; `types/inputs/createDeleteEntityWithChildrenOptionsInputType.ts` vs `resolvers/mutations/processFieldToDelete.ts:23-26` |
| **B21** **[виправлено `e2303727`]** | (знайдено під час виправлення Q6) Перетворювач аргументу `whereSource` (`transformWhereOnes`) для масивного duplex-поля `f` викликав `whereSource[f].map(...)`, хоча значення завжди один `YWhereOneInput`; копіювання через масивне duplex-поле падало з `TypeError` | `resolvers/utils/resolverDecorator/transformBefore/transformWhereSource.ts` |

## 10. Неузгодженості (можливо, так задумано: потрібне ваше рішення)

| ID | Спостереження |
|---|---|
| I1 | Subscription-події публікують лише `createEntity`, `updateEntity`, `pushIntoEntity`, `deleteEntity`. Масові операції (`createMany…`, `updateMany/Filtered…`, `deleteMany/Filtered/WithChildren…`, `copy…`) подій не створюють, тож підписники їх пропускають — **так задумано**: масові мутації subscription-події не публікують (див. ?3) |
| I2 | `update/deleteFilteredEntitiesReturnScalar` не мають аргументу `near`, хоча їхні не-скалярні версії мають — **виправлено** `81f368db`: `near` додано до всіх `…ReturnScalar` |
| I3 | `copyManyEntities.whereOne: [X!]` (nullable), а `copyManyEntitiesWithChildren.whereOne: [X!]!`; `copyEntityWithChildren` не має `data`, а `copyEntity` має — **відкладено** для окремого розбору (Q6) |
| I4 | У `XWhereOneInput` унікальне text-поле має тип `ID`, тоді як у `WhereByUnique` і `WhereCompoundOne` воно `String` — **виправлено** `81f368db`: тип `String` |
| I5 | `XCreateInput` **виключає frozen filter-поля**, хоча інші frozen-поля в CreateInput є (freeze має забороняти лише зміну) — `createEntityCreateInputType.ts:101` — **виправлено** `81f368db`: frozen filter-поля є в `XCreateInput` |
| I6 | `PushIntoXInput` бере **всі** filter-поля, включно зі скалярними (решта полів відфільтрована за `array`), а `XPushPositionsInput` filter-поля не містить. Уточнення: filter-поле зберігається як рядок (`type: String`), а `pushInto` формує для нього `$push: { поле: { $each: "<json>" } }`, що MongoDB відхиляє, тож `pushInto` з filter-полем завжди падає — **виправлено** `81f368db`: filter-поля прибрано з `PushIntoXInput` |
| I7 | `freezedFields[X]` робить frozen **рівно** перелічені поля (решта стає `freeze: false`, навіть якщо в базовому конфігу вони frozen); `unfreezedFields` працює навпаки. Якщо задати обидва, переможе останній — **так задумано**: `freezedFields`/`unfreezedFields` повністю перевизначають `freeze` для всіх полів сутності (див. ?5) |
| I8 | `childEntityGetOrCreate` має `actionType: 'Query'`, але може створювати запис: запис даних у Query-полі — **відкладено** для окремого розбору (Q8) |
| I9 | `XDistinctValuesOptionsInput` пропонує всі text/enum-поля (також масивні й неіндексовані), а enum має назву `XTextNamesEnum` — **виправлено** `81f368db`: лише індексовані поля (text: `index` або `unique`, enum: `index`); сутність без таких полів не має `XDistinctValues` і дочірніх `…DistinctValues` |
| I10 | `entityCount`/`entityDistinctValues` не мають `near`. Мабуть, це свідомо, бо `$nearSphere` не працює з count/distinct, але варто підтвердити — **так задумано**: `near` не лише відбирає, а й сортує за віддаленістю, що для count/distinct не потрібно; для відбору без сортування є, напр., `coordinates_withinSphere` |
| I11 | `composeEntityConfig` не перевіряє, що `configName` у relational/duplex веде на **tangible**, і що `oppositeName` опозита вказує назад саме на це поле — **виправлено** `81f368db`: `composeAllEntityConfigs` кидає `TypeError` |

## 11. Питання до вас

- ?1 B1: ~~якою має бути семантика `include` + `exclude` разом?~~ Вирішено в `2a2e24d4`: `include` обмежує на всіх рівнях, `exclude` виключає лише повністю покритий ланцюжок, `exclude: true` виключає все.
- ?2 B3: ~~чи планувалося, що embedded-типи (і tangible без relational/duplex/geo) отримуватимуть field-resolvers? Якщо так, умову в `composeGqlResolvers:254` треба прибрати або розширити, а embedded-типи обходити теж.~~ Вирішено в `124e7e33`: field-resolvers створюються для всіх сутностей, які є в SDL.
- ?3 ~~I1: події для масових мутацій не публікуються навмисно чи через недогляд?~~ Відповідь: навмисно, масові мутації не можуть публікувати subscription-події. Поточна поведінка остаточна.
- ?4 ~~I5/I6: як поводитися з `freeze` для filter-полів у Create і з filter-полями в Push?~~ Відповідь: frozen filter-поля задаються при створенні; filter-поля не пушаться. Виправлено в `81f368db`.
- ?5 ~~I7: `freezedFields`/`unfreezedFields` перевизначають чи доповнюють `freeze`?~~ Відповідь: повністю перевизначають (поточна поведінка остаточна).
- ?6 ~~Чи підтримується кілька різних `generalConfig` в одному процесі?~~ Вирішено в `39794e6e`: кеші прив'язані до об'єктів `generalConfig` / `serversideConfig` / `entityConfig` через `WeakMap`, тож кілька конфігів в одному процесі не змішуються.
- ?7 ~~`cloneEntity`: видалити чи відновити?~~ Відповідь: видалити. Видалено в `81f368db`.
- ?8 ~~Custom Subscription (`custom.Subscription`): це підтримувана функція?~~ Відповідь: ні. Вирішено в `dc922b25`: якщо в `generalConfig.custom` передано `Subscription`, кидається `TypeError`; підтримуються лише стандартні та representation-subscriptions.
- ?9 ~~Формат calculated geospatial-значень~~ Відповідь: `func` повертає GraphQL-формат (`{ lng, lat }`). Виправлено в `da657196`: calculated geospatial-поля більше не проходять через Mongo→GraphQL-конвертер (який повертав `null`), масиви зберігають підтримку `slice`.
- ?10 ~~Фільтрація `wherePayload` за calculated virtual-полями~~ Відповідь: не потрібна. Поточна поведінка (virtual-поля не фільтруються) остаточна.
- ?11 ~~Q6 (I3), аргументи `copy…`~~ Відповідь: варіант Б + перейменування аргументів. Реалізовано в `e2303727` (див. §12.8, §12.9).
- ?12 Q8 (I8), `childXGetOrCreate` як Query: відкладено для окремого розбору.

---

## 12. Розбір Q6 (I3): аргументи `copy…`-мутацій

> Встановлено читанням коду 📖, запуском не перевірено (MongoDB-тести в середовищі аналізу не запускаються).

### 12.1. Що роблять `copy…`-мутації

Копіювання йде вздовж **duplex-зв'язку** між двома tangible-сутностями: `X` (куди копіюємо) має duplex-поле `f` на `Y` (звідки), а в `Y` є поле-опозит `g` на `X`. Копіюються **спільні поля**: поля з однаковими іменами в X і Y, крім самого `f` (`getMatchingFields`).

```
Menu        { name, description, clone ↔ MenuClone.original }
MenuClone   { name, description, original ↔ Menu.clone }
```

`copyMenuClone(whereSource: { original: { id: "<id Menu>" } })` бере `Menu` і переносить його `name` і `description` у `MenuClone`, пов'язаний з цим `Menu`.

### 12.2. Аргументи

| Аргумент | Тип (`copyX`) | Що означає |
|---|---|---|
| `whereSource` (раніше `whereOnes`) | `XWhereSourceInput!`, рівно один ключ `{ f: YWhereOneInput }` | **Звідки** копіювати: вибирає duplex-поле `f` і конкретний запис Y |
| `options` | `copyXOptionsInput` = `{ f: { fieldsToCopy \| fieldsForbiddenToCopy } }` | Обмежує набір спільних полів; ключ має збігатися з ключем `whereOnes` |
| `whereKeyToTarget` (раніше `whereOne`) | `XWhereKeyToTargetInput` | **Куди** копіювати (який існуючий X оновити); потрібен лише в режимі Б |
| `data` | `XUpdateInput` | Додаткові значення для X, що накладаються поверх скопійованих |
| `token` | `String` | Звичайний токен |

### 12.3. Два режими залежно від поля-опозита `g`

- **Режим А: `g` скалярний (1:1).** Якщо `Y.g` уже вказує на X, цей X **оновлюється** скопійованими полями; якщо `Y.g` порожній, **створюється** новий X, пов'язаний з Y. `whereOne` заборонений (`Needless whereOne arg!`), бо X однозначно визначений.
- **Режим Б: `g` масивний (1:N).** Без `whereOne` **створюється** новий X, пов'язаний з Y. З `whereOne` **оновлюється** вказаний X; він має бути вже пов'язаний з Y (`Try to copy to unconnected …`).

Тому `whereKeyToTarget` необов'язковий, а `XWhereKeyToTargetInput` генерується лише тоді, коли в X є duplex-поле зі спільними полями та масивним опозитом (режим Б можливий).

### 12.4. Варіанти мутації

Поточний стан (після `e2303727`):

| Мутація | `whereSource` | `whereKeyToTarget` | `data` | Додатково |
|---|---|---|---|---|
| `copyX` | `XWhereSourceInput!` | `XWhereKeyToTargetInput` (необов'язковий) | `XUpdateInput` | — |
| `copyManyXs` | `[XWhereSourceInput!]!` | `[XWhereKeyToTargetInput!]` (необов'язковий) | `[XUpdateInput!]` | `whereKeyToTarget[i]` і `data[i]` відповідають `whereSource[i]` |
| `copyXWithChildren` | `XWhereSourceInput!` | `XWhereKeyToTargetInput` (необов'язковий) | **немає** (так задумано) | копіює ще й дерево «дітей» (*) |
| `copyManyXsWithChildren` | `[XWhereSourceInput!]!` | `[XWhereKeyToTargetInput!]` (необов'язковий; до `e2303727` був обов'язковим, B18) | **немає** (так задумано) | те саме для масиву |

(*) «Діти» — записи, на які Y посилається через duplex-поля з **`parent: true`** і скалярним полем-опозитом (`getNotArrayOppositeDuplexFields`). Копіюються лише ті дочірні поля, що є спільними для X і Y і в обох сутностях мають `parent: true` зі скалярним опозитом (`composeCreateTree`). Для них рекурсивно створюються копії, пов'язані з новим або оновленим X; при оновленні старі діти X, яких немає в Y, видаляються (`composeCreateTree` + `mixTrees`). Поля без `parent: true` дітьми не вважаються: запис, на який вони посилаються, не копіюється (і не видаляється в `delete…WithChildren`).

### 12.5. Неузгодженість 1: `whereOne` обов'язковий у `copyManyXsWithChildren` (B18, виправлено в `e2303727`; нижче — опис до виправлення, зі старими назвами)

`[XWhereOneToCopyInput!]!` змушує завжди передавати `whereOne`, а виконання спільне з `copyManyXs` (`getCommonManyData`):
- **режим Б:** можна лише оновлювати існуючі X, масово створити нові копії з дітьми неможливо (хоча `copyXWithChildren` для одного запису вміє);
- **режим А:** мутація **не працює взагалі**: будь-яке значення `whereOne` (навіть `[]`) дає `Needless whereOne arg!`, а `[]` ще й не пройде перевірку довжини проти `whereOnes`.

Проблема виникає, коли в X є і duplex-поле з масивним опозитом (тому `whereOne` є в сигнатурі), і duplex-поле зі скалярним, через яке копіюють.

### 12.6. Неузгодженість 2: `data` немає у `…WithChildren`

`copyX`/`copyManyXs` дозволяють `data`, `…WithChildren` — ні. Одного додавання аргументу мало: `getCommonData` читає `args.data` і враховує його при перевірці прав (`checkData`), але `prepareBulkData` у `…WithChildren` будує запис лише з дерева копії й `data` не застосовує, тож треба доробити й його.

### 12.7. Пов'язані знахідки

1. **`data` має тип `XUpdateInput` і при створенні копії.** Через це frozen-поля новій копії через `data` не задати (хоча при звичайному створенні можна, після Q1), а обов'язкові поля X, яких немає серед спільних, не перевіряються схемою — помилка з'явиться лише під час запису. Для створення логічніший `XCreateInput`, але той самий аргумент працює й для оновлення.
2. **Поєднання записів за індексом у `copyManyXs` / `copyManyXsWithChildren` (B19).** Y знаходяться одним `find({ OR: whereOnes })`, X — `find({ _id: { $in: ids } })` або `find({ OR: whereOne })`, а далі код поєднує `entities[i]` ↔ `whereOnes[i]` ↔ `data[i]` ↔ `whereOne[i]`. MongoDB не гарантує порядок результатів `find`, тож `data[i]` може потрапити не в ту копію, а в режимі А Y може поєднатися з чужим X. У режимі Б хибний порядок швидше дасть помилку `Try to copy to unconnected …`.

### 12.8. Перейменування аргументів (реалізовано в `e2303727`)

Нинішні назви описують форму аргументу, а не роль: `whereOnes` (джерело, рівно один ключ) і `whereOne` (ціль) різняться однією літерою, хоча означають протилежне. Погоджено перейменувати:

| Зараз | Нова назва аргументу | Зараз тип | Новий тип |
|---|---|---|---|
| `whereOnes` | `whereSource` | `XCopyWhereOnesInput` | `XWhereSourceInput` |
| `whereOne` | `whereKeyToTarget` | `XWhereOneToCopyInput` | `XWhereKeyToTargetInput` |

У `copyMany…` назви лишаються в однині з масивним типом, як у `updateManyXs(whereOne: [..])`.

Що зачепить: 4 attributes-файли `copy…`, 2 input-генератори (`createEntityCopyWhereOnesInputType`, `createEntityWhereOneToCopyInputType`), 4 resolver-файли (`args.whereOnes` / `args.whereOne`), `resolverDecorator` (суфікси типів `CopyWhereOnesInput`, `WhereOneToCopyInput`) і `transformWhereOnes`; `src/client` бере назви з attributes. Це зміна API для клієнтів.

### 12.9. Варіанти рішення (обрано **Б**, реалізовано в `e2303727`)

- **А. Вирівняти:** `whereOne` необов'язковий і в `copyManyXsWithChildren`; додати `data` до обох `…WithChildren` (з реалізацією в `prepareBulkData`); виправити поєднання за індексом (впорядковувати результати `find` за `whereOnes`/`whereOne`). Тип `data` лишається `XUpdateInput`.
- **Б. Лише виправити помилки:** `whereOne` необов'язковий у `copyManyXsWithChildren` і поєднання за індексом; `data` у `…WithChildren` не додаємо (так задумано).
- **В. Як А або Б, але з окремими `data` для створення (`XCreateInput`) та оновлення.** Найповніше рішення, змінює сигнатури всіх `copy…`.
- **Г. Інше.** Наприклад, якщо обов'язковий `whereOne` у `copyManyXsWithChildren` свідомий — пояснення для документу.

**Рішення:** варіант Б. `whereKeyToTarget` у `copyManyXsWithChildren` необов'язковий (B18), поєднання записів у `copyMany…` зберігає порядок `whereSource` / `whereKeyToTarget` (B19: кожен запис вибирається окремо, результати `$in` впорядковуються за `ids`); `data` у `…WithChildren` не додається. Разом з цим перейменовано аргументи (§12.8) і виправлено B21.

