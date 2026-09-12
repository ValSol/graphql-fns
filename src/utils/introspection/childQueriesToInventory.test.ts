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
        representationKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        representationKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const parsedAction: ParsedAction = {
      creationType: 'representation',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: 'entitiesByUnique',
      representationKey: 'ForView',
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

  test('have to return inventoryByRoles for childQueries without representationKey', () => {
    const childQueries = [
      {
        actionName: 'childEntities',
        baseAction: 'childEntities',
        representationKey: '',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        representationKey: '',
        entityName: 'Place',
      },
    ];

    const parsedAction: ParsedAction = {
      creationType: 'standard',
      entityConfig: { name: 'Person', type: 'tangible' },
      baseAction: '',
      representationKey: 'ForView',
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
