/* eslint-env jest */

import type {
  Context,
  DescendantAttributes,
  EntityFilters,
  GeneralConfig,
  Inventory,
  InventoryByRoles,
  InventoryChain,
  ServersideConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import sleep from '@/utils/sleep';
import executeAuthorisation from '.';

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
        Subscription: {
          updatedEntityForCabinet: ['Restaurant'],
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
  } as InventoryByRoles;

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

  const subscribePayloadFilters: EntityFilters = {
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
            return [{ restaurantEditors: id }];

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
            return [{ restaurantEditors: id }, { restaurantPublishers: id }];

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

  const staticLimits = {
    RestaurantForCabinet: 2,

    RestaurantForView: 4,

    Restaurant: 6,

    RestaurantForSetting: 8,
  };

  const context = {} as Context;

  const ForCatalog: DescendantAttributes = {
    allow: { Restaurant: ['entity', 'entities'] },
    descendantKey: 'ForCatalog',
  };
  const ForSetting: DescendantAttributes = {
    allow: { Restaurant: ['entity', 'entities'] },
    descendantKey: 'ForSetting',
  };
  const ForView: DescendantAttributes = {
    allow: { Restaurant: ['entity', 'entities'] },
    descendantKey: 'ForView',
  };

  const Restaurant: TangibleEntityConfig = {
    name: 'Restaurant',
    type: 'tangible',

    allowedCalculatedWithAsyncFuncFieldNames: ['restaurantEditors'],

    textFields: [{ name: 'title', type: 'textFields' }],

    calculatedFields: [
      {
        name: 'restaurantEditors',
        type: 'calculatedFields',
        calculatedType: 'textFields',
        array: true,
        func: (() => []) as any,
        asyncFunc: (() => []) as any,
      },
      {
        name: 'restaurantPublishers',
        type: 'calculatedFields',
        calculatedType: 'textFields',
        array: true,
        func: (() => []) as any,
        asyncFunc: (() => []) as any,
      },
    ],
  };

  const allEntityConfigs = { Restaurant };
  const descendant = { ForCatalog, ForSetting, ForView };

  const generalConfig = { allEntityConfigs, descendant } as GeneralConfig;

  const id = '1234567890';

  test('should returnv [] for "Viewer" role when empty serversideConfig', async () => {
    const inventoryChain: InventoryChain = ['Query', 'entitiesForView', 'Restaurant'];

    const serversideConfig: ServersideConfig = { staticLimits };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { involvedFilters: { inputOutputFilterAndLimit: [[], 4] } };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { involvedFilters: { inputOutputFilterAndLimit: [[{ show: true }]] } };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "Viewer" role', async () => {
    const inventoryChain: InventoryChain = ['Query', 'entitiesForView', 'Restaurant'];
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
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticFilters,
      staticLimits,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: { inputOutputFilterAndLimit: [[{ show: true }], 4] },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "Guest" role', async () => {
    const inventoryChain: InventoryChain = ['Query', 'entitiesForView', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [guest] };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticLimits,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { involvedFilters: { inputOutputFilterAndLimit: [[], 4] } };
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
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { involvedFilters: { inputOutputFilterAndLimit: [[{ show: true }]] } };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] for "RestaurantOwner" role', async () => {
    const inventoryChain: InventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
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
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticFilters,
      staticLimits,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: { inputOutputFilterAndLimit: [[{ show: true }], 4] },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv "null" for "Guest" role', async () => {
    const inventoryChain: InventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [guest] };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      staticLimits,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { involvedFilters: { inputOutputFilterAndLimit: null } };
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
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = { involvedFilters: { inputOutputFilterAndLimit: null } };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [Object] for "RestaurantOwner" role', async () => {
    const inventoryChain: InventoryChain = ['Query', 'entityForCabinet', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticLimits,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[{ access_: { restaurantEditors: '1234567890' } }], 2],
      },
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
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [
          [{ AND: [{ deleted: false }, { access_: { restaurantEditors: '1234567890' } }] }],
        ],
      },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [Object] for "RestaurantOwner" role for "Subscription"', async () => {
    const inventoryChain: InventoryChain = [
      'Subscription',
      'updatedEntityForCabinet',
      'Restaurant',
    ];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticLimits,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[{ access_: { restaurantEditors: '1234567890' } }], 2],
      },
      subscribePayloadMongoFilter: {},
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
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [
          [{ AND: [{ deleted: false }, { access_: { restaurantEditors: '1234567890' } }] }],
        ],
      },
      subscribePayloadMongoFilter: {},
    };
    expect(result2).toEqual(expectedResult2);

    const serversideConfig3: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      subscribePayloadFilters,
      staticFilters,
    };

    const result3 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      {},
      context,
      generalConfig,
      serversideConfig3,
    );
    const expectedResult3 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [
          [{ AND: [{ deleted: false }, { access_: { restaurantEditors: '1234567890' } }] }],
        ],
      },

      subscribePayloadMongoFilter: { restaurantEditors: { $eq: '1234567890' } },
    };
    expect(result3).toEqual(expectedResult3);
  });

  test('should returnv [Object] for "Admin" role', async () => {
    const inventoryChain: InventoryChain = ['Query', 'entityForCabinet', 'Restaurant'];
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
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
      staticLimits,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForCabinet' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: { inputOutputFilterAndLimit: [[{ deleted: false }], 2] },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should return [Object, Object] for "Admin" role', async () => {
    const inventoryChain: InventoryChain = ['Mutation', 'cloneEntity', 'Restaurant'];
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: [restaurantOwner, admin], id };
    };

    const serversideConfig: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticLimits,
    };

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'Restaurant' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: {
        inputOutputFilterAndLimit: [
          [
            { access_: { restaurantEditors: id } },
            { access_: { restaurantPublishers: id } },
            { show_exists: true },
          ],
          6,
        ],
      },
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
      staticLimits,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'Restaurant' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [
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
          6,
        ],
      },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & null for "Admin" role', async () => {
    const inventoryChain: InventoryChain = ['Mutation', 'updateEntityForSetting', 'Restaurant'];
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
      { inputOutputEntity: 'RestaurantForSetting', subscriptionUpdatedEntity: 'Restaurant' },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[]],
        subscriptionUpdatedFilterAndLimit: null,
      },
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = {
      containedRoles,
      getUserAttributes,
      inventoryByRoles,
      filters,
      staticFilters,
      staticLimits,
    };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscriptionUpdatedEntity: 'RestaurantForView' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[{ level_gt: 0 }], 8],
        subscriptionUpdatedFilterAndLimit: null,
      },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & [] without any inventories', async () => {
    const inventoryChain: InventoryChain = ['Mutation', 'updateEntityForSetting', 'Restaurant'];

    const serversideConfig: ServersideConfig = { staticLimits };

    const result = await executeAuthorisation(
      inventoryChain,
      {
        inputOutputEntity: 'RestaurantForSetting',
        subscriptionUpdatedEntity: 'RestaurantForSetting',
      },
      {},
      context,
      generalConfig,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[], 8],
        subscriptionUpdatedFilterAndLimit: [[], 8],
      },
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters, staticLimits };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscriptionUpdatedEntity: 'Restaurant' },
      {},
      context,
      generalConfig,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[{ level_gt: 0 }], 8],
        subscriptionUpdatedFilterAndLimit: [[{ test: true }], 6],
      },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & noll without any inventories', async () => {
    const inventoryChain: InventoryChain = ['Mutation', 'updateEntityForSetting', 'Restaurant'];

    const serversideConfig: ServersideConfig = {};

    const inventory: Inventory = { name: 'test', exclude: { Subscription: true } };

    const generalConfig2: GeneralConfig = { inventory, allEntityConfigs: {} };

    Object.assign(generalConfig2, generalConfig);

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscriptionUpdatedEntity: 'Restaurant' },
      {},
      context,
      generalConfig2,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[]],
        subscriptionUpdatedFilterAndLimit: null,
      },
    };
    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters, staticLimits };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting', subscriptionUpdatedEntity: 'Restaurant' },
      {},
      context,
      generalConfig2,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[{ level_gt: 0 }], 8],
        subscriptionUpdatedFilterAndLimit: null,
      },
    };
    expect(result2).toEqual(expectedResult2);
  });

  test('should returnv [] & noll without any inventories', async () => {
    const inventoryChain: InventoryChain = [
      'Subscription',
      'updatedEntityForSetting',
      'Restaurant',
    ];

    const serversideConfig: ServersideConfig = {};

    const inventory: Inventory = { name: 'test' };

    const generalConfig2: GeneralConfig = { inventory, allEntityConfigs: {} };

    Object.assign(generalConfig2, generalConfig);

    const result = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting' },
      {},
      context,
      generalConfig2,
      serversideConfig,
    );
    const expectedResult = {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
      subscribePayloadMongoFilter: {},
    };

    expect(result).toEqual(expectedResult);

    const serversideConfig2: ServersideConfig = { staticFilters, staticLimits };

    const result2 = await executeAuthorisation(
      inventoryChain,
      { inputOutputEntity: 'RestaurantForSetting' },
      {},
      context,
      generalConfig2,
      serversideConfig2,
    );
    const expectedResult2 = {
      involvedFilters: {
        inputOutputFilterAndLimit: [[{ level_gt: 0 }], 8],
      },
      subscribePayloadMongoFilter: {},
    };

    expect(result2).toEqual(expectedResult2);
  });
});
