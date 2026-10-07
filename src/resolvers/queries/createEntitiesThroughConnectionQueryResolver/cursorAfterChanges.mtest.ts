import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

// A cursor keeps the position of its entity; when the data before it changes, the position is computed again
// ("getShift"), and the next page has to continue right after the cursor entity.

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Item',
    type: 'tangible',
    intFields: [{ name: 'group', index: true }],
    textFields: [{ name: 'label', index: true }],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);
const generalConfig: GeneralConfig = { allEntityConfigs };
const serversideConfig: ServersideConfig = {};
const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);
const schema = makeExecutableSchema({ typeDefs, resolvers });

let mongooseConn;

const run = async (source: string) => {
  const { data, errors } = await graphql({
    schema,
    source,
    contextValue: { mongooseConn, pubsub },
  });

  if (errors) throw errors[0];

  return data as Record<string, any>;
};

const create = async (group: number, label: string): Promise<string> => {
  const data = await run(
    `mutation { createItem(data: { group: ${group}, label: "${label}" }) { id } }`,
  );

  return data.createItem.id;
};

const readPage = async (
  args: string,
): Promise<{ items: string[]; ids: string[]; endCursor: string }> => {
  const data = await run(
    `{ ItemsThroughConnection(${args}) { pageInfo { endCursor } edges { node { id group label } } } }`,
  );

  const { edges, pageInfo } = data.ItemsThroughConnection;

  return {
    items: edges.map(({ node: { group, label } }) => `${group}${label}`),
    ids: edges.map(({ node: { id } }) => id),
    endCursor: pageInfo.endCursor,
  };
};

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-cursor-after-changes';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

beforeEach(async () => {
  await mongooseConn.connection.db.collection('item_things').deleteMany({});
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('a cursor of "XsThroughConnection" after changes of the data', () => {
  test('should continue a sort by several keys after an entity added before the cursor', async () => {
    // created in an order different from the sort order
    const items = [
      [2, 'a'],
      [1, 'c'],
      [3, 'b'],
      [1, 'a'],
      [2, 'c'],
      [3, 'a'],
      [1, 'b'],
      [2, 'b'],
      [3, 'c'],
    ] as const;

    for (const [group, label] of items) {
      await create(group, label);
    }

    const args = 'sort: { sortBy: [group_ASC, label_ASC] }, first: 4';

    const page1 = await readPage(args);

    expect(page1.items).toEqual(['1a', '1b', '1c', '2a']);

    await create(0, 'z');

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['2b', '2c', '3a', '3b']);
  });

  test('should continue a sort by "id_DESC" after a newer entity added', async () => {
    for (const label of ['a', 'b', 'c', 'd', 'e', 'f']) {
      await create(1, label);
    }

    const args = 'sort: { sortBy: [id_DESC] }, first: 2';

    const page1 = await readPage(args);

    expect(page1.items).toEqual(['1f', '1e']);

    await create(1, 'g');

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['1d', '1c']);
  });

  test('should start from the first page when the cursor entity no longer matches "where"', async () => {
    for (const label of ['a', 'b', 'c', 'd', 'e']) {
      await create(1, label);
    }

    const args = 'where: { group: 1 }, sort: { sortBy: [label_ASC] }, first: 2';

    const page1 = await readPage(args);

    await run(
      `mutation { updateItem(whereOne: { id: "${page1.ids[1]}" }, data: { group: 2 }) { id } }`,
    );

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['1a', '1c']);
  });

  test('should start from the first page when the cursor entity is deleted', async () => {
    for (const label of ['a', 'b', 'c', 'd', 'e']) {
      await create(1, label);
    }

    const args = 'sort: { sortBy: [label_ASC] }, first: 2';

    const page1 = await readPage(args);

    await run(`mutation { deleteItem(whereOne: { id: "${page1.ids[1]}" }) { id } }`);

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['1a', '1c']);
  });
});
