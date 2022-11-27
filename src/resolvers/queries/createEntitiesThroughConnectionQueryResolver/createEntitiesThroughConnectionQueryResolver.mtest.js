// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateManyEntitiesMutationResolver,
} = require('../../mutations/createCreateManyEntitiesMutationResolver');
const { default: createEntitiesThroughConnectionQueryResolver } = require('./index');
const { default: toCursor } = require('./toCursor');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entities-through-connection-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createCreateManyEntitiesMutationResolver', () => {
  const generalConfig: GeneralConfig = { entityConfigs: {} };

  test('should create mutation add entity resolver', async () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'num',
        },
      ],
    };

    const exampleSchema = createThingSchema(entityConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.createCollection();

    const serversideConfig = { transactions: true };
    const createManyExamples = createCreateManyEntitiesMutationResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createManyExamples).toBe('function');
    if (!createManyExamples) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = [
      { num: 0 },
      { num: 1 },
      { num: 2 },
      { num: 3 },
      { num: 4 },
      { num: 5 },
      { num: 6 },
      { num: 7 },
      { num: 8 },
      { num: 9 },
      { num: 10 },
    ];

    const createdExamples = await createManyExamples(null, { data }, { mongooseConn }, null, []);

    for (let i = 0; i < createManyExamples.length; i += 1) {
      expect(createdExamples[i].num).toBe(i);
    }

    const examplesThroughConnection = createEntitiesThroughConnectionQueryResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
    );

    const examples = await examplesThroughConnection(
      null,
      { first: 3 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1 } },
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
      { projection: { createdAt: 1, updatedAt: 1, num: 1 } },
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
      { projection: { createdAt: 1, updatedAt: 1, num: 1 } },
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
      { projection: { createdAt: 1, updatedAt: 1, num: 1 } },
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
      { projection: { createdAt: 1, updatedAt: 1, num: 1 } },
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

    const examples6 = await examplesThroughConnection(
      null,
      { first: 11 },
      { mongooseConn },
      { projection: { createdAt: 1, updatedAt: 1, num: 1 } },
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
});
