// @flow
/* eslint-env jest */

import type { EntityFilters, GeneralConfig, ServersideConfig } from '../../../flowTypes';

import sleep from '../../../utils/sleep';
import executeAuthorisation from './index';

const viewer = 'Viewer';
const guest = 'Guest';
const restaurantOwner = 'RestaurantOwner';
const admin = 'Admin';

describe('executeAuthorisation', () => {
  const containedRoles = {
    [viewer]: [],
    [guest]: [viewer],
    [restaurantOwner]: [viewer, guest],
    [admin]: [viewer, guest, restaurantOwner],
  };

  const inventoryByRoles = {
    Viewer: {
      name: 'Viewer',
      include: {
        Query: {
          entitiesForView: ['Restaurant'],
          entityForView: ['Restaurant'],
          childEntityForView: ['CommentListForRestaurant'],
        },
        Mutation: {
          signinEntityForView: ['User'],
        },
      },
    },

    Guest: {
      name: 'Guest',
      include: {
        Mutation: {
          pushIntoEntityForGuest: ['CommentListForRestaurant'],
        },
      },
    },

    RestaurantOwner: {
      name: 'RestaurantOwner',
      include: {
        Query: {
          entityClone: ['RestaurantClone'],
          entitiesForCabinet: ['Restaurant'],
          entityForCabinet: ['Restaurant'],
          childEntityForCabinet: ['CommentListForRestaurant'],
        },
        Mutation: {
          cloneEntity: ['Restaurant'],
        },
      },
    },

    Admin: {
      name: 'Admin',
      include: {
        Query: {
          entityForSetting: ['Restaurant', 'User'],
          entitiesForSetting: ['User'],
        },
        Mutation: {
          updateEntityForSetting: ['Restaurant', 'User'],
        },
      },
    },
  };

  const filters: EntityFilters = {
    RestaurantForCabinet: [
      true,
      ({ id, role }: { id: string, role: string }): null | Array<Object> => {
        switch (role) {
          case viewer:
          case guest:
            return null;
          case admin:
            return [];
          case restaurantOwner:
            return [{ access_: { restaurantEditors: id } }];

          default:
            throw new TypeError(`Role "${role}" not in use!`);
        }
      },
    ],

    Restaurant: [
      true,
      ({ id, role }: { role: string, id: string }): null | Array<Object> => {
        switch (role) {
          case viewer:
          case guest:
            return null;
          case admin:
            return [{ show_exists: true }];
          case restaurantOwner:
            return [
              { access_: { restaurantEditors: id } },
              { access_: { restaurantPublishers: id } },
            ];

          default:
            throw new TypeError(`Role "${role}" not in use!`);
        }
      },
    ],

    RestaurantForSetting: [true, () => []],
  };

  const staticFilters = {
    RestaurantForCabinet: { deleted: false },

    RestaurantForView: { show: true },

    Restaurant: { test: true },

    RestaurantForSetting: { level_gt: 0 },
  };

  const context = {};

  const generalConfig: GeneralConfig = {};

  const id = '1234567890';

  test('should returnv [] for "Viewer" role when empty serversideConfig', async () => {
    const inventoryChain = ['Query', 'entitiesForView', 'Restaurant'];

    const serversideConfig: ServersideConfig = {};

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { inputOutputEntity: [] };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { inputOutputEntity: [{ show: true }] };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "Viewer" role', async () => {
    const inventoryChain = ['Query', 'entitiesForView', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [viewer] };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { inputOutputEntity: [] };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { inputOutputEntity: [{ show: true }] };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "Guest" role', async () => {
    const inventoryChain = ['Query', 'entitiesForView', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [guest] };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { inputOutputEntity: [] };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { inputOutputEntity: [{ show: true }] };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "RestaurantOwner" role', async () => {
    const inventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner] };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { inputOutputEntity: [] };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { inputOutputEntity: [{ show: true }] };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv "null" for "Guest" role', async () => {
    const inventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [guest] };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { inputOutputEntity: null };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { inputOutputEntity: null };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [Object] for "RestaurantOwner" role', async () => {
    const inventoryChain = ['Query', 'entityForCabinet', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      inputOutputEntity: [{ access_: { restaurantEditors: '1234567890' } }],
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      inputOutputEntity: [
        { AND: [{ deleted: false }, { access_: { restaurantEditors: '1234567890' } }] },
      ],
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [Object] for "Admin" role', async () => {
    const inventoryChain = ['Query', 'entityForCabinet', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner, admin], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { inputOutputEntity: [] };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { inputOutputEntity: [{ deleted: false }] };
    expect(result2).toEqual(expectedResult2);
  });

  test('should return [Object, Object] for "Admin" role', async () => {
    const inventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner, admin], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'Restaurant' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      inputOutputEntity: [
        { access_: { restaurantEditors: id } },
        { access_: { restaurantPublishers: id } },
        { show_exists: true },
      ],
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'Restaurant' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      inputOutputEntity: [
        {
          AND: [
            { test: true },
            {
              OR: [
                { access_: { restaurantEditors: id } },
                { access_: { restaurantPublishers: id } },
                { show_exists: true },
              ],
            },
          ],
        },
      ],
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & null for "Admin" role', async () => {
    const inventoryChain = ['Mutation', 'updateEntityForSetting', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner, admin], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscribeUpdatedEntity: 'Restaurant' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      inputOutputEntity: [],
      subscribeUpdatedEntity: null,
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscribeUpdatedEntity: 'Restaurant' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      inputOutputEntity: [{ level_gt: 0 }],
      subscribeUpdatedEntity: null,
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & [] without any inventories', async () => {
    const inventoryChain = ['Mutation', 'updateEntityForSetting', 'Restaurant'];

    const serversideConfig: ServersideConfig = {};

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscribeUpdatedEntity: 'Restaurant' },
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      inputOutputEntity: [],
      subscribeUpdatedEntity: [],
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscribeUpdatedEntity: 'Restaurant' },
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      inputOutputEntity: [{ level_gt: 0 }],
      subscribeUpdatedEntity: [{ test: true }],
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & noll without any inventories', async () => {
    const inventoryChain = ['Mutation', 'updateEntityForSetting', 'Restaurant'];

    const serversideConfig: ServersideConfig = {};

    const inventory = { name: 'test', exclude: { Subscription: true } };

    const generalConfig2: GeneralConfig = { allEntityConfigs: {}, inventory };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscribeUpdatedEntity: 'Restaurant' },
      context,
      generalConfig2,
      serversideConfig,
    );
    const expectedResult = {
      inputOutputEntity: [],
      subscribeUpdatedEntity: null,
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscribeUpdatedEntity: 'Restaurant' },
      context,
      generalConfig2,
      serversideConfig2,
    );
    const expectedResult2 = {
      inputOutputEntity: [{ level_gt: 0 }],
      subscribeUpdatedEntity: null,
    };
    expect(result2).toEqual(expectedResult2);
  });
});
