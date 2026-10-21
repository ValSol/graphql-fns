import type { Connection, Model } from 'mongoose';

// indexes of a model are synced once per connection, database and model name: the cached promise
// is shared by concurrent first calls and removed if the sync fails to retry it by the next call
type SyncState = { promise: Promise<void>; init: unknown };

// kept on "globalThis": bundlers (e.g. Next.js) may put several copies of the library into one
// process, and a module-level cache would make every copy sync the same collections again
const CACHE_KEY = Symbol.for('graphql-fns.syncedIndexes');

const syncedIndexes: WeakMap<Connection, Map<string, SyncState>> = ((globalThis as any)[
  CACHE_KEY
] ??= new WeakMap());

// "mongooseConn" is a Connection or a Mongoose instance (its default connection is used)
export const getConnection = (mongooseConn: any): Connection =>
  mongooseConn.connection || mongooseConn;

const getDbName = (connection: Connection): string =>
  connection.db?.databaseName || connection.name || '';

const composeIndexName = ([key, options]: [Record<string, any>, Record<string, any>?]): string =>
  options?.name ||
  Object.entries(key)
    .reduce<string[]>((prev, [k, v]) => [...prev, k, v], [])
    .join('_');

const composeSyncError = async (
  model: Model<any>,
  label: string,
  error: any,
): Promise<TypeError> => {
  const {
    collection: { collectionName },
  } = model;

  // indexes that are still absent after the failed sync are the ones that could not be created
  let indexNames = '';
  try {
    const { toCreate } = await model.diffIndexes({ indexOptionsToCreate: true });
    indexNames = (toCreate as any[]).map((index) => `"${composeIndexName(index)}"`).join(', ');
  } catch {
    // the original error is informative enough
  }

  const syncError = new TypeError(
    `Failed to sync indexes of ${label} (collection "${collectionName}")${
      indexNames ? `, not created: ${indexNames}` : ''
    }: ${error?.message || error}`,
  );

  (syncError as any).cause = error;

  return syncError;
};

const composeProjectionKey = (projection: Record<string, unknown>): string =>
  JSON.stringify(
    Object.entries(projection)
      .map(([key, value]) => [key, value ? 1 : 0])
      .sort(([a], [b]) => String(a).localeCompare(String(b))),
  );

// an index is already dropped by a concurrent sync (e.g. of another instance of the application)
const isIndexNotFound = (error: any): boolean => error?.codeName === 'IndexNotFound';

const isRootWildcardKey = (key: Record<string, unknown>): boolean => {
  const keys = Object.keys(key);

  return keys.length === 1 && keys[0] === '$**';
};

// "syncIndexes" of mongoose compares neither names nor "wildcardProjection", so it takes any root
// wildcard index of the collection for the schema one: every root wildcard index with another
// name or other fields is dropped here, "syncIndexes" creates the schema one again
const dropChangedWildcardIndexes = async (model: Model<any>): Promise<void> => {
  const schemaIndex = model.schema.indexes().find(([key]) => isRootWildcardKey(key));

  // without the schema one a root wildcard index is dropped by "syncIndexes" itself
  if (!schemaIndex) return;

  const [, { name, wildcardProjection = {} } = {}] = schemaIndex;
  const projectionKey = composeProjectionKey(wildcardProjection as Record<string, unknown>);

  for (const dbIndex of await model.collection.indexes()) {
    if (
      isRootWildcardKey(dbIndex.key) &&
      (dbIndex.name !== name ||
        composeProjectionKey(dbIndex.wildcardProjection || {}) !== projectionKey)
    ) {
      try {
        await model.collection.dropIndex(dbIndex.name as string);
      } catch (error) {
        if (!isIndexNotFound(error)) throw error;
      }
    }
  }
};

const runSync = async (model: Model<any>, label: string): Promise<void> => {
  try {
    // the collection is created explicitly: it has to exist before a transaction uses it
    await model.createCollection();
    await dropChangedWildcardIndexes(model);
    // indexes absent in the schema (so in the config) are dropped, the rest are created
    try {
      await model.syncIndexes();
    } catch (error) {
      if (!isIndexNotFound(error)) throw error;

      // the indexes to drop and to create are taken again: one of them is already dropped
      await model.syncIndexes();
    }
  } catch (error) {
    throw await composeSyncError(model, label, error);
  }
};

// collections and indexes are created without a session, so outside of any transaction
const syncModelIndexes = async (
  mongooseConn: any,
  model: Model<any>,
  label: string,
  force = false,
): Promise<void> => {
  const connection = getConnection(mongooseConn);

  let byConnection = syncedIndexes.get(connection);
  if (!byConnection) {
    byConnection = new Map();
    syncedIndexes.set(connection, byConnection);
  }

  const key = `${getDbName(connection)}/${model.modelName}`;

  const state = byConnection.get(key);

  // "connection.dropDatabase()" of mongoose resets "$init" of models: the indexes are gone, so
  // "$init" is restored (to detect the next drop) and the indexes are synced again
  if (!(model as any).$init) {
    // errors of "init" are errors of the following sync
    model.init().catch(() => {});
  }

  const init = (model as any).$init;

  if (state && !force && state.init === init) {
    return state.promise;
  }

  const promise = runSync(model, label);

  const newState = { promise, init };
  byConnection.set(key, newState);

  try {
    await promise;
  } catch (error) {
    if (byConnection.get(key) === newState) {
      byConnection.delete(key);
    }
    throw error;
  }
};

export default syncModelIndexes;
