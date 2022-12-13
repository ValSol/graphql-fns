// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig, NearInput } from '../../../flowTypes';

const mongoose = require('mongoose');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateManyEntitiesMutationResolver,
} = require('../../mutations/createCreateManyEntitiesMutationResolver');
const { default: toCursor } = require('../utils/toCursor');
const { default: createEntitiesThroughConnectionQueryResolver } = require('./index');

let mongooseConn;

let createdExamples;
let Example;
let examplesThroughConnection;

const generalConfig: GeneralConfig = { allEntityConfigs: {} };
const entityConfig: EntityConfig = {
  name: 'Example',
  type: 'tangible',
  intFields: [
    {
      name: 'num',
    },
  ],
  textFields: [
    {
      name: 'oddEven',
    },
  ],
  geospatialFields: [
    {
      name: 'point',
      geospatialType: 'Point',
    },
  ],
};
const serversideConfig = { transactions: true };

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entities-through-connection-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  const exampleSchema = createThingSchema(entityConfig);
  Example = mongooseConn.model('Example_Thing', exampleSchema);
  await Example.createCollection();

  const createManyExamples = createCreateManyEntitiesMutationResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
  );
  expect(typeof createManyExamples).toBe('function');
  if (!createManyExamples) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

  const data = [
    { num: 0, oddEven: 'even', point: { lng: 50.0, lat: 30.0 } },
    { num: 1, oddEven: 'odd', point: { lng: 50.1, lat: 30.1 } },
    { num: 2, oddEven: 'even', point: { lng: 50.2, lat: 30.2 } },
    { num: 3, oddEven: 'odd', point: { lng: 50.3, lat: 30.3 } },
    { num: 4, oddEven: 'even', point: { lng: 50.4, lat: 30.4 } },
    { num: 5, oddEven: 'odd', point: { lng: 50.5, lat: 30.5 } },
    { num: 6, oddEven: 'even', point: { lng: 50.6, lat: 30.6 } },
    { num: 7, oddEven: 'odd', point: { lng: 50.7, lat: 30.7 } },
    { num: 8, oddEven: 'even', point: { lng: 50.8, lat: 30.8 } },
    { num: 9, oddEven: 'odd', point: { lng: 50.9, lat: 30.9 } },
    { num: 10, oddEven: 'even', point: { lng: 51.0, lat: 31.0 } },
  ];

  createdExamples = await createManyExamples(null, { data }, { mongooseConn }, null, []);

  examplesThroughConnection = createEntitiesThroughConnectionQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
  );
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntitiesThroughConnectionQueryResolver', () => {
  test('should create resolver', async () => {
    for (let i = 0; i < createdExamples.length; i += 1) {
      expect(createdExamples[i].num).toBe(i);
    }

    const examples = await examplesThroughConnection(
      null,
      { first: 3 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(false);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[0].id, 0));
    const lastPos = edges.length - 1;
    expect(endCursor).toBe(toCursor(createdExamples[lastPos].id, lastPos));

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[i]);
      expect(cursor).toBe(toCursor(createdExamples[i].id, i));
    }
    const examples2 = await examplesThroughConnection(
      null,
      { first: 5, after: endCursor },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage2,
        hasPreviousPage: hasPreviousPage2,
        startCursor: startCursor2,
        endCursor: endCursor2,
      },
      edges: edges2,
    } = examples2;

    expect(hasPreviousPage2).toBe(true);
    expect(hasNextPage2).toBe(true);
    expect(startCursor2).toBe(toCursor(createdExamples[lastPos + 1].id, lastPos + 1));
    const lastPos2 = lastPos + edges2.length;
    expect(endCursor2).toBe(toCursor(createdExamples[lastPos2].id, lastPos2));

    expect(edges2.length).toBe(5);

    for (let i = 0; i < edges2.length; i += 1) {
      const { node, cursor } = edges2[i];

      expect(node).toEqual(createdExamples[lastPos + i + 1]);
      expect(cursor).toBe(toCursor(createdExamples[lastPos + i + 1].id, lastPos + i + 1));
    }

    const examples3 = await examplesThroughConnection(
      null,
      { first: 5, after: endCursor2 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage3,
        hasPreviousPage: hasPreviousPage3,
        startCursor: startCursor3,
        endCursor: endCursor3,
      },
      edges: edges3,
    } = examples3;

    expect(hasPreviousPage3).toBe(true);
    expect(hasNextPage3).toBe(false);
    expect(startCursor3).toBe(toCursor(createdExamples[lastPos2 + 1].id, lastPos2 + 1));
    const lastPos3 = lastPos2 + edges3.length;
    expect(endCursor3).toBe(toCursor(createdExamples[lastPos3].id, lastPos3));

    expect(edges3.length).toBe(3);

    for (let i = 0; i < edges3.length; i += 1) {
      const { node, cursor } = edges3[i];

      expect(node).toEqual(createdExamples[lastPos2 + i + 1]);
      expect(cursor).toBe(toCursor(createdExamples[lastPos2 + i + 1].id, lastPos2 + i + 1));
    }

    const examples4 = await examplesThroughConnection(
      null,
      { last: 5, before: startCursor3 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage4,
        hasPreviousPage: hasPreviousPage4,
        startCursor: startCursor4,
        endCursor: endCursor4,
      },
      edges: edges4,
    } = examples4;

    expect(hasPreviousPage4).toBe(true);
    expect(hasNextPage4).toBe(true);

    expect(startCursor4).toBe(toCursor(createdExamples[3].id, 3));
    expect(endCursor4).toBe(toCursor(createdExamples[7].id, 7));

    expect(edges4.length).toBe(5);

    for (let i = 0; i < edges4.length; i += 1) {
      const { node, cursor } = edges4[i];

      expect(node).toEqual(createdExamples[i + 3]);
      expect(cursor).toBe(toCursor(createdExamples[i + 3].id, i + 3));
    }

    const examples5 = await examplesThroughConnection(
      null,
      { last: 5, before: startCursor4 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage5,
        hasPreviousPage: hasPreviousPage5,
        startCursor: startCursor5,
        endCursor: endCursor5,
      },
      edges: edges5,
    } = examples5;

    expect(hasPreviousPage5).toBe(false);
    expect(hasNextPage5).toBe(true);

    expect(startCursor5).toBe(toCursor(createdExamples[0].id, 0));
    expect(endCursor5).toBe(toCursor(createdExamples[2].id, 2));

    expect(edges5.length).toBe(3);

    for (let i = 0; i < edges5.length; i += 1) {
      const { node, cursor } = edges5[i];

      expect(node).toEqual(createdExamples[i]);
      expect(cursor).toBe(toCursor(createdExamples[i].id, i));
    }
  });

  test('should create resolver 2', async () => {
    const examples6 = await examplesThroughConnection(
      null,
      { first: 11 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage6,
        hasPreviousPage: hasPreviousPage6,
        startCursor: startCursor6,
        endCursor: endCursor6,
      },
      edges: edges6,
    } = examples6;

    expect(hasPreviousPage6).toBe(false);
    expect(hasNextPage6).toBe(false);
    expect(startCursor6).toBe(toCursor(createdExamples[0].id, 0));
    expect(endCursor6).toBe(toCursor(createdExamples[10].id, 10));

    expect(edges6.length).toBe(11);

    for (let i = 0; i < edges6.length; i += 1) {
      const { node, cursor } = edges6[i];

      expect(node).toEqual(createdExamples[i]);
      expect(cursor).toBe(toCursor(createdExamples[i].id, i));
    }
  });

  test('should create resolver 3', async () => {
    const examples7 = await examplesThroughConnection(
      null,
      { last: 4 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage7,
        hasPreviousPage: hasPreviousPage7,
        startCursor: startCursor7,
        endCursor: endCursor7,
      },
      edges: edges7,
    } = examples7;

    expect(hasPreviousPage7).toBe(true);
    expect(hasNextPage7).toBe(false);
    expect(startCursor7).toBe(toCursor(createdExamples[7].id, 7));
    expect(endCursor7).toBe(toCursor(createdExamples[10].id, 10));

    expect(edges7.length).toBe(4);

    for (let i = 0; i < edges7.length; i += 1) {
      const { node, cursor } = edges7[i];

      expect(node).toEqual(createdExamples[i + 7]);
      expect(cursor).toBe(toCursor(createdExamples[i + 7].id, i + 7));
    }
  });

  test('should create resolver 4', async () => {
    const examples8 = await examplesThroughConnection(
      null,
      { last: 11 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage8,
        hasPreviousPage: hasPreviousPage8,
        startCursor: startCursor8,
        endCursor: endCursor8,
      },
      edges: edges8,
    } = examples8;

    expect(hasPreviousPage8).toBe(false);
    expect(hasNextPage8).toBe(false);
    expect(startCursor8).toBe(toCursor(createdExamples[0].id, 0));
    expect(endCursor8).toBe(toCursor(createdExamples[10].id, 10));

    expect(edges8.length).toBe(11);

    for (let i = 0; i < edges8.length; i += 1) {
      const { node, cursor } = edges8[i];

      expect(node).toEqual(createdExamples[i]);
      expect(cursor).toBe(toCursor(createdExamples[i].id, i));
    }
  });

  test('should create resolver 5', async () => {
    const after = toCursor('61af380a5c2825441ca07902', 2);

    const examples = await examplesThroughConnection(
      null,
      { first: 3, after },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(false);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[0].id, 0));
    expect(endCursor).toBe(toCursor(createdExamples[2].id, 2));

    expect(edges.length).toBe(3);

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[i]);
      expect(cursor).toBe(toCursor(createdExamples[i].id, i));
    }
  });

  test('should create resolver 6', async () => {
    const before = toCursor('61af380a5c2825441ca07902', 2);

    const examples = await examplesThroughConnection(
      null,
      { last: 3, before },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(true);
    expect(hasNextPage).toBe(false);
    expect(startCursor).toBe(toCursor(createdExamples[8].id, 8));
    expect(endCursor).toBe(toCursor(createdExamples[10].id, 10));

    expect(edges.length).toBe(3);

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[i + 8]);
      expect(cursor).toBe(toCursor(createdExamples[i + 8].id, i + 8));
    }
  });

  test('should create resolver 7', async () => {
    const after = toCursor(createdExamples[1].id, 2);

    const examples = await examplesThroughConnection(
      null,
      { first: 3, after },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(true);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[2].id, 2));
    expect(endCursor).toBe(toCursor(createdExamples[4].id, 4));

    expect(edges.length).toBe(3);

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[i + 2]);
      expect(cursor).toBe(toCursor(createdExamples[i + 2].id, i + 2));
    }
  });

  test('should create resolver with DESC sort', async () => {
    for (let i = 0; i < createdExamples.length; i += 1) {
      expect(createdExamples[i].num).toBe(i);
    }

    const examples = await examplesThroughConnection(
      null,
      { first: 3, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(false);
    expect(hasNextPage).toBe(true);

    expect(startCursor).toBe(toCursor(createdExamples[10].id, 0));
    const lastPos = edges.length - 1;
    expect(endCursor).toBe(toCursor(createdExamples[10 - lastPos].id, lastPos));

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[10 - i]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i].id, i));
    }

    const examples2 = await examplesThroughConnection(
      null,
      { first: 5, after: endCursor, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage2,
        hasPreviousPage: hasPreviousPage2,
        startCursor: startCursor2,
        endCursor: endCursor2,
      },
      edges: edges2,
    } = examples2;

    expect(hasPreviousPage2).toBe(true);
    expect(hasNextPage2).toBe(true);
    expect(startCursor2).toBe(toCursor(createdExamples[10 - lastPos - 1].id, lastPos + 1));
    const lastPos2 = lastPos + edges2.length;
    expect(endCursor2).toBe(toCursor(createdExamples[10 - lastPos2].id, lastPos2));

    expect(edges2.length).toBe(5);

    for (let i = 0; i < edges2.length; i += 1) {
      const { node, cursor } = edges2[i];

      expect(node).toEqual(createdExamples[10 - lastPos - i - 1]);
      expect(cursor).toBe(toCursor(createdExamples[10 - lastPos - i - 1].id, lastPos + i + 1));
    }

    const examples3 = await examplesThroughConnection(
      null,
      { first: 5, after: endCursor2, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage3,
        hasPreviousPage: hasPreviousPage3,
        startCursor: startCursor3,
        endCursor: endCursor3,
      },
      edges: edges3,
    } = examples3;

    expect(hasPreviousPage3).toBe(true);
    expect(hasNextPage3).toBe(false);
    expect(startCursor3).toBe(toCursor(createdExamples[10 - lastPos2 - 1].id, lastPos2 + 1));
    const lastPos3 = lastPos2 + edges3.length;
    expect(endCursor3).toBe(toCursor(createdExamples[10 - lastPos3].id, lastPos3));

    expect(edges3.length).toBe(3);

    for (let i = 0; i < edges3.length; i += 1) {
      const { node, cursor } = edges3[i];

      expect(node).toEqual(createdExamples[10 - lastPos2 - i - 1]);
      expect(cursor).toBe(toCursor(createdExamples[10 - lastPos2 - i - 1].id, lastPos2 + i + 1));
    }

    const examples4 = await examplesThroughConnection(
      null,
      { last: 5, before: startCursor3, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage4,
        hasPreviousPage: hasPreviousPage4,
        startCursor: startCursor4,
        endCursor: endCursor4,
      },
      edges: edges4,
    } = examples4;

    expect(hasPreviousPage4).toBe(true);
    expect(hasNextPage4).toBe(true);

    expect(startCursor4).toBe(toCursor(createdExamples[10 - 3].id, 3));
    expect(endCursor4).toBe(toCursor(createdExamples[10 - 7].id, 7));

    expect(edges4.length).toBe(5);

    for (let i = 0; i < edges4.length; i += 1) {
      const { node, cursor } = edges4[i];

      expect(node).toEqual(createdExamples[10 - i - 3]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i - 3].id, i + 3));
    }

    const examples5 = await examplesThroughConnection(
      null,
      { last: 5, before: startCursor4, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage5,
        hasPreviousPage: hasPreviousPage5,
        startCursor: startCursor5,
        endCursor: endCursor5,
      },
      edges: edges5,
    } = examples5;

    expect(hasPreviousPage5).toBe(false);
    expect(hasNextPage5).toBe(true);

    expect(startCursor5).toBe(toCursor(createdExamples[10].id, 0));
    expect(endCursor5).toBe(toCursor(createdExamples[10 - 2].id, 2));

    expect(edges5.length).toBe(3);

    for (let i = 0; i < edges5.length; i += 1) {
      const { node, cursor } = edges5[i];

      expect(node).toEqual(createdExamples[10 - i]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i].id, i));
    }
  });

  test('should create resolver with DESC sort & dynamic cursor', async () => {
    const after = toCursor(createdExamples[10 - 1].id, 2);

    const examples = await examplesThroughConnection(
      null,
      { first: 3, after, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(true);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[10 - 2].id, 2));
    expect(endCursor).toBe(toCursor(createdExamples[10 - 4].id, 4));

    expect(edges.length).toBe(3);

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[10 - i - 2]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i - 2].id, i + 2));
    }
  });

  test('should create resolver with where filter', async () => {
    for (let i = 0; i < createdExamples.length; i += 1) {
      expect(createdExamples[i].num).toBe(i);
    }

    const examples = await examplesThroughConnection(
      null,
      { first: 1, where: { oddEven: 'even' } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(false);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[0].id, 0));
    const lastPos = edges.length - 1;
    expect(endCursor).toBe(toCursor(createdExamples[lastPos].id, lastPos));

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[i]);
      expect(cursor).toBe(toCursor(createdExamples[i].id, i));
    }

    const examples2 = await examplesThroughConnection(
      null,
      { first: 2, after: endCursor, where: { oddEven: 'even' } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage2,
        hasPreviousPage: hasPreviousPage2,
        startCursor: startCursor2,
        endCursor: endCursor2,
      },
      edges: edges2,
    } = examples2;

    expect(hasPreviousPage2).toBe(true);
    expect(hasNextPage2).toBe(true);
    expect(startCursor2).toBe(toCursor(createdExamples[lastPos + 1 * 2].id, lastPos + 1));
    const lastPos2 = lastPos + edges2.length;
    expect(endCursor2).toBe(toCursor(createdExamples[lastPos2 * 2].id, lastPos2));

    expect(edges2.length).toBe(2);

    for (let i = 0; i < edges2.length; i += 1) {
      const { node, cursor } = edges2[i];
      expect(node.oddEven).toBe('even');
      expect(node).toEqual(createdExamples[lastPos + (i + 1) * 2]);
      expect(cursor).toBe(toCursor(createdExamples[lastPos + (i + 1) * 2].id, lastPos + i + 1));
    }
  });

  test('should create resolver with where filter & dynamic cursor', async () => {
    const after = toCursor(createdExamples[2].id, 2);

    const examples = await examplesThroughConnection(
      null,
      { first: 3, after, where: { oddEven: 'even' } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(true);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[4].id, 2));
    expect(endCursor).toBe(toCursor(createdExamples[8].id, 4));

    expect(edges.length).toBe(3);

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[i * 2 + 4]);
      expect(cursor).toBe(toCursor(createdExamples[i * 2 + 4].id, i + 2));
    }
  });

  test('should create resolver with "near" sort', async () => {
    for (let i = 0; i < createdExamples.length; i += 1) {
      expect(createdExamples[i].num).toBe(i);
    }

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { lng: 51.1, lat: 31.1 },
    };

    const examples = await examplesThroughConnection(
      null,
      { first: 3, near },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(false);
    expect(hasNextPage).toBe(true);

    expect(startCursor).toBe(toCursor(createdExamples[10].id, 0));
    const lastPos = edges.length - 1;
    expect(endCursor).toBe(toCursor(createdExamples[10 - lastPos].id, lastPos));

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[10 - i]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i].id, i));
    }

    const examples2 = await examplesThroughConnection(
      null,
      { first: 5, after: endCursor, near },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage2,
        hasPreviousPage: hasPreviousPage2,
        startCursor: startCursor2,
        endCursor: endCursor2,
      },
      edges: edges2,
    } = examples2;

    expect(hasPreviousPage2).toBe(true);
    expect(hasNextPage2).toBe(true);
    expect(startCursor2).toBe(toCursor(createdExamples[10 - lastPos - 1].id, lastPos + 1));
    const lastPos2 = lastPos + edges2.length;
    expect(endCursor2).toBe(toCursor(createdExamples[10 - lastPos2].id, lastPos2));

    expect(edges2.length).toBe(5);

    for (let i = 0; i < edges2.length; i += 1) {
      const { node, cursor } = edges2[i];

      expect(node).toEqual(createdExamples[10 - lastPos - i - 1]);
      expect(cursor).toBe(toCursor(createdExamples[10 - lastPos - i - 1].id, lastPos + i + 1));
    }

    const examples3 = await examplesThroughConnection(
      null,
      { first: 5, after: endCursor2, near },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage3,
        hasPreviousPage: hasPreviousPage3,
        startCursor: startCursor3,
        endCursor: endCursor3,
      },
      edges: edges3,
    } = examples3;

    expect(hasPreviousPage3).toBe(true);
    expect(hasNextPage3).toBe(false);
    expect(startCursor3).toBe(toCursor(createdExamples[10 - lastPos2 - 1].id, lastPos2 + 1));
    const lastPos3 = lastPos2 + edges3.length;
    expect(endCursor3).toBe(toCursor(createdExamples[10 - lastPos3].id, lastPos3));

    expect(edges3.length).toBe(3);

    for (let i = 0; i < edges3.length; i += 1) {
      const { node, cursor } = edges3[i];

      expect(node).toEqual(createdExamples[10 - lastPos2 - i - 1]);
      expect(cursor).toBe(toCursor(createdExamples[10 - lastPos2 - i - 1].id, lastPos2 + i + 1));
    }

    const examples4 = await examplesThroughConnection(
      null,
      { last: 5, before: startCursor3, near },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage4,
        hasPreviousPage: hasPreviousPage4,
        startCursor: startCursor4,
        endCursor: endCursor4,
      },
      edges: edges4,
    } = examples4;

    expect(hasPreviousPage4).toBe(true);
    expect(hasNextPage4).toBe(true);

    expect(startCursor4).toBe(toCursor(createdExamples[10 - 3].id, 3));
    expect(endCursor4).toBe(toCursor(createdExamples[10 - 7].id, 7));

    expect(edges4.length).toBe(5);

    for (let i = 0; i < edges4.length; i += 1) {
      const { node, cursor } = edges4[i];

      expect(node).toEqual(createdExamples[10 - i - 3]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i - 3].id, i + 3));
    }

    const examples5 = await examplesThroughConnection(
      null,
      { last: 5, before: startCursor4, sort: { sortBy: ['num_DESC'] } },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage5,
        hasPreviousPage: hasPreviousPage5,
        startCursor: startCursor5,
        endCursor: endCursor5,
      },
      edges: edges5,
    } = examples5;

    expect(hasPreviousPage5).toBe(false);
    expect(hasNextPage5).toBe(true);

    expect(startCursor5).toBe(toCursor(createdExamples[10].id, 0));
    expect(endCursor5).toBe(toCursor(createdExamples[10 - 2].id, 2));

    expect(edges5.length).toBe(3);

    for (let i = 0; i < edges5.length; i += 1) {
      const { node, cursor } = edges5[i];

      expect(node).toEqual(createdExamples[10 - i]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i].id, i));
    }
  });

  test('should create resolver with "near" sort & dynamic cursor', async () => {
    const after = toCursor(createdExamples[10 - 1].id, 2);

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { lng: 51.1, lat: 31.1 },
    };

    const examples = await examplesThroughConnection(
      null,
      { first: 3, after, near },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1, oddEven: 1, point: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(true);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(createdExamples[10 - 2].id, 2));
    expect(endCursor).toBe(toCursor(createdExamples[10 - 4].id, 4));

    expect(edges.length).toBe(3);

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(createdExamples[10 - i - 2]);
      expect(cursor).toBe(toCursor(createdExamples[10 - i - 2].id, i + 2));
    }
  });
});
