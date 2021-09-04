// @flow
/* eslint-env jest */

import childQueriesToInventory from './childQueriesToInventory';

describe('childQueriesToInventory', () => {
  const prefixToPermission = {
    ForCatalog: 'insider',
    ForView: '',
  };

  test('have to return inventoryByPermissions for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childThingsForCatalog',
        baseAction: 'childThings',
        suffix: 'ForCatalog',
        thingName: 'Person',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childThing',
        suffix: 'ForCatalog',
        thingName: 'Place',
      },
    ];

    const parsedAction = {
      creationType: 'derivative',
      thingConfig: { name: 'Person' },
      baseAction: 'thingsByUnique',
      suffix: 'ForView',
    };

    const inventoryByPermissions = {};

    const expectedResult = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            childThingsForCatalog: ['Person'],
            childThingForCatalog: ['Place'],
          },
        },
      },
    };

    const result = childQueriesToInventory(
      childQueries,
      parsedAction,
      inventoryByPermissions,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return inventoryByPermissions for childQueries without suffix', () => {
    const childQueries = [
      {
        actionName: 'childThings',
        baseAction: 'childThings',
        suffix: '',
        thingName: 'Person',
      },
      {
        actionName: 'childThing',
        baseAction: 'childThing',
        suffix: '',
        thingName: 'Place',
      },
    ];

    const parsedAction = {
      creationType: 'standard',
      thingConfig: { name: 'Person' },
      baseAction: '',
      suffix: 'ForView',
    };

    const inventoryByPermissions = {};

    const expectedResult = {
      '': {
        name: '',
        include: {
          Query: {
            childThings: ['Person'],
            childThing: ['Place'],
          },
        },
      },
    };

    const result = childQueriesToInventory(
      childQueries,
      parsedAction,
      inventoryByPermissions,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });
});
