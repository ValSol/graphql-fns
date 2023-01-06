// @flow
/* eslint-env jest */

import extractDataFromCustom from './extractDataFromCustom';

describe('extractDataFromCustom util', () => {
  test('should return valid actions matrix', () => {
    const custom = {
      Mutation: {
        cloneEntity: {
          name: 'cloneEntity',
          specificName: ({ name }) =>
            name === 'Restaurant' || name === 'Post' ? `clone${name}` : '',
        },
      },
      Query: {
        currentEntityForView: {
          name: 'currentEntityForView',
          specificName: ({ name }) => (name === 'User' ? `current${name}ForView` : ''),
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

    // $FlowFixMe
    const result = extractDataFromCustom({ thingNames, custom });

    expect(result).toEqual({
      customActionNames,
      customActionTypes,
      thingNamesByCustomActions,
    });
  });
});
