// @flow
/* eslint-env jest */

import type { ServersideConfig } from '../../../flowTypes';

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

  const filters = {
    RestaurantForCabinet: ({ id, role }: { id: string, role: string }): null | Array<Object> => {
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

    Restaurant: ({ id, role }: { role: string, id: string }): null | Array<Object> => {
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
  };

  const context = {};

  const id = '1234567890';

  test('should returnv [] for "Viewer" role when empty serversideConfig', async () => {
    const inventoryChain = ['Query', 'entitiesForView', 'Restaurant'];

    const serversideConfig: ServersideConfig = {};

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForView' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: [] };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [] for "Viewer" role', async () => {
    const inventoryChain = ['Query', 'entitiesForView', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [viewer] });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForView' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: [] };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [] for "Guest" role', async () => {
    const inventoryChain = ['Query', 'entitiesForView', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [guest] });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForView' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: [] };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [] for "RestaurantOwner" role', async () => {
    const inventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [restaurantOwner] });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForView' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: [] };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv "null" for "Guest" role', async () => {
    const inventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [guest] });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForView' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: null };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [Object] for "RestaurantOwner" role', async () => {
    const inventoryChain = ['Query', 'entityForCabinet', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [restaurantOwner], id });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForCabinet' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: [{ access_: { restaurantEditors: '1234567890' } }] };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [Object] for "Admin" role', async () => {
    const inventoryChain = ['Query', 'entityForCabinet', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [restaurantOwner, admin], id });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'RestaurantForCabinet' },
      context,
      serversideConfig,
    );
    const expectedResult = { mainEntity: [] };
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [Object, Object] for "Admin" role', async () => {
    const inventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => ({ roles: [restaurantOwner, admin], id });

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { mainEntity: 'Restaurant' },
      context,
      serversideConfig,
    );
    const expectedResult = {
      mainEntity: [
        { access_: { restaurantEditors: id } },
        { access_: { restaurantPublishers: id } },
        { show_exists: true },
      ],
    };
    expect(result).toEqual(expectedResult);
  });
});
