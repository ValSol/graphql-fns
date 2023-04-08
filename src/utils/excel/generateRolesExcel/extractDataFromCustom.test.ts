/* eslint-env jest */

import type { Custom } from '../../../tsTypes';

import extractDataFromCustom from './extractDataFromCustom';

describe('extractDataFromCustom util', () => {
  test('should return valid actions matrix', () => {
    const custom: Custom = {
      Mutation: {
        cloneEntity: {
          name: 'cloneEntity',
          specificName: ({ name }: any) =>
            name === 'Restaurant' || name === 'Post' ? `clone${name}` : '',
          argNames: () => [],
          argTypes: () => [],
          involvedEntityNames: () => ({}),
          type: () => 'String',
          config: () => null,
        },
      },
      Query: {
        currentEntityForView: {
          name: 'currentEntityForView',
          specificName: ({ name }: any) => (name === 'User' ? `current${name}ForView` : ''),
          argNames: () => [],
          argTypes: () => [],
          involvedEntityNames: () => ({}),
          type: () => 'String',
          config: () => null,
        },
      },
    };

    const thingNames = ['Restaurant', 'Post', 'Access', 'User'];

    const customActionNames = ['currentEntityForView', 'cloneEntity'];

    const customActionTypes = {
      currentEntityForView: 'CustomQuery',
      cloneEntity: 'CustomMutation',
    };

    const thingNamesByCustomActions = {
      currentEntityForView: ['User'],
      cloneEntity: ['Restaurant', 'Post'],
    };

    const result = extractDataFromCustom({ thingNames, custom });

    expect(result).toEqual({
      customActionNames,
      customActionTypes,
      thingNamesByCustomActions,
    });
  });
});
