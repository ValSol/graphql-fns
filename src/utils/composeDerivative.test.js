// @flow
/* eslint-env jest */
import type { DerivativeAttributes } from '../flowTypes';

import composeDerivative from './composeDerivative';

describe('composeDerivative', () => {
  test('compose simple derivatives', () => {
    const filteredRestaurantFieldNames = [
      'clone',
      'backup',
      'show',
      'editors',
      'publishers',
      'togglers',
      'creators',
    ];

    const filteredPostFieldNames = [
      'clone',
      'backup',
      'show',
      'editors',
      'publishers',
      'togglers',
      'creators',
    ];

    const ForView: DerivativeAttributes = {
      derivativeKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForApprove: DerivativeAttributes = {
      derivativeKey: 'ForApprove',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
        User: ['entity'],
      },

      includeFields: {
        User: ['email'],
      },

      excludeFields: {
        Restaurant: filteredRestaurantFieldNames,
        Post: filteredPostFieldNames,
      },

      addFields: {
        Restaurant: {
          relationalFields: [{ name: 'submitter', configName: 'User' }],
        },
        Post: {
          relationalFields: [{ name: 'submitter', configName: 'User' }],
        },
      },

      derivativeFields: {
        Restaurant: {
          posts: 'ForView',
          commentList: 'ForView',
          submitter: 'ForApprove',
        },
        Post: {
          restaurants: 'ForView',
          submitter: 'ForApprove',
        },
      },
    };
    const result = composeDerivative([ForView, ForApprove]);

    const expectedResult = { ForView, ForApprove };
    expect(result).toEqual(expectedResult);
  });

  test('compose derivatives with additional virtual configs', () => {
    const ForView: DerivativeAttributes = {
      derivativeKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: DerivativeAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
      },
      derivativeKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
    };

    const result = composeDerivative([ForView, ForCatalog]);

    const expectedForCatalog: DerivativeAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      derivativeKey: 'ForCatalog',

      excludeFields: { Example: ['anotherField'] },

      derivativeFields: {
        ExampleEdge: { node: 'ForCatalog' },
        ExampleConnection: { edges: 'ForCatalog' },
      },
    };

    const expectedResult = { ForView, ForCatalog: expectedForCatalog };
    expect(result).toEqual(expectedResult);
  });
});
