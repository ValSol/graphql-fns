// @flow
/* eslint-env jest */

import extractDataFromDerivative from './extractDataFromDerivative';

describe('extractDataFromDerivative util', () => {
  test('should return valid actions matrix', () => {
    const actionTypes = {
      thing: 'Query',
      things: 'Query',
      thingCount: 'Query',
      createThing: 'Mutation',
    };

    const derivative = {
      ForEdit: {
        allow: {
          Restaurant: ['thing'],
          Post: ['thing', 'createThing'],
        },
        suffix: 'ForEdit',
      },
      ForView: {
        allow: {
          Restaurant: ['thing', 'things'],
          Post: ['thing', 'things'],
          User: ['thing'],
        },
        suffix: 'ForView',
      },
    };

    const derivativeActionNames = [
      'thingForEdit',
      'thingForView',
      'thingsForView',
      'createThingForEdit',
    ];

    const derivativeActionTypes = {
      thingForEdit: 'DerivativeQuery',
      createThingForEdit: 'DerivativeMutation',
      thingForView: 'DerivativeQuery',
      thingsForView: 'DerivativeQuery',
    };

    const thingNamesByDerivativeActions = {
      thingForEdit: ['Restaurant', 'Post'],
      createThingForEdit: ['Post'],
      thingForView: ['Restaurant', 'Post', 'User'],
      thingsForView: ['Restaurant', 'Post'],
    };

    const result = extractDataFromDerivative({ actionTypes, derivative });

    expect(result).toEqual({
      derivativeActionNames,
      derivativeActionTypes,
      thingNamesByDerivativeActions,
    });
  });
});
