/* eslint-env jest */

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import toCursor from '../../utils/toCursor';
import toGlobalId from '../../utils/toGlobalId';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityCountResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-count-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityCountResolver', () => {
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
      inputOutputEntity: [[]],
    });
    const { id: id1 } = createdPlace1;

    const createdPlace2 = await createPlace(null, { data: data2 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id: id2 } = createdPlace2;

    const createdPlace3 = await createPlace(null, { data: data3 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id: id3 } = createdPlace3;

    const Place = createEntityCountResolver(placeConfig, generalConfig, serversideConfig);

    const parent = {
      friends: [
        toGlobalId(id2, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d7', 'Place'),
        toGlobalId(id3, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d8', 'Place'),
        toGlobalId(id1, 'Place'),
      ],
    };

    const info = { fieldName: 'friendsCount', projection: { title: 1 } };

    const count = await Place(parent, { first: 1 }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(count).toBe(3);
  });
});
