// @flow
/* eslint-env jest */

import childQueriesToDerivative from './childQueriesToDerivative';

describe('childQueriesToDerivative', () => {
  test('have to return inventoryByPermissions for childQueries with ForCabinet', () => {
    const childQueries = [
      {
        actionName: 'childThingsForCatalog',
        baseAction: 'childThings',
        suffix: 'ForCatalog',
        thingName: 'Person',
      },
      {
        actionName: 'childThing',
        baseAction: 'childThing',
        suffix: '',
        thingName: 'Country',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childThing',
        suffix: 'ForCatalog',
        thingName: 'Place',
      },
    ];

    const derivativeAttributes = {};

    const expectedResult = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['childThings'],
          Place: ['childThing'],
        },
      },
    };

    const result = childQueriesToDerivative(childQueries, derivativeAttributes);

    expect(result).toEqual(expectedResult);
  });
});
