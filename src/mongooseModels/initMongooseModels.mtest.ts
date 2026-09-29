import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, SimplifiedEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import createCounter from './createCounter';
import createMongooseModel from './createMongooseModel';
import createThingSchema from './createThingSchema';
import initMongooseModels from './initMongooseModels';

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [
      { name: 'code', unique: true },
      { name: 'name', weight: 1 },
    ],
    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  },
  {
    name: 'City',
    type: 'tangible',
    counter: true,
    uniqueCompoundIndexes: [['name', 'country']],
    textFields: [{ name: 'name' }],
    duplexFields: [
      { name: 'country', oppositeName: 'cities', configName: 'Country', required: true },
    ],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);
const generalConfig: GeneralConfig = { allEntityConfigs };

const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, {});
const schema = makeExecutableSchema({ typeDefs, resolvers });

const connections: mongoose.Connection[] = [];

// every test uses a new database through its own connection without background indexes
const connect = async (dbName: string) => {
  const conn = await mongoose
    .createConnection(`mongodb://127.0.0.1:27017/${dbName}`, { autoIndex: false })
    .asPromise();
  await conn.db!.dropDatabase();
  connections.push(conn);

  return conn;
};

const indexNames = async (conn: mongoose.Connection, collectionName: string) =>
  (await conn.db!.collection(collectionName).indexes()).map(({ name }) => name).sort();

const collectionNames = async (conn: mongoose.Connection) =>
  (await conn.db!.listCollections().toArray()).map(({ name }) => name).sort();

const expectedIndexes: Record<string, string[]> = {
  city_things: ['_id_', 'counter_1', 'createdAt_1', 'name_1_country_1', 'updatedAt_1'],
  counter_variables: ['_id_'],
  country_things: ['TextIndex', '_id_', 'code_1', 'createdAt_1', 'updatedAt_1'],
};

const expectIndexes = async (conn: mongoose.Connection) => {
  expect(await collectionNames(conn)).toEqual(Object.keys(expectedIndexes).sort());

  for (const [collectionName, names] of Object.entries(expectedIndexes)) {
    expect(await indexNames(conn, collectionName)).toEqual(names);
  }
};

afterAll(async () => {
  for (const conn of connections) {
    await conn.close();
  }
});

describe('initMongooseModels', () => {
  test('should create collections, sync indexes and drop indexes absent in the config', async () => {
    const conn = await connect('jest-init-models');

    // indexes that are not in the config
    await conn.db!.collection('city_things').createIndex({ name: 1 });
    await conn.db!.collection('counter_variables').createIndex({ seq: 1 });
    // the same keys but not unique
    await conn.db!.collection('country_things').createIndex({ code: 1 });

    const models = await initMongooseModels(conn, generalConfig);

    expect(Object.keys(models).sort()).toEqual(['City', 'Counter_Variable', 'Country']);
    expect(models.City).toBe(conn.models.City_Thing);
    expect(models.Counter_Variable).toBe(conn.models.Counter_Variable);

    await expectIndexes(conn);

    const [codeIndex] = (await conn.db!.collection('country_things').indexes()).filter(
      ({ name }) => name === 'code_1',
    );
    expect(codeIndex.unique).toBe(true);

    // later lazy calls don't sync again
    const citySyncIndexes = jest.spyOn(models.City, 'syncIndexes');
    const counterSyncIndexes = jest.spyOn(models.Counter_Variable, 'syncIndexes');

    await createMongooseModel(conn, allEntityConfigs.City);
    await createCounter(conn);

    expect(citySyncIndexes).not.toHaveBeenCalled();
    expect(counterSyncIndexes).not.toHaveBeenCalled();

    citySyncIndexes.mockRestore();
    counterSyncIndexes.mockRestore();
  });

  test('should throw an error with the entity and index names if an index is not built', async () => {
    const conn = await connect('jest-init-models-duplicates');

    const country = new mongoose.Types.ObjectId();
    await conn.db!.collection('city_things').insertMany([
      { name: 'Kyiv', country, counter: 1 },
      { name: 'Kyiv', country, counter: 2 },
    ]);

    const message =
      'Failed to sync indexes of "City" entity (collection "city_things"), not created: "name_1_country_1": ';

    await expect(initMongooseModels(conn, generalConfig)).rejects.toThrow(message);

    // a request that needs the model gets the same error
    const { errors } = await graphql({
      schema,
      source: '{ Cities { name } }',
      contextValue: { mongooseConn: conn },
    });
    expect(errors?.[0].message).toMatch(message);
    expect(errors?.[0].message).toMatch('E11000');

    // the failed sync is not cached
    await conn.db!.collection('city_things').deleteOne({ counter: 2 });

    const { errors: errors2 } = await graphql({
      schema,
      source: '{ Cities { name } }',
      contextValue: { mongooseConn: conn },
    });
    expect(errors2).toBeUndefined();

    expect(await indexNames(conn, 'city_things')).toEqual(expectedIndexes.city_things);
  });

  test('should sync indexes again after the database is dropped', async () => {
    const conn = await connect('jest-init-models-drop');

    await initMongooseModels(conn, generalConfig);
    await expectIndexes(conn);

    // dropped by the driver: "initMongooseModels" syncs all models again
    await conn.db!.dropDatabase();
    expect(await collectionNames(conn)).toEqual([]);

    await initMongooseModels(conn, generalConfig);
    await expectIndexes(conn);

    // dropped by mongoose (twice): lazy calls sync models again
    for (let i = 0; i < 2; i += 1) {
      await conn.dropDatabase();
      expect(await collectionNames(conn)).toEqual([]);

      await createMongooseModel(conn, allEntityConfigs.City);
      expect(await indexNames(conn, 'city_things')).toEqual(expectedIndexes.city_things);
    }
  });

  test('should sync once for concurrent first calls of every connection', async () => {
    const conn = await connect('jest-init-models-concurrent');
    const conn2 = await connect('jest-init-models-concurrent-2');

    const syncIndexesSpies = [conn, conn2].map((c) =>
      jest.spyOn(c.model('City_Thing', createThingSchema(allEntityConfigs.City)), 'syncIndexes'),
    );

    const models = await Promise.all(
      [conn, conn2, conn, conn2, conn].map((c) => createMongooseModel(c, allEntityConfigs.City)),
    );

    expect(models[0]).toBe(conn.models.City_Thing);
    expect(models[1]).toBe(conn2.models.City_Thing);

    syncIndexesSpies.forEach((spy) => {
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    expect(await indexNames(conn, 'city_things')).toEqual(expectedIndexes.city_things);
    expect(await indexNames(conn2, 'city_things')).toEqual(expectedIndexes.city_things);
  });
});
