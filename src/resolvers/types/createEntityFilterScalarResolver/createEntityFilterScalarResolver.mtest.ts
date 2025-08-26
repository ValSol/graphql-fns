/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import fromGlobalId from '../../utils/fromGlobalId';
import toGlobalId from '../../utils/toGlobalId';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createUpdateEntityMutationResolver from '../../mutations/createUpdateEntityMutationResolver';
import createEntityFilterScalarResolver from '.';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-filter-scalar-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityFilterScalarResolver', () => {
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

      filterFields: [
        {
          name: 'restaurantFilter',
          config: restaurantConfig,
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
      restaurant: { create: { title: 'Belle Vue' } },
    };

    const createdUser = await createUser(null, { data }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });
    const { id, restaurant } = createdUser;

    const restaurantFilterScalar = createEntityFilterScalarResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    const userId = toGlobalId(id, 'User');
    const restaurantId = toGlobalId(restaurant, 'Restaurant');

    const parent = { id: userId, restaurant: restaurantId };

    const info = {
      projection: { title: 1 },
      fieldArgs: {},
      path: [],
      fieldName: 'restaurantFilter',
    };

    const restaurantFilter = await restaurantFilterScalar(
      parent,
      {},
      { mongooseConn, pubsub },
      info,
      {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
      },
    );

    expect(restaurantFilter).toBe(null);

    const updateUser = createUpdateEntityMutationResolver(
      userConfig,
      generalConfig,
      serversideConfig,
      true,
    );

    const updatedUser = await updateUser(
      null,
      { whereOne: { id }, data: { restaurantFilter: { id: restaurantId } } },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(updatedUser.restaurantFilter).toBe(`{"id":"${fromGlobalId(restaurantId)._id}"}`);

    const restaurantFilter2 = await restaurantFilterScalar(
      { ...updatedUser, ...parent },
      {},
      { mongooseConn, pubsub },
      info,
      {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
      },
    );

    expect(restaurantFilter2.title).toBe('Belle Vue');
  });
});
