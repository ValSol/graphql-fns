// @flow
/* eslint-env jest */

import childQueriesToDerivative from './childQueriesToDerivative';

describe('childQueriesToDerivative', () => {
  test('have to return inventoryByRoles for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childentitiesForCatalog',
        baseAction: 'childEntities',
        derivativeKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childEntity',
        baseAction: 'childEntity',
        derivativeKey: '',
        entityName: 'Country',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childEntity',
        derivativeKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const derivativeAttributes = {};

    const expectedResult = {
      ForCatalog: {
        derivativeKey: 'ForCatalog',
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
