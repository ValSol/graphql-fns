// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const { default: sleep } = require('../../../utils/sleep');
const {
  default: createCreateEntityMutationResolver,
} = require('../../mutations/createCreateEntityMutationResolver');
const { default: info } = require('../../utils/info.auxiliary');

const { default: createEntitiesByUniqueQueryResolver } = require('./index');

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entities-by-unique-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityQueryResolver', () => {
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
    const Example = mongooseConn.model('Person_Thing', exampleSchema);
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

    await createPerson(null, { data }, { mongooseConn, pubsub }, null, { inputOutputEntity: [] });

    const allPeople = await Example.find({});
    const id_in = allPeople.map(({ _id }) => _id); // eslint-disable-line camelcase

    const PeopleByUnique = createEntitiesByUniqueQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!PeopleByUnique) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const people = await PeopleByUnique(
      null,
      { where: { id_in } },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [] },
    );

    expect(people.length).toBe(allPeople.length);
  });
});
