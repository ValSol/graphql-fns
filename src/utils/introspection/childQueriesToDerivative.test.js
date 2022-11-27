// @flow
/* eslint-env jest */

import childQueriesToDerivative from './childQueriesToDerivative';

describe('childQueriesToDerivative', () => {
  test('have to return inventoryByPermissions for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childentitiesForCatalog',
        baseAction: 'childEntities',
        suffix: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        suffix: '',
        entityName: 'Country',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        suffix: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const derivativeAttributes = {};

    const expectedResult = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['childEntities'],
          Place: ['childEntity'],
        },
      },
    };

    const result = childQueriesToDerivative(childQueries, derivativeAttributes);

    expect(result).toEqual(expectedResult);
  });
});
