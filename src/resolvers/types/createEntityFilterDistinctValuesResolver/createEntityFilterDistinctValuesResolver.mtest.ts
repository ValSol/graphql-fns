/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import fromGlobalId from '../../utils/fromGlobalId';
import toGlobalId from '../../utils/toGlobalId';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createUpdateEntityMutationResolver from '../../mutations/createUpdateEntityMutationResolver';
import createEntityFilterDistinctValuesResolver from '.';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-filter-count-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityFilterDistinctValuesResolver', () => {
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
      involvedFilters: { inputOutputEntity: [[]] },
    });

    const { id, restaurants } = createdUser;

    const restaurantFilterDistinctValues = createEntityFilterDistinctValuesResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    const userId = toGlobalId(id, 'User');
    const restaurantIds = restaurants.map((restaurant) => toGlobalId(restaurant, 'Restaurant'));

    const parent = { id: userId, restaurants: restaurantIds };

    const info = {
      projection: { title: 1 },
      fieldArgs: {},
      path: [],
      fieldName: 'restaurantsFilterDistinctValues',
    };

    const restaurantsFilter = await restaurantFilterDistinctValues(
      parent,
      { options: { target: 'title' } },
      { mongooseConn, pubsub },
      info,
      {
        involvedFilters: { inputOutputEntity: [[]] },
      },
    );

    expect(restaurantsFilter).toEqual([]);

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
      { involvedFilters: { inputOutputEntity: [[]] } },
    );

    expect(updatedUser.restaurantsFilter).toBe(
      JSON.stringify({ id_in: restaurantIds.map((globalId) => fromGlobalId(globalId)._id) }),
    );

    const restaurantFilter2 = await restaurantFilterDistinctValues(
      { ...updatedUser, ...parent },
      { options: { target: 'title' } },
      { mongooseConn, pubsub },
      info,
      {
        involvedFilters: { inputOutputEntity: [[]] },
      },
    );

    expect(restaurantFilter2).toEqual(['Belle Vue', 'La Cosmopolit']);
  });
});
