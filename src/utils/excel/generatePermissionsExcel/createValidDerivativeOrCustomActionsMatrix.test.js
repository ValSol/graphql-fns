// @flow
/* eslint-env jest */

import createValidDerivativeOrCustomActionsMatrix from './createValidDerivativeOrCustomActionsMatrix';

describe('createValidDerivativeOrCustomActionsMatrix util', () => {
  const actionNames = ['thingForEdit', 'thingForView', 'thingsForView', 'createThingForEdit'];

  const actionTypes = {
    thingForEdit: 'DerivativeQuery',
    createThingForEdit: 'DerivativeMutation',
    thingForView: 'DerivativeQuery',
    thingsForView: 'DerivativeQuery',
  };

  const thingNames = ['Restaurant', 'Menu', 'Post', 'User', 'Access'];

  const thingNamesByActions = {
    thingForEdit: ['Restaurant', 'Post'],
    createThingForEdit: ['Post'],
    thingForView: ['Restaurant', 'Post', 'User'],
    thingsForView: ['Restaurant', 'Post'],
  };

  test('should return valid actions matrix', () => {
    const inventory = {
      name: 'test',
      include: { Query: true, Mutation: true },
    };

    const expectedResult = [
      [
        [0, 0], // Restaurant, thingForEdit
        [0, 1], // Restaurant, thingForView
        [0, 2], // Restaurant, thingsForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, thingForView
        null, // Menu, thingsForView
        null, // Menu, createThingForEdit
      ],
      [
        [2, 0], // Post, thingForEdit
        [2, 1], // Post, thingForView
        [2, 2], // Post, thingsForView
        [2, 3], // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        [3, 1], // User, thingForView
        null, // User, thingsForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, thingForView
        null, // Access, thingsForView
        null, // Access, createThingForEdit
      ],
    ];

    const result = createValidDerivativeOrCustomActionsMatrix({
      actionNames,
      actionTypes,
      inventory,
      thingNames,
      thingNamesByActions,
    });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 2', () => {
    const inventory = {
      name: 'test',
      exclude: { Query: true, Mutation: true },
    };

    const expectedResult = [
      [
        null, // Restaurant, thingForEdit
        null, // Restaurant, thingForView
        null, // Restaurant, thingsForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, thingForView
        null, // Menu, thingsForView
        null, // Menu, createThingForEdit
      ],
      [
        null, // Post, thingForEdit
        null, // Post, thingForView
        null, // Post, thingsForView
        null, // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        null, // User, thingForView
        null, // User, thingsForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, thingForView
        null, // Access, thingsForView
        null, // Access, createThingForEdit
      ],
    ];

    const result = createValidDerivativeOrCustomActionsMatrix({
      actionNames,
      actionTypes,
      inventory,
      thingNames,
      thingNamesByActions,
    });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 3', () => {
    const inventory = {
      name: 'test',
      exclude: { Query: { thingForView: ['User'] }, Mutation: { createThingForEdit: ['Post'] } },
    };

    const expectedResult = [
      [
        [0, 0], // Restaurant, thingForEdit
        [0, 1], // Restaurant, thingForView
        [0, 2], // Restaurant, thingsForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, thingForView
        null, // Menu, thingsForView
        null, // Menu, createThingForEdit
      ],
      [
        [2, 0], // Post, thingForEdit
        [2, 1], // Post, thingForView
        [2, 2], // Post, thingsForView
        null, // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        null, // User, thingForView
        null, // User, thingsForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, thingForView
        null, // Access, thingsForView
        null, // Access, createThingForEdit
      ],
    ];

    const result = createValidDerivativeOrCustomActionsMatrix({
      actionNames,
      actionTypes,
      inventory,
      thingNames,
      thingNamesByActions,
    });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 4', () => {
    const inventory = {
      name: 'test',
      exclude: { Query: { thingForView: ['User'] }, Mutation: { createThingForEdit: ['Post'] } },
    };
    const inventory2 = {
      name: 'test',
      exclude: { Query: { thingForView: ['Post'] } },
    };

    const expectedResult = [
      [
        [0, 0], // Restaurant, thingForEdit
        [0, 1], // Restaurant, thingForView
        [0, 2], // Restaurant, thingsForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, thingForView
        null, // Menu, thingsForView
        null, // Menu, createThingForEdit
      ],
      [
        [2, 0], // Post, thingForEdit
        null, // Post, thingForView
        [2, 2], // Post, thingsForView
        null, // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        null, // User, thingForView
        null, // User, thingsForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, thingForView
        null, // Access, thingsForView
        null, // Access, createThingForEdit
      ],
    ];

    const result = createValidDerivativeOrCustomActionsMatrix({
      actionNames,
      actionTypes,
      inventory,
      inventory2,
      thingNames,
      thingNamesByActions,
    });

    expect(result).toEqual(expectedResult);
  });
});
