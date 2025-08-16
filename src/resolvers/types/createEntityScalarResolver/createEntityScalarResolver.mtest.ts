/* eslint-env jest */
import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import pubsub from '../../utils/pubsub';
import toGlobalId from '../../utils/toGlobalId';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityScalarResolver from './index';

const info = { projection: { title: 1 }, fieldArgs: {}, path: [], fieldName: 'friend' };

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-scalar-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityScalarResolver', () => {
  const serversideConfig: Record<string, any> = {};
  test('should create type entity resolver', async () => {
    const placeConfig = {} as EntityConfig;
    Object.assign(placeConfig, {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'friend',
          oppositeName: 'parentFriend',
          config: placeConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentFriend',
          oppositeName: 'friend',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          oppositeName: 'parentFriends',
          config: placeConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'parentFriends',
          oppositeName: 'friends',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(placeConfig);
    const Example = mongooseConn.model('Place_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const generalConfig: GeneralConfig = { allEntityConfigs: { Place: placeConfig } };

    const createPlace = createCreateEntityMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPlace).toBe('function');
    if (!createPlace) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      title: 'Paris',
    };
    const createdPlace = await createPlace(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id } = createdPlace;

    const Place = createEntityScalarResolver(placeConfig, generalConfig, serversideConfig);
    const parent = { friend: toGlobalId(id, 'Place') };
    const place = await Place(parent, null, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(place.title).toBe(data.title);

    const parent2 = { friend: toGlobalId('5cd82d6075fb194334d8c1d7', 'Place') };
    const place2 = await Place(parent2, null, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(place2).toBeNull();
  });
});
