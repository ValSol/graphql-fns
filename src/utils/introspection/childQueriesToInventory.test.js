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
        suffix: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        suffix: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const parsedAction = {
      creationType: 'derivative',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: 'entitiesByUnique',
      suffix: 'ForView',
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

  test('have to return inventoryByPermissions for childQueries without suffix', () => {
    const childQueries = [
      {
        actionName: 'childEntities',
        baseAction: 'childEntities',
        suffix: '',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        suffix: '',
        entityName: 'Place',
      },
    ];

    const parsedAction = {
      creationType: 'standard',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: '',
      suffix: 'ForView',
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
