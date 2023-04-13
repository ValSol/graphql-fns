/* eslint-env jest */

import type { EntityFilters, ServersideConfig } from '../../../tsTypes';

import sleep from '../../../utils/sleep';
import executeNodeAuthorisation from './executeNodeAuthorisation';

const viewer = 'Viewer';
const guest = 'Guest';
const restaurantOwner = 'RestaurantOwner';
const admin = 'Admin';

describe('executeNodeAuthorisation', () => {
  const filters: EntityFilters = {
    RestaurantForCabinet: [
      true,
      ({ id, role }: { id: string; role: string }): null | Array<any> => {
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
      ({ id, role }: { role: string; id: string }): null | Array<any> => {
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

  const context: Record<string, any> = {};

  const id = '1234567890';

  const entityName = 'RestaurantForCabinet';

  test('should returnv [] for when empty filters', async () => {
    const serversideConfig: ServersideConfig = {};

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult: Array<any> = [[]];
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters };

    const result2 = await executeNodeAuthorisation(entityName, context, serversideConfig2);
    const expectedResult2 = [[{ deleted: false }]];
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv null for "Viewer" role', async () => {
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [viewer] };
    };

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult = null;
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      filters,
      getUserAttributes,
      staticFilters,
    };

    const result2 = await executeNodeAuthorisation(entityName, context, serversideConfig2);
    const expectedResult2 = null;
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "admin" role', async () => {
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [admin] };
    };

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult: Array<any> = [[]];
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      filters,
      getUserAttributes,
      staticFilters,
    };

    const result2 = await executeNodeAuthorisation(entityName, context, serversideConfig2);
    const expectedResult2 = [[{ deleted: false }]];
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "restaurantOwner" role', async () => {
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner], id };
    };

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName, context, serversideConfig);
    const expectedResult = [[{ access_: { restaurantEditors: '1234567890' } }]];
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      filters,
      getUserAttributes,
      staticFilters,
    };

    const result2 = await executeNodeAuthorisation(entityName, context, serversideConfig2);
    const expectedResult2 = [
      [
        {
          AND: [{ deleted: false }, { access_: { restaurantEditors: '1234567890' } }],
        },
      ],
    ];
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "restaurantOwner" role', async () => {
    const entityName2 = 'Restaurant';

    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner, admin], id };
    };

    const serversideConfig: ServersideConfig = {
      filters,
      getUserAttributes,
    };

    const result = await executeNodeAuthorisation(entityName2, context, serversideConfig);
    const expectedResult = [
      [
        { access_: { restaurantEditors: id } },
        { access_: { restaurantPublishers: id } },
        { show_exists: true },
      ],
    ];

    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      filters,
      getUserAttributes,
      staticFilters,
    };

    const result2 = await executeNodeAuthorisation(entityName2, context, serversideConfig2);
    const expectedResult2 = [
      [
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
    ];
    expect(result2).toEqual(expectedResult2);
  });
});
