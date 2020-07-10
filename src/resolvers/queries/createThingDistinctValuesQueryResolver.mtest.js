// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('../mutations/createCreateThingMutationResolver');
const {
  default: createThingDistinctValuesQueryResolver,
} = require('./createThingDistinctValuesQueryResolver');

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
    expect(distinctValues2).toEqual(['Boss', 'Mashkin', 'Daskin', 'Prashkin', 'Bzhezinsky']);

    const options3 = { target: 'position' };
    const distinctValues3 = await DistinctValues(
      null,
      { options: options3 },
      { mongooseConn, pubsub },
    );
    expect(distinctValues3).toEqual(['boss', 'programmer']);
  });
});
