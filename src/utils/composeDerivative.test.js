// @flow
/* eslint-env jest */
import type { DerivativeAttributes } from '../flowTypes';

import composeDerivative from './composeDerivative';

describe('composeDerivative', () => {
  test('compose simple entityConfigs', () => {
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
      suffix: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForApprove: DerivativeAttributes = {
      suffix: 'ForApprove',
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
});
