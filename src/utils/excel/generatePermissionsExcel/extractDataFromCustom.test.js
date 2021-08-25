// @flow
/* eslint-env jest */

import extractDataFromCustom from './extractDataFromCustom';

describe('extractDataFromCustom util', () => {
  test('should return valid actions matrix', () => {
    const custom = {
      Mutation: {
        cloneThing: {
          name: 'cloneThing',
          specificName: ({ name }) =>
            name === 'Restaurant' || name === 'Post' ? `clone${name}` : '',
        },
      },
      Query: {
        currentThingForView: {
          name: 'currentThingForView',
          specificName: ({ name }) => (name === 'User' ? `current${name}ForView` : ''),
        },
      },
    };

    const thingNames = ['Restaurant', 'Post', 'Access', 'User'];

    const customActionNames = ['currentThingForView', 'cloneThing'];

    const customActionTypes = {
      currentThingForView: 'CustomQuery',
      cloneThing: 'CustomMutation',
    };

    const thingNamesByCustomActions = {
      currentThingForView: ['User'],
      cloneThing: ['Restaurant', 'Post'],
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
