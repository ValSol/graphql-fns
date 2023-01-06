// @flow
/* eslint-env jest */

import createValidDerivativeOrCustomActionsMatrix from './createValidDerivativeOrCustomActionsMatrix';

describe('createValidDerivativeOrCustomActionsMatrix util', () => {
  const actionNames = ['thingForEdit', 'entityForView', 'entitiesForView', 'createThingForEdit'];

  const actionTypes = {
    thingForEdit: 'DerivativeQuery',
    createThingForEdit: 'DerivativeMutation',
    entityForView: 'DerivativeQuery',
    entitiesForView: 'DerivativeQuery',
  };

  const thingNames = ['Restaurant', 'Menu', 'Post', 'User', 'Access'];

  const thingNamesByActions = {
    thingForEdit: ['Restaurant', 'Post'],
    createThingForEdit: ['Post'],
    entityForView: ['Restaurant', 'Post', 'User'],
    entitiesForView: ['Restaurant', 'Post'],
  };

  test('should return valid actions matrix', () => {
    const inventory = {
      name: 'test',
      include: { Query: true, Mutation: true },
    };

    const expectedResult = [
      [
        [0, 0], // Restaurant, thingForEdit
        [0, 1], // Restaurant, entityForView
        [0, 2], // Restaurant, entitiesForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, entityForView
        null, // Menu, entitiesForView
        null, // Menu, createThingForEdit
      ],
      [
        [2, 0], // Post, thingForEdit
        [2, 1], // Post, entityForView
        [2, 2], // Post, entitiesForView
        [2, 3], // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        [3, 1], // User, entityForView
        null, // User, entitiesForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, entityForView
        null, // Access, entitiesForView
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
        null, // Restaurant, entityForView
        null, // Restaurant, entitiesForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, entityForView
        null, // Menu, entitiesForView
        null, // Menu, createThingForEdit
      ],
      [
        null, // Post, thingForEdit
        null, // Post, entityForView
        null, // Post, entitiesForView
        null, // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        null, // User, entityForView
        null, // User, entitiesForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, entityForView
        null, // Access, entitiesForView
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
      exclude: { Query: { entityForView: ['User'] }, Mutation: { createThingForEdit: ['Post'] } },
    };

    const expectedResult = [
      [
        [0, 0], // Restaurant, thingForEdit
        [0, 1], // Restaurant, entityForView
        [0, 2], // Restaurant, entitiesForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, entityForView
        null, // Menu, entitiesForView
        null, // Menu, createThingForEdit
      ],
      [
        [2, 0], // Post, thingForEdit
        [2, 1], // Post, entityForView
        [2, 2], // Post, entitiesForView
        null, // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        null, // User, entityForView
        null, // User, entitiesForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, entityForView
        null, // Access, entitiesForView
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
      exclude: { Query: { entityForView: ['User'] }, Mutation: { createThingForEdit: ['Post'] } },
    };
    const inventory2 = {
      name: 'test',
      exclude: { Query: { entityForView: ['Post'] } },
    };

    const expectedResult = [
      [
        [0, 0], // Restaurant, thingForEdit
        [0, 1], // Restaurant, entityForView
        [0, 2], // Restaurant, entitiesForView
        null, // Restaurant, createThingForEdit
      ],
      [
        null, // Menu, thingForEdit
        null, // Menu, entityForView
        null, // Menu, entitiesForView
        null, // Menu, createThingForEdit
      ],
      [
        [2, 0], // Post, thingForEdit
        null, // Post, entityForView
        [2, 2], // Post, entitiesForView
        null, // Post, createThingForEdit
      ],
      [
        null, // User, thingForEdit
        null, // User, entityForView
        null, // User, entitiesForView
        null, // User, createThingForEdit
      ],
      [
        null, // Access, thingForEdit
        null, // Access, entityForView
        null, // Access, entitiesForView
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
