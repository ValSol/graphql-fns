import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

// A cursor of a sorted connection keeps the values of the sort keys of its entity (keyset): the next page
// continues right after them whatever happens to the data. A cursor of "near" keeps the position of its entity;
// when the data before it changes, the position is computed again ("getShift").

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Item',
    type: 'tangible',
    intFields: [{ name: 'group', index: true }],
    textFields: [{ name: 'label', index: true }],
  },
  {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'label' }],
    geospatialFields: [{ name: 'position', geospatialType: 'Point', index: true }],
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

const createWithoutLabel = async (group: number): Promise<string> => {
  const data = await run(`mutation { createItem(data: { group: ${group} }) { id } }`);

  return data.createItem.id;
};

type Page = {
  items: string[];
  ids: string[];
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const readPage = async (args: string): Promise<Page> => {
  const data = await run(
    `{ ItemsThroughConnection(${args}) { pageInfo { startCursor endCursor hasNextPage hasPreviousPage } edges { node { id group label } } } }`,
  );

  const { edges, pageInfo } = data.ItemsThroughConnection;

  return {
    items: edges.map(({ node: { group, label } }) => `${group}${label ?? '-'}`),
    ids: edges.map(({ node: { id } }) => id),
    ...pageInfo,
  };
};

// reads all the pages forward or backward
const readAll = async (args: string, backward = false): Promise<string[]> => {
  const result: string[] = [];

  let cursor = '';

  for (let i = 0; i < 20; i += 1) {
    const page = await readPage(
      backward
        ? `${args}, last: 2${cursor ? `, before: "${cursor}"` : ''}`
        : `${args}, first: 2${cursor ? `, after: "${cursor}"` : ''}`,
    );

    if (backward) {
      result.unshift(...page.items);
    } else {
      result.push(...page.items);
    }

    if (!(backward ? page.hasPreviousPage : page.hasNextPage)) return result;

    cursor = backward ? page.startCursor : page.endCursor;
  }

  throw new TypeError('Too many pages!');
};

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-cursor-after-changes';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

beforeEach(async () => {
  await mongooseConn.connection.db.collection('item_things').deleteMany({});
  await mongooseConn.connection.db.collection('place_things').deleteMany({});
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

  test('should continue after the cursor entity that no longer matches "where"', async () => {
    for (const label of ['a', 'b', 'c', 'd', 'e']) {
      await create(1, label);
    }

    const args = 'where: { group: 1 }, sort: { sortBy: [label_ASC] }, first: 2';

    const page1 = await readPage(args);

    await run(
      `mutation { updateItem(whereOne: { id: "${page1.ids[1]}" }, data: { group: 2 }) { id } }`,
    );

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['1c', '1d']);
    expect(page2.hasPreviousPage).toBe(true);
  });

  test('should continue after the cursor entity that is deleted', async () => {
    for (const label of ['a', 'b', 'c', 'd', 'e']) {
      await create(1, label);
    }

    const args = 'sort: { sortBy: [label_ASC] }, first: 2';

    const page1 = await readPage(args);

    await run(`mutation { deleteItem(whereOne: { id: "${page1.ids[1]}" }) { id } }`);

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['1c', '1d']);
  });

  test('should give exact "hasPreviousPage" after the entities before the cursor are deleted', async () => {
    for (const label of ['a', 'b', 'c', 'd']) {
      await create(1, label);
    }

    const args = 'sort: { sortBy: [label_ASC] }, first: 2';

    const page1 = await readPage(args);

    for (const id of page1.ids) {
      await run(`mutation { deleteItem(whereOne: { id: "${id}" }) { id } }`);
    }

    const page2 = await readPage(`${args}, after: "${page1.endCursor}"`);

    expect(page2.items).toEqual(['1c', '1d']);
    expect(page2.hasPreviousPage).toBe(false);
    expect(page2.hasNextPage).toBe(false);
  });

  test('should page through equal values and missing values in both directions', async () => {
    for (const [group, label] of [
      [2, 'b'],
      [1, null],
      [2, null],
      [1, 'a'],
      [1, 'b'],
      [2, 'a'],
      [1, 'a'],
      [2, null],
    ] as const) {
      if (label === null) {
        await createWithoutLabel(group);
      } else {
        await create(group, label);
      }
    }

    // missing values come first in ASC and last in DESC
    const asc = ['1-', '2-', '2-', '1a', '1a', '2a', '1b', '2b'];

    expect((await readAll('sort: { sortBy: [label_ASC] }')).map((item) => item.slice(1))).toEqual(
      asc.map((item) => item.slice(1)),
    );

    expect(await readAll('sort: { sortBy: [label_ASC, group_ASC] }')).toEqual([
      '1-',
      '2-',
      '2-',
      '1a',
      '1a',
      '2a',
      '1b',
      '2b',
    ]);

    expect(await readAll('sort: { sortBy: [label_DESC, group_ASC] }')).toEqual([
      '1b',
      '2b',
      '1a',
      '1a',
      '2a',
      '1-',
      '2-',
      '2-',
    ]);

    // every entity once
    for (const sort of ['label_ASC', 'label_DESC', 'group_DESC, label_ASC']) {
      const forward = await readAll(`sort: { sortBy: [${sort}] }`);
      const backward = await readAll(`sort: { sortBy: [${sort}] }`, true);

      expect(backward).toEqual(forward);
      expect([...forward].sort()).toEqual([...asc].sort());
    }
  });

  test('should page by a sort with a repeated field as MongoDB sorts by it', async () => {
    for (const label of ['b', 'd', 'a', 'c']) {
      await create(1, label);
    }

    // the field takes the direction of its last key
    expect(await readAll('sort: { sortBy: [label_ASC, label_DESC] }')).toEqual([
      '1d',
      '1c',
      '1b',
      '1a',
    ]);

    expect(await readAll('sort: { sortBy: [label_ASC, label_DESC] }', true)).toEqual([
      '1d',
      '1c',
      '1b',
      '1a',
    ]);
  });

  test('should ignore a cursor of another sort', async () => {
    for (const label of ['a', 'b', 'c', 'd']) {
      await create(1, label);
    }

    const page1 = await readPage('sort: { sortBy: [label_ASC] }, first: 2');

    const page2 = await readPage(
      `sort: { sortBy: [label_DESC] }, first: 2, after: "${page1.endCursor}"`,
    );

    expect(page2.items).toEqual(['1d', '1c']);
    expect(page2.hasPreviousPage).toBe(false);
  });

  test('should keep the order of the places at the same distance of "near"', async () => {
    const ids: string[] = [];

    for (const [label, lng] of [
      ['a', 30.5],
      ['b', 30.6],
      ['c', 30.5],
      ['d', 30.6],
      ['e', 30.5],
      ['f', 30.7],
    ] as const) {
      const data = await run(
        `mutation { createPlace(data: { label: "${label}", position: { lng: ${lng}, lat: 50.4 } }) { id } }`,
      );

      ids.push(data.createPlace.id);
    }

    const near = 'near: { geospatialField: position, coordinates: { lng: 30.5, lat: 50.4 } }';

    const labels: string[] = [];

    let after = '';

    for (let i = 0; i < 3; i += 1) {
      const data = await run(
        `{ PlacesThroughConnection(${near}, first: 2${after ? `, after: "${after}"` : ''}) { pageInfo { endCursor } edges { node { label } } } }`,
      );

      const { edges, pageInfo } = data.PlacesThroughConnection;

      labels.push(...edges.map(({ node: { label } }) => label));

      after = pageInfo.endCursor;
    }

    // by the distance and then by the id (the order of creation)
    expect(labels).toEqual(['a', 'c', 'e', 'b', 'd', 'f']);

    const list = await run(`{ Places(${near}, pagination: { skip: 1, first: 3 }) { label } }`);

    expect(list.Places.map(({ label }) => label)).toEqual(['c', 'e', 'b']);
  });
});
