// @flow
/* eslint-env jest */
import type { GeneralConfig, NearInput, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: sleep } = require('../../../utils/sleep');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../../mutations/createCreateEntityMutationResolver');
const { default: createEntityCountQueryResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-count-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityCountQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  const serversideConfig = {};

  test('should create query entities resolver', async () => {
    const personConfig: EntityConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
        {
          name: 'position',
          index: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          array: true,
          oppositeName: 'friends',
          config: personConfig,
        },
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
          config: personConfig,
        },
      ],
    });

    const exampleSchema = createThingSchema(personConfig);
    const Example = mongooseConn.model('Person_', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Hugo',
      lastName: 'Boss',
      position: 'boss',
      friends: {
        create: [
          { firstName: 'Adam', lastName: 'Mashkin', position: 'programmer' },
          { firstName: 'Andy', lastName: 'Daskin', position: 'programmer' },
          { firstName: 'Fred', lastName: 'Prashkin', position: 'programmer' },
        ],
      },
      theBestFriend: {
        create: {
          firstName: 'Stanislav',
          lastName: 'Bzhezinsky',
          position: 'programmer',
        },
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });

    const PersonCount = createEntityCountQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!PersonCount) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const count = await PersonCount(null, {}, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });

    expect(count).toBe(5);

    const where = { position: data.theBestFriend.create.position };
    const count2 = await PersonCount(null, { where }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });

    expect(count2).toBe(4);

    const where2 = { friends: createdPerson.id };
    const count3 = await PersonCount(null, { where: where2 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });

    expect(count3).toBe(3);

    const where3 = { position: 'bla-bla-bla' };
    const count4 = await PersonCount(null, { where: where3 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });

    expect(count4).toBe(0);
  });

  test('should create query count resolver to aggregate result', async () => {
    const childConfig: EntityConfig = {
      name: 'Child',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          array: true,
          index: true,
        },
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const parentConfig: EntityConfig = {
      name: 'Parent',
      type: 'tangible',
      textFields: [
        {
          name: 'name',
          index: true,
          weight: 1,
        },
      ],
      geospatialFields: [
        {
          name: 'point',
          geospatialType: 'Point',
        },
      ],
      relationalFields: [
        {
          name: 'child',
          index: true,
          config: childConfig,
        },
      ],
    };

    const exampleSchema = createThingSchema(parentConfig);
    const Example = mongooseConn.model('Parent_', exampleSchema);
    await Example.createCollection();

    const exampleSchema2 = createThingSchema(childConfig);
    const Example2 = mongooseConn.model('Child_', exampleSchema2);
    await Example2.createCollection();

    await sleep(250);

    const coords = [
      { lng: 50.428, lat: 30.61 },
      { lng: 50.427, lat: 30.611 },
      { lng: 50.426, lat: 30.612 },
      { lng: 50.425, lat: 30.613 },
      { lng: 50.424, lat: 30.614 },
      { lng: 50.423, lat: 30.615 },
      { lng: 50.422, lat: 30.616 },
      { lng: 50.421, lat: 30.617 },
      { lng: 50.42, lat: 30.618 },
      { lng: 50.429, lat: 30.619 },
      { lng: 50.41, lat: 30.63 },
      { lng: 50.411, lat: 30.631 },
      { lng: 50.412, lat: 30.632 },
      { lng: 50.413, lat: 30.633 },
      { lng: 50.414, lat: 30.634 },
      { lng: 50.415, lat: 30.635 },
      { lng: 50.416, lat: 30.636 },
      { lng: 50.417, lat: 30.637 },
      { lng: 50.418, lat: 30.638 },
      { lng: 50.419, lat: 30.639 },
    ];

    const createParent = createCreateEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createParent).toBe('function');
    if (!createParent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    for (let i = 0; i < 20; i += 1) {
      const data = {
        name: `name${Math.floor(i / 3)}`,
        point: coords[i],
        child: {
          create: {
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };
      // eslint-disable-next-line no-await-in-loop
      await createParent(null, { data }, { mongooseConn, pubsub }, null, { inputOutputEntity: [] });
    }

    const ParentCount = createEntityCountQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!ParentCount) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } };
    const parentCount = await ParentCount(null, { where }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });

    expect(parentCount).toBe(3);

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { lng: 50.425, lat: 30.615 },
      maxDistance: 1500,
    };

    const parentCount2 = await ParentCount(null, { near, where }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [],
    });
    expect(parentCount2).toBe(2);

    const where2 = { child_: { textField: 'first' } };
    const search = 'name2';
    const parentCount3 = await ParentCount(
      null,
      { search, where: where2 },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );
    expect(parentCount3).toBe(3);
  });
});
