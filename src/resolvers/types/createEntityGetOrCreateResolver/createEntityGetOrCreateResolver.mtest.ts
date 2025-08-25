/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import pubsub from '../../utils/pubsub';
import toGlobalId from '../../utils/toGlobalId';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityGetOrCreateResolver from '.';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-get-or-create-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityGetOrCreateResolver', () => {
  const serversideConfig: Record<string, any> = {};
  test('should create type entity resolver', async () => {
    const userConfig = {} as TangibleEntityConfig;

    const restaurantConfig: TangibleEntityConfig = {
      name: 'Restaurant',
      type: 'tangible',

      textFields: [
        {
          name: 'title',
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'creator',
          oppositeName: 'restaurant',
          config: userConfig,
          type: 'duplexFields',
        },
      ],
    };

    Object.assign(userConfig, {
      name: 'User',
      type: 'tangible',

      textFields: [
        {
          name: 'name',
          required: true,
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'restaurant',
          oppositeName: 'creator',
          config: restaurantConfig,
          type: 'duplexFields',
        },
      ],
    });

    const restaurantSchema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', restaurantSchema);
    await Restaurant.createCollection();

    const userSchema = createThingSchema(userConfig);
    const User = mongooseConn.model('User_Thing', userSchema);
    await User.createCollection();

    await sleep(250);

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Restaurant: restaurantConfig, User: userConfig },
    };

    const createUser = createCreateEntityMutationResolver(
      userConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createUser).toBe('function');

    const data = {
      name: 'Jon',
      restaurant: { create: { title: 'Belle Vue' } },
    };

    const createdUser = await createUser(null, { data }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputEntity: [[]] },
    });
    const { id, restaurant } = createdUser;

    const getOrCreateRestaurant = createEntityGetOrCreateResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    const parent = { id: toGlobalId(id, 'User'), restaurant: toGlobalId(restaurant, 'Restaurant') };

    const info = {
      projection: { title: 1 },
      fieldArgs: {},
      path: [],
      fieldName: 'restaurantGetOrCreate',
    };

    const firstRestaurant = await getOrCreateRestaurant(
      parent,
      { data: { title: 'New Restaurant' } },
      { mongooseConn, pubsub },
      info,
      { involvedFilters: { inputOutputEntity: [[]] } },
    );

    expect(firstRestaurant.title).toBe('Belle Vue');

    const data2 = {
      name: 'Jack',
    };

    const createdUser2 = await createUser(null, { data: data2 }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputEntity: [[]] },
    });
    const { id: userId } = createdUser;

    const parent2 = { id: toGlobalId(userId, 'User') };

    const info2 = {
      projection: { title: 1 },
      fieldArgs: {},
      path: [],
      fieldName: 'restaurantGetOrCreate',
    };

    const secondRestaurant = await getOrCreateRestaurant(
      parent2,
      { data: { title: 'New Restaurant' } },
      { mongooseConn, pubsub },
      info2,
      { involvedFilters: { inputOutputEntity: [[]] } },
    );

    expect(secondRestaurant.title).toBe('New Restaurant');
  });
});
