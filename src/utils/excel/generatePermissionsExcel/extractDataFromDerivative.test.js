// @flow
/* eslint-env jest */

import extractDataFromDerivative from './extractDataFromDerivative';

describe('extractDataFromDerivative util', () => {
  test('should return valid actions matrix', () => {
    const actionTypes = {
      entity: 'Query',
      entities: 'Query',
      entityCount: 'Query',
      createEntity: 'Mutation',
    };

    const derivative = {
      ForEdit: {
        allow: {
          Restaurant: ['entity'],
          Post: ['entity', 'createEntity'],
        },
        suffix: 'ForEdit',
      },
      ForView: {
        allow: {
          Restaurant: ['entity', 'entities'],
          Post: ['entity', 'entities'],
          User: ['entity'],
        },
        suffix: 'ForView',
      },
    };

    const derivativeActionNames = [
      'entityForEdit',
      'entityForView',
      'entitiesForView',
      'createEntityForEdit',
    ];

    const derivativeActionTypes = {
      entityForEdit: 'DerivativeQuery',
      createEntityForEdit: 'DerivativeMutation',
      entityForView: 'DerivativeQuery',
      entitiesForView: 'DerivativeQuery',
    };

    const thingNamesByDerivativeActions = {
      entityForEdit: ['Restaurant', 'Post'],
      createEntityForEdit: ['Post'],
      entityForView: ['Restaurant', 'Post', 'User'],
      entitiesForView: ['Restaurant', 'Post'],
    };

    const result = extractDataFromDerivative({ actionTypes, derivative });

    expect(result).toEqual({
      derivativeActionNames,
      derivativeActionTypes,
      thingNamesByDerivativeActions,
    });
  });
});
