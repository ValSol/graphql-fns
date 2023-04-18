/* eslint-env jest */

import type { ParsedAction } from './tsTypes';

import childQueriesToInventory from './childQueriesToInventory';

describe('childQueriesToInventory', () => {
  const prefixToPermission = {
    ForCatalog: 'insider',
    ForView: '',
  };

  test('have to return inventoryByRoles for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childentitiesForCatalog',
        baseAction: 'childEntities',
        descendantKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        descendantKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const parsedAction: ParsedAction = {
      creationType: 'descendant',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: 'entitiesByUnique',
      descendantKey: 'ForView',
    };

    const inventoryByRoles: Record<string, any> = {};

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
      inventoryByRoles,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return inventoryByRoles for childQueries without descendantKey', () => {
    const childQueries = [
      {
        actionName: 'childEntities',
        baseAction: 'childEntities',
        descendantKey: '',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        descendantKey: '',
        entityName: 'Place',
      },
    ];

    const parsedAction: ParsedAction = {
      creationType: 'standard',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: '',
      descendantKey: 'ForView',
    };

    const inventoryByRoles: Record<string, any> = {};

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
      inventoryByRoles,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });
});
