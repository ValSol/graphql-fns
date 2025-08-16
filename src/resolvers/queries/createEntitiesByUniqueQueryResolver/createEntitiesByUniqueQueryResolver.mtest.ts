/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';

import createEntitiesByUniqueQueryResolver from './index';

const info = {
  projection: { textField1: 1, textField3: 1, createdAt: 1 },
  fieldArgs: {},
  path: [],
};

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entities-by-unique-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityQueryResolver', () => {
  const serversideConfig: Record<string, any> = {};
  test('should create query entities resolver', async () => {
    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'position',
          index: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          array: true,
          oppositeName: 'friends',
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = { allEntityConfigs: { Person: personConfig } };

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

    await createPerson(null, { data }, { mongooseConn, pubsub }, null, { inputOutputEntity: [[]] });

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
      { inputOutputEntity: [[]] },
    );

    expect(people.length).toBe(allPeople.length);
  });
});
