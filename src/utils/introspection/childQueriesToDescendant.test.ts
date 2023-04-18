/* eslint-env jest */

import childQueriesToDescendant from './childQueriesToDescendant';

describe('childQueriesToDescendant', () => {
  test('have to return inventoryByRoles for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childentitiesForCatalog',
        baseAction: 'childEntities',
        descendantKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        descendantKey: '',
        entityName: 'Country',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        descendantKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const descendantAttributes: Record<string, any> = {};

    const expectedResult = {
      ForCatalog: {
        descendantKey: 'ForCatalog',
        allow: {
          Person: ['childEntities'],
          Place: ['childEntity'],
        },
      },
    };

    const result = childQueriesToDescendant(childQueries, descendantAttributes);

    expect(result).toEqual(expectedResult);
  });
});
