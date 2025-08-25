/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import toGlobalId from '../../utils/toGlobalId';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityDistinctValuesResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-count-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityDistinctValuesResolver', () => {
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

    const data1 = { title: 'title-1' };
    const data2 = { title: 'title-2' };
    const data3 = { title: 'title-3' };

    const createdPlace1 = await createPlace(null, { data: data1 }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputEntity: [[]] },
    });
    const { id: id1 } = createdPlace1;

    const createdPlace2 = await createPlace(null, { data: data2 }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputEntity: [[]] },
    });
    const { id: id2 } = createdPlace2;

    const createdPlace3 = await createPlace(null, { data: data3 }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputEntity: [[]] },
    });
    const { id: id3 } = createdPlace3;

    const Place = createEntityDistinctValuesResolver(placeConfig, generalConfig, serversideConfig);

    const parent = {
      friends: [
        toGlobalId(id2, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d7', 'Place'),
        toGlobalId(id3, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d8', 'Place'),
        toGlobalId(id1, 'Place'),
      ],
    };

    const info = {
      projection: { title: 1 },
      fieldArgs: {},
      path: [],
      fieldName: 'friendsDistinctValues',
    };

    const count = await Place(
      parent,
      { options: { target: 'title' } },
      { mongooseConn, pubsub },
      info,
      {
        involvedFilters: { inputOutputEntity: [[]] },
      },
    );

    expect(count).toEqual(['title-1', 'title-2', 'title-3']);
  });
});
