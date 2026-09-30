import type syncModelIndexesType from './syncModelIndexes';

// two copies of the module, as a bundler may put into one process (e.g. Next.js server chunks)
const loadCopy = (): typeof syncModelIndexesType => {
  let copy: typeof syncModelIndexesType | undefined;

  jest.isolateModules(() => {
    copy = require('./syncModelIndexes').default;
  });

  return copy as typeof syncModelIndexesType;
};

const composeModel = (calls: string[]) => ({
  modelName: 'Example_Thing',
  collection: { collectionName: 'example_things' },
  $init: Promise.resolve(),
  init: () => Promise.resolve(),
  createCollection: async () => {
    calls.push('createCollection');
  },
  syncIndexes: async () => {
    calls.push('syncIndexes');
  },
});

describe('syncModelIndexes', () => {
  test('copies of the module share the cache of synced models', async () => {
    const calls: string[] = [];
    const connection = { db: { databaseName: 'db' }, name: 'db' };
    const model = composeModel(calls);

    const syncCopy1 = loadCopy();
    const syncCopy2 = loadCopy();

    expect(syncCopy1).not.toBe(syncCopy2);

    await syncCopy1(connection, model as any, '"Example" entity');
    await syncCopy2(connection, model as any, '"Example" entity');

    expect(calls).toEqual(['createCollection', 'syncIndexes']);

    await syncCopy2(connection, model as any, '"Example" entity', true);

    expect(calls).toEqual(['createCollection', 'syncIndexes', 'createCollection', 'syncIndexes']);
  });
});
