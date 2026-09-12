/* eslint-env jest */

import childQueriesToRepresentation from './childQueriesToRepresentation';

describe('childQueriesToRepresentation', () => {
  test('have to return inventoryByRoles for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childentitiesForCatalog',
        baseAction: 'childEntities',
        representationKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        representationKey: '',
        entityName: 'Country',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        representationKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const representationAttributes: Record<string, any> = {};

    const expectedResult = {
      ForCatalog: {
        representationKey: 'ForCatalog',
        allow: {
          Person: ['childEntities'],
          Place: ['childEntity'],
        },
      },
    };

    const result = childQueriesToRepresentation(childQueries, representationAttributes);

    expect(result).toEqual(expectedResult);
  });
});
