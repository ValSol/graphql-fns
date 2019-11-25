// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('../mutations/createCreateThingMutationResolver');

const { default: createThingCountQueryResolver } = require('./createThingCountQueryResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thingCount-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createThingCountQueryResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  const serversideConfig = {};
  test('should create query things resolver', async () => {
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
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });

    const PersonCount = createThingCountQueryResolver(personConfig, generalConfig);
    if (!PersonCount) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const count = await PersonCount(null, {}, { mongooseConn, pubsub });

    expect(count).toBe(5);

    const where = { position: data.theBestFriend.create.position };
    const count2 = await PersonCount(null, { where }, { mongooseConn, pubsub });

    expect(count2).toBe(4);

    const where2 = { friends: createdPerson.id };
    const count3 = await PersonCount(null, { where: where2 }, { mongooseConn, pubsub });

    expect(count3).toBe(3);

    const where3 = { position: 'bla-bla-bla' };
    const count4 = await PersonCount(null, { where: where3 }, { mongooseConn, pubsub });

    expect(count4).toBe(0);
  });
});
