// @flow
/* eslint-env jest */

import type { ServersideConfig } from '../../../flowTypes';

import executeNodeAuthorisation from './index';

const viewer = 'Viewer';
const guest = 'Guest';
const restaurantOwner = 'RestaurantOwner';
const admin = 'Admin';

describe('executeNodeAuthorisation', () => {
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

    RestaurantForSetting: (): null | Array<Object> => [],
  };

  const context = {};

  const id = '1234567890';

  const entityName = 'RestaurantForCabinet';

  test('should returnv [] for when empty filters', async () => {
    const serversideConfig: ServersideConfig = {};

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult = [];
    expect(result).toEqual(expectedResult);
  });

  test('should returnv null for "Viewer" role', async () => {
    const getUserAttributes = async () => ({ roles: [viewer] });

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult = null;
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [] for "admin" role', async () => {
    const getUserAttributes = async () => ({ roles: [admin] });

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult = [];
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [] for "restaurantOwner" role', async () => {
    const getUserAttributes = async () => ({ roles: [restaurantOwner], id });

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult = [{ access_: { restaurantEditors: '1234567890' } }];
    expect(result).toEqual(expectedResult);
  });

  test('should returnv [] for "restaurantOwner" role', async () => {
    const entityName2 = 'Restaurant';

    const getUserAttributes = async () => ({ roles: [restaurantOwner, admin], id });

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName2, context, serversideConfig);
    const expectedResult = [
      { access_: { restaurantEditors: id } },
      { access_: { restaurantPublishers: id } },
      { show_exists: true },
    ];
    expect(result).toEqual(expectedResult);
  });
});
