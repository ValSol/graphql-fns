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
        actionName: 'childentitiesForCatalog',
        baseAction: 'childEntities',
        derivativeKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        derivativeKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const parsedAction = {
      creationType: 'derivative',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: 'entitiesByUnique',
      derivativeKey: 'ForView',
    };

    const inventoryByPermissions = {};

    const expectedResult = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            childentitiesForCatalog: ['Person'],
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

  test('have to return inventoryByPermissions for childQueries without derivativeKey', () => {
    const childQueries = [
      {
        actionName: 'childEntities',
        baseAction: 'childEntities',
        derivativeKey: '',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        derivativeKey: '',
        entityName: 'Place',
      },
    ];

    const parsedAction = {
      creationType: 'standard',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: '',
      derivativeKey: 'ForView',
    };

    const inventoryByPermissions = {};

    const expectedResult = {
      '': {
        name: '',
        include: {
          Query: {
            childEntities: ['Person'],
            childEntity: ['Place'],
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
