import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import { toKeysetCursor } from '../utils/keyset/keysetCursor';

// A cursor of a connection keeps the values of the sort keys of its entity (keyset): the next page continues
// right after them whatever happens to the data. "near" is sorted by the distance, "search" by the relevance.

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
    intFields: [{ name: 'rank', index: true }],
    geospatialFields: [{ name: 'position', geospatialType: 'Point', index: true }],
  },
  {
    name: 'Article',
    type: 'tangible',
    textFields: [{ name: 'title', weight: 1 }],
    intFields: [{ name: 'rank', index: true }],
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
  await mongooseConn.connection.db.collection('article_things').deleteMany({});
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

  describe('"near" pages by the distance', () => {
    const near = 'near: { geospatialField: position, coordinates: { lng: 30.5, lat: 50.4 } }';

    const createPlace = async (label: string, lng: number, rank = 0): Promise<string> => {
      const data = await run(
        `mutation { createPlace(data: { label: "${label}", rank: ${rank}, position: { lng: ${lng}, lat: 50.4 } }) { id } }`,
      );

      return data.createPlace.id;
    };

    const readPlaces = async (args: string) => {
      const data = await run(
        `{ PlacesThroughConnection(${args}) { pageInfo { startCursor endCursor hasNextPage hasPreviousPage } edges { node { id label } } } }`,
      );

      const { edges, pageInfo } = data.PlacesThroughConnection;

      return {
        labels: edges.map(({ node: { label } }) => label) as string[],
        ids: edges.map(({ node: { id } }) => id) as string[],
        ...pageInfo,
      };
    };

    const readAllPlaces = async (args: string, backward = false): Promise<string[]> => {
      const result: string[] = [];

      let cursor = '';

      for (let i = 0; i < 20; i += 1) {
        const page = await readPlaces(
          backward
            ? `${args}, last: 2${cursor ? `, before: "${cursor}"` : ''}`
            : `${args}, first: 2${cursor ? `, after: "${cursor}"` : ''}`,
        );

        if (backward) {
          result.unshift(...page.labels);
        } else {
          result.push(...page.labels);
        }

        if (!(backward ? page.hasPreviousPage : page.hasNextPage)) return result;

        cursor = backward ? page.startCursor : page.endCursor;
      }

      throw new TypeError('Too many pages!');
    };

    beforeEach(async () => {
      for (const [label, lng, rank] of [
        ['a', 30.5, 3],
        ['b', 30.6, 1],
        ['c', 30.5, 2],
        ['d', 30.6, 3],
        ['e', 30.5, 1],
        ['f', 30.7, 2],
        ['g', 30.8, 1],
      ] as const) {
        await createPlace(label, lng, rank);
      }
    });

    test('should page forward and backward through equal distances', async () => {
      const expected = ['a', 'c', 'e', 'b', 'd', 'f', 'g'];

      expect(await readAllPlaces(near)).toEqual(expected);
      expect(await readAllPlaces(near, true)).toEqual(expected);

      expect(await readAllPlaces(`${near}, sort: { sortBy: [rank_DESC] }`)).toEqual([
        'd',
        'a',
        'f',
        'c',
        'g',
        'e',
        'b',
      ]);

      expect(await readAllPlaces(`${near}, sort: { sortBy: [rank_DESC] }`, true)).toEqual([
        'd',
        'a',
        'f',
        'c',
        'g',
        'e',
        'b',
      ]);
    });

    test('should respect "maxDistance" and "minDistance"', async () => {
      // 30.6 is about 7.1 km away from 30.5 at the latitude 50.4
      expect(await readAllPlaces(near.replace(' }', ' }, maxDistance: 10000'))).toEqual([
        'a',
        'c',
        'e',
        'b',
        'd',
      ]);

      expect(await readAllPlaces(near.replace(' }', ' }, minDistance: 1000'))).toEqual([
        'b',
        'd',
        'f',
        'g',
      ]);
    });

    test('should continue after the cursor entity that is deleted or moved', async () => {
      const page1 = await readPlaces(`${near}, first: 3`);

      expect(page1.labels).toEqual(['a', 'c', 'e']);

      await run(`mutation { deletePlace(whereOne: { id: "${page1.ids[2]}" }) { id } }`);

      const page2 = await readPlaces(`${near}, first: 2, after: "${page1.endCursor}"`);

      expect(page2.labels).toEqual(['b', 'd']);
      expect(page2.hasPreviousPage).toBe(true);

      await run(
        `mutation { updatePlace(whereOne: { id: "${page2.ids[1]}" }, data: { position: { lng: 30.9, lat: 50.4 } }) { id } }`,
      );

      const page3 = await readPlaces(`${near}, first: 2, after: "${page2.endCursor}"`);

      expect(page3.labels).toEqual(['f', 'g']);
      expect(page3.hasNextPage).toBe(true);
    });

    test('should ignore a cursor with an incorrect distance', async () => {
      const page1 = await readPlaces(`${near}, first: 2`);

      const order = {
        sortBy: ['position_distance_ASC', 'id_ASC'],
        near: ['position', 30.5, 50.4] as [string, number, number],
      };

      const id = new mongoose.Types.ObjectId();

      // a cursor of the very order is accepted
      expect((await readPlaces(`${near}, first: 2, after: "${page1.endCursor}"`)).labels).toEqual([
        'e',
        'b',
      ]);

      for (const distance of ['far', null, -1, Infinity]) {
        const cursor = toKeysetCursor(order, [distance, id]);

        const after = await readPlaces(`${near}, first: 2, after: "${cursor}"`);

        expect(after.labels).toEqual(['a', 'c']);

        const before = await readPlaces(`${near}, last: 2, before: "${cursor}"`);

        expect(before.labels).toEqual(['f', 'g']);
      }
    });

    test('should ignore a cursor of another point', async () => {
      const page1 = await readPlaces(`${near}, first: 2`);

      const page2 = await readPlaces(
        `near: { geospatialField: position, coordinates: { lng: 30.8, lat: 50.4 } }, first: 2, after: "${page1.endCursor}"`,
      );

      expect(page2.labels).toEqual(['g', 'f']);
      expect(page2.hasPreviousPage).toBe(false);
    });
  });

  describe('"search" pages by the relevance', () => {
    const titles = [
      ['pizza', 1],
      ['pizza pasta salad', 2],
      ['pizza pizza', 1],
      ['pasta', 3],
      ['pizza', 2],
      ['pizza bar', 3],
      ['pizza pizza pizza', 2],
      ['pizza', 3],
    ] as const;

    const ids: string[] = [];

    beforeEach(async () => {
      ids.length = 0;

      for (const [title, rank] of titles) {
        const data = await run(
          `mutation { createArticle(data: { title: "${title}", rank: ${rank} }) { id } }`,
        );

        ids.push(data.createArticle.id);
      }
    });

    // "<title>/<rank>" of the articles in the order of MongoDB: by the score and the given keys
    const sortedByScore = async (search: string, sort: Record<string, 1 | -1>) => {
      const docs = await mongooseConn.connection.db
        .collection('article_things')
        .aggregate([
          { $match: { $text: { $search: search } } },
          { $set: { score: { $meta: 'textScore' } } },
          { $sort: { score: -1, ...sort } },
        ])
        .toArray();

      return docs.map(({ title, rank }) => `${title}/${rank}`);
    };

    const readArticles = async (args: string) => {
      const data = await run(
        `{ ArticlesThroughConnection(${args}) { pageInfo { startCursor endCursor hasNextPage hasPreviousPage } edges { node { id title rank } } } }`,
      );

      const { edges, pageInfo } = data.ArticlesThroughConnection;

      return {
        items: edges.map(({ node: { title, rank } }) => `${title}/${rank}`) as string[],
        ids: edges.map(({ node: { id } }) => id) as string[],
        ...pageInfo,
      };
    };

    const readAllArticles = async (args: string, backward = false): Promise<string[]> => {
      const result: string[] = [];

      let cursor = '';

      for (let i = 0; i < 20; i += 1) {
        const page = await readArticles(
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

    test('should page forward and backward by the relevance and the id from the newest', async () => {
      const expected = await sortedByScore('pizza', { _id: -1 });

      // equal scores exist ("pizza" three times)
      expect(expected.filter((item) => item.startsWith('pizza/'))).toHaveLength(3);
      expect(expected).toHaveLength(7);

      expect(await readAllArticles('search: "pizza"')).toEqual(expected);
      expect(await readAllArticles('search: "pizza"', true)).toEqual(expected);

      // the list query has the same order
      const list = await run('{ Articles(search: "pizza") { title rank } }');

      expect(list.Articles.map(({ title, rank }) => `${title}/${rank}`)).toEqual(expected);
    });

    test('should sort by the relevance with other keys', async () => {
      const expected = await sortedByScore('pizza', { rank: 1, _id: 1 });

      const sort = 'sort: { sortBy: [relevance_DESC, rank_ASC] }';

      expect(await readAllArticles(`search: "pizza", ${sort}`)).toEqual(expected);
      expect(await readAllArticles(`search: "pizza", ${sort}`, true)).toEqual(expected);

      const list = await run(`{ Articles(search: "pizza", ${sort}) { title rank } }`);

      expect(list.Articles.map(({ title, rank }) => `${title}/${rank}`)).toEqual(expected);
    });

    test('should page "search" with "sort" without the relevance by the sort keys', async () => {
      const forward = await readAllArticles('search: "pizza", sort: { sortBy: [rank_DESC] }');

      expect(forward.map((item) => item.split('/')[1])).toEqual([
        '3',
        '3',
        '2',
        '2',
        '2',
        '1',
        '1',
      ]);
      expect(await readAllArticles('search: "pizza", sort: { sortBy: [rank_DESC] }', true)).toEqual(
        forward,
      );
    });

    test('should ignore "relevance" without "search"', async () => {
      const all = await readAllArticles('sort: { sortBy: [relevance_DESC] }');

      // by the id ("id_ASC" is the sort when no order is given)
      expect(all).toEqual(titles.map(([title, rank]) => `${title}/${rank}`));

      const list = await run(
        '{ Articles(sort: { sortBy: [relevance_DESC, rank_DESC] }) { rank } }',
      );

      expect(list.Articles.map(({ rank }) => rank)).toEqual([3, 3, 3, 2, 2, 2, 1, 1]);
    });

    test('should continue after the cursor entity that is deleted or changed', async () => {
      const expected = await sortedByScore('pizza', { _id: -1 });

      const page1 = await readArticles('search: "pizza", first: 3');

      expect(page1.items).toEqual(expected.slice(0, 3));

      await run(`mutation { deleteArticle(whereOne: { id: "${page1.ids[2]}" }) { id } }`);

      const page2 = await readArticles(`search: "pizza", first: 2, after: "${page1.endCursor}"`);

      expect(page2.items).toEqual(expected.slice(3, 5));
      expect(page2.hasPreviousPage).toBe(true);

      // the changed entity no longer matches the search
      await run(
        `mutation { updateArticle(whereOne: { id: "${page2.ids[1]}" }, data: { title: "pasta" }) { id } }`,
      );

      const page3 = await readArticles(`search: "pizza", first: 2, after: "${page2.endCursor}"`);

      expect(page3.items).toEqual(expected.slice(5, 7));
      expect(page3.hasNextPage).toBe(false);
    });

    test('should ignore a cursor of another search or with an incorrect relevance', async () => {
      const expectedPasta = await sortedByScore('pasta', { _id: -1 });

      const page1 = await readArticles('search: "pizza", first: 2');

      const page2 = await readArticles(`search: "pasta", first: 2, after: "${page1.endCursor}"`);

      expect(page2.items).toEqual(expectedPasta.slice(0, 2));
      expect(page2.hasPreviousPage).toBe(false);

      const order = { sortBy: ['relevance_DESC', 'id_DESC'], search: 'pizza' };

      for (const relevance of ['high', null, -1]) {
        const cursor = toKeysetCursor(order, [relevance, new mongoose.Types.ObjectId()]);

        const page = await readArticles(`search: "pizza", first: 2, after: "${cursor}"`);

        expect(page.hasPreviousPage).toBe(false);
        expect(page.items).toHaveLength(2);
      }
    });
  });
});
