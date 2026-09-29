import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

// Indexes have to exist before the first write: a model used first by a write (through
// "executeBulkItems") used to build indexes in background, so documents written before a unique
// index made its building fail silently and the uniqueness was never guaranteed.

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [{ name: 'code', unique: true }],
    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  },
  {
    name: 'City',
    type: 'tangible',
    uniqueCompoundIndexes: [['name', 'country']],
    textFields: [{ name: 'name' }],
    duplexFields: [
      { name: 'country', oppositeName: 'cities', configName: 'Country', required: true },
    ],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);
const generalConfig: GeneralConfig = { allEntityConfigs };

const composeSchema = (serversideConfig: ServersideConfig) => {
  const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);

  return makeExecutableSchema({ typeDefs, resolvers });
};

const connections: mongoose.Connection[] = [];

// every test uses a new database through its own connection; "autoIndex" is often turned off in
// production, then only explicitly synced indexes exist
const connect = async (dbName: string, autoIndex: boolean) => {
  const conn = await mongoose
    .createConnection(`mongodb://127.0.0.1:27017/${dbName}`, { autoIndex })
    .asPromise();
  await conn.db!.dropDatabase();
  connections.push(conn);

  return conn;
};

const createCountry = (schema, conn, code: string, cityNames: string[]) =>
  graphql({
    schema,
    source: `mutation { createCountry(data: { code: "${code}", cities: { create: [${cityNames
      .map((name) => `{ name: "${name}" }`)
      .join(', ')}] } }) { id } }`,
    contextValue: { mongooseConn: conn, pubsub },
  });

const indexNames = async (conn: mongoose.Connection, collectionName: string) =>
  (await conn.db!.collection(collectionName).indexes()).map(({ name }) => name).sort();

afterAll(async () => {
  for (const conn of connections) {
    await conn.close();
  }
});

describe('indexes are built before the first write', () => {
  test.each([
    ['without transactions', false, true, 'jest-indexes-race'],
    ['with transactions', true, true, 'jest-indexes-race-transactions'],
    ['without transactions and "autoIndex"', false, false, 'jest-indexes-race-no-auto'],
    ['with transactions and without "autoIndex"', true, false, 'jest-indexes-race-tr-no-auto'],
  ])(
    'should reject duplicates of the first written entity %s',
    async (_, transactions, autoIndex, dbName) => {
      const conn = await connect(dbName, autoIndex);
      const schema = composeSchema({ transactions });

      const first = await createCountry(schema, conn, 'PL', ['Warsaw']);
      expect(first.errors).toBeUndefined();

      const second = await createCountry(schema, conn, 'UA', ['Kyiv', 'Kyiv']);
      expect(second.errors?.[0].message).toMatch('E11000');

      expect(await indexNames(conn, 'city_things')).toEqual([
        '_id_',
        'createdAt_1',
        'name_1_country_1',
        'updatedAt_1',
      ]);

      expect(await indexNames(conn, 'country_things')).toEqual([
        '_id_',
        'code_1',
        'createdAt_1',
        'updatedAt_1',
      ]);
    },
  );

  test.each([
    ['', true, 'jest-indexes-race-parallel'],
    [' without "autoIndex"', false, 'jest-indexes-race-parallel-no-auto'],
  ])('should reject duplicates of concurrent first requests%s', async (_, autoIndex, dbName) => {
    const conn = await connect(dbName, autoIndex);
    const schema = composeSchema({});

    const results = await Promise.all(
      [1, 2, 3, 4, 5].map((i) => createCountry(schema, conn, 'UA', [`City ${i}`])),
    );

    expect(results.filter(({ errors }) => !errors)).toHaveLength(1);

    const count = await conn.db!.collection('country_things').countDocuments({ code: 'UA' });
    expect(count).toBe(1);
  });
});
