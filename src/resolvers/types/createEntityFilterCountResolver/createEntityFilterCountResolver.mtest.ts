/* eslint-env jest */
import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import toGlobalId from '../../utils/toGlobalId';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createUpdateEntityMutationResolver from '../../mutations/createUpdateEntityMutationResolver';
import createEntityFilterCountResolver from '.';

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-filter-count-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityFilterCountResolver', () => {
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
          oppositeName: 'restaurants',
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
          name: 'restaurants',
          oppositeName: 'creator',
          config: restaurantConfig,
          array: true,
          type: 'duplexFields',
        },
      ],

      filterFields: [
        {
          name: 'restaurantsFilter',
          config: restaurantConfig,
          array: true,
          type: 'filterFields',
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
      restaurants: { create: [{ title: 'Belle Vue' }, { title: 'La Cosmopolit' }] },
    };

    const createdUser = await createUser(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    const { id, restaurants } = createdUser;

    const restaurantFilterCount = createEntityFilterCountResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    const userId = toGlobalId(id, 'User');
    const restaurantIds = restaurants.map((restaurant) => toGlobalId(restaurant, 'Restaurant'));

    const parent = { id: userId, restaurants: restaurantIds };

    const info = { fieldName: 'restaurantsFilterCount', projection: { title: 1 } };

    const restaurantsFilter = await restaurantFilterCount(
      parent,
      { first: 5 },
      { mongooseConn, pubsub },
      info,
      {
        inputOutputEntity: [[]],
      },
    );

    expect(restaurantsFilter).toBe(0);

    const updateUser = createUpdateEntityMutationResolver(
      userConfig,
      generalConfig,
      serversideConfig,
      true,
    );

    const data2 = { restaurantsFilter: { id_in: restaurantIds } };

    const updatedUser = await updateUser(
      null,
      { whereOne: { id }, data: data2 },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    expect(updatedUser.restaurantsFilter).toBe(JSON.stringify({ id_in: restaurantIds }));

    const restaurantFilter2 = await restaurantFilterCount(
      { ...updatedUser, ...parent },
      {},
      { mongooseConn, pubsub },
      info,
      {
        inputOutputEntity: [[]],
      },
    );

    expect(restaurantFilter2).toBe(2);
  });
});
