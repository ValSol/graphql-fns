// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: sleep } = require('../../../utils/sleep');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('../../mutations/createCreateThingMutationResolver');
const { default: createThingDistinctValuesQueryResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thingDistinctValues-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createThingDistinctValuesQueryResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: {} };
  test('should create query things resolver', async () => {
    const serversideConfig = {};
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      pagination: true,
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
    const Example = mongooseConn.model('Person_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const createPerson = createCreateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Adam',
      lastName: 'Boss',
      position: 'boss',
      friends: {
        create: [
          { firstName: 'Andy', lastName: 'Mashkin', position: 'programmer' },
          { firstName: 'Adam', lastName: 'Daskin', position: 'programmer' },
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
    await createPerson(null, { data }, { mongooseConn, pubsub });

    const DistinctValues = createThingDistinctValuesQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!DistinctValues) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const options = { target: 'firstName' };
    const distinctValues = await DistinctValues(null, { options }, { mongooseConn, pubsub });
    expect(distinctValues).toEqual(['Adam', 'Andy', 'Fred', 'Stanislav']);

    const options2 = { target: 'lastName' };
    const distinctValues2 = await DistinctValues(
      null,
      { options: options2 },
      { mongooseConn, pubsub },
    );
    expect(distinctValues2).toEqual(['Boss', 'Bzhezinsky', 'Daskin', 'Mashkin', 'Prashkin']);

    const options3 = { target: 'position' };
    const distinctValues3 = await DistinctValues(
      null,
      { options: options3 },
      { mongooseConn, pubsub },
    );
    expect(distinctValues3).toEqual(['boss', 'programmer']);
  });

  test('should create query thing DistinctValues resolver to aggregate result', async () => {
    const serversideConfig = {};

    const childConfig: ThingConfig = {
      name: 'Child',
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
    const parentConfig: ThingConfig = {
      name: 'Parent',
      textFields: [
        {
          name: 'name',
          index: true,
          weight: 1,
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
    const Example = mongooseConn.model('Parent_Thing', exampleSchema);
    await Example.createCollection();

    const exampleSchema2 = createThingSchema(childConfig);
    const Example2 = mongooseConn.model('Child_Thing', exampleSchema2);
    await Example2.createCollection();

    await sleep(250);

    const createParent = createCreateThingMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createParent).toBe('function');
    if (!createParent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    for (let i = 0; i < 20; i += 1) {
      const data = {
        name: `name${Math.floor(i / 3)}`,
        child: {
          create: {
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };
      // eslint-disable-next-line no-await-in-loop
      await createParent(null, { data }, { mongooseConn, pubsub });
    }

    const DistinctValues = createThingDistinctValuesQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!DistinctValues) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = { child_: { textFields_in: ['text-3', 'text-4', 'text-12', 'text-99'] } };
    const options = { target: 'name' };
    const distinctValues3 = await DistinctValues(
      null,
      { options, where },
      { mongooseConn, pubsub },
    );
    expect(distinctValues3).toEqual(['name1', 'name4']);
  });
});
