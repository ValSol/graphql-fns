# Mongoose models: getting models, syncing collections and indexes

> How resolvers get a Mongoose model of an entity, when its collection and indexes are created, and how `initMongooseModels` prepares a database on the start of an application.
> Identifiers: `MM…` facts. Marks: ✅ verified by running code or tests; 📖 conclusion from reading the code only.
> Tests: `src/mongooseModels/indexesRace.mtest.ts`, `src/mongooseModels/initMongooseModels.mtest.ts`.

## 1. Schema and indexes

| ID | Fact |
|---|---|
| MM1 | ✅ `createThingSchema(entityConfig, enums)` builds the schema of a tangible entity with indexes from the config: `index`/`unique` of fields, `counter` (unique `counter_1`), `uniqueCompoundIndexes` (unique `f1_1_f2_1…`), `weight` (one text index named `TextIndex`), geospatial fields (`2dsphere`), plus `createdAt_1` and `updatedAt_1`. More than 64 indexes throw. The schema is cached by the entity name (the first `enums` win). |
| MM2 | ✅ The schema has `autoIndex: false`, the counters schema (`Counter_Variable`, collection `counter_variables`, only `_id` + `seq`) too. Background index building of Mongoose (`Model.init()` → `ensureIndexes`) is never used: it creates indexes asynchronously after the first writes, fails silently (only an `index` event with the error) if the written documents violate a unique index, never drops indexes, and does nothing at all if `autoIndex` is turned off on the connection. |
| MM3 | ✅ `createThingSchema` doesn't register a model on the global `mongoose`, so no model gets onto the default connection with background indexes. |

## 2. Getting a model

| ID | Fact |
|---|---|
| MM4 | ✅ `createMongooseModel(mongooseConn, entityConfig, enums?, force?)` is the only way the library gets a model of an entity: queries, `getPrevious`/`getCommonData` of mutations, `normalizeWhereCompoundOne`, `processFieldToDelete`, `composeCreateTree`, `getShift`, and the write pipeline of mutations: `unwindCore`, `addPeripheryToCore`, `executeBulkItems`. Counters are got by `createCounter(mongooseConn, force?)` (async) in `incCounters`. |
| MM5 | ✅ The model `X_Thing` is registered on the passed `mongooseConn` (`mongooseConn.models[…] \|\| mongooseConn.model(…)`); `mongooseConn` is a `Connection` or a `Mongoose` instance (then its default connection is the cache key). |
| MM6 | ✅ Before the model is returned, `syncModelIndexes` (`src/mongooseModels/syncModelIndexes.ts`) awaits `Model.createCollection()` + `Model.syncIndexes()`. `syncIndexes` drops every index of the collection (except `_id_`) that has no equal index in the schema, i.e. in the config, and creates the missing ones. Equal means the same keys in the same order and the same `unique`, `sparse`, `partialFilterExpression`, `expireAfterSeconds`, `collation`; for a text index the same fields and `weights`. So an index removed from the config, or with changed `unique`/weights, is dropped (and created again if needed). |
| MM7 | ✅ Cache: `WeakMap<Connection, Map<"<dbName>/<modelName>", { promise, init }>>`. The promise is cached, so concurrent first calls (of any resolvers) wait for one sync; on a rejection the entry is removed, so the next call tries again. Different connections and different databases of one connection are synced separately. The cache is kept on `globalThis` under `Symbol.for('graphql-fns.syncedIndexes')`, so several copies of the library in one process (a bundler such as Next.js may put one into every server chunk, e.g. `instrumentation.ts` and each route) share it when they use the same connection object, and a collection is not synced again by every copy ✅ (`syncModelIndexes.test.ts`). |
| MM8 | ✅ Collections and indexes are created without a session, so outside of any transaction. Because a collection created while a transaction is open may conflict with the transaction (📖 not reproduced), `composeStandardMutationResolver` and `workOutMutations` with `transactions` call `syncAllMongooseModels(mongooseConn, generalConfig)` before the first `startTransaction()`: all tangible entities (and counters) are synced once per connection, later it only checks the cache. Without `transactions` models are synced lazily by MM6. |
| MM9 | ✅ `Connection.prototype.dropDatabase()` of Mongoose resets `$init` of the models of the connection. `syncModelIndexes` stores `$init` with the cached promise, restores `$init` if it is missing (by `Model.init()`) and syncs again if it differs, so after `conn.dropDatabase()` the next lazy call recreates the collection and indexes (every time, not only after the first drop). A database dropped by the driver (`conn.db.dropDatabase()`) is not detected: call `initMongooseModels` again. |

## 3. Errors

| ID | Fact |
|---|---|
| MM10 | ✅ If `createCollection`/`syncIndexes` fails, a `TypeError` is thrown with the original error as `cause`: `Failed to sync indexes of "City" entity (collection "city_things"), not created: "name_1_country_1": E11000 duplicate key error …`. The not created indexes are the ones still in `diffIndexes().toCreate` after the failure (name: `options.name` or `key1_dir1_key2_dir2…` as MongoDB names them); counters are named `counters`. The error reaches every request that needs the model (e.g. `{ Cities { … } }` returns it as a GraphQL error) and `initMongooseModels`. |
| MM11 | 📖 `syncIndexes` drops indexes before it creates the missing ones: while an index with changed options is rebuilt (or if its creation fails) the collection has no such index. That's why indexes should be synced on the start of an application (MM12), before any write. |

## 4. `initMongooseModels`

| ID | Fact |
|---|---|
| MM12 | ✅ `initMongooseModels(mongooseConn, generalConfig): Promise<Record<string, Model>>` (exported from the package) syncs every tangible entity of `generalConfig.allEntityConfigs` and, if any entity has `counter`, the counters collection; it returns `{ [entityName]: Model, Counter_Variable?: Model }`. It always syncs (`force`), even models already synced, and refreshes the cache, so later lazy calls (MM6) don't repeat the work. Call it on the start of an application (after connecting) and after a database is dropped by the driver. |
| MM13 | ✅ Only collections of tangible entities of `generalConfig` (`<name>_things`) and `counter_variables` are synced, so only their indexes are dropped or created. Any other collection of the database is never touched, whatever indexes it has: collections of other libraries (e.g. `user`, `session`, … of better-auth, see [better-auth-integration.md](./better-auth-integration.md)), own collections of the application, collections of entities that are not in the config (there is no model for them). |
