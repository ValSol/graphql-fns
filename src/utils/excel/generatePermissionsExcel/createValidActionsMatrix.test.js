// @flow
/* eslint-env jest */

import createValidActionsMatrix from './createValidActionsMatrix';

describe('createValidActionsMatrix util', () => {
  test('should return valid actions matrix', () => {
    const actionNames = ['thing', 'createThing'];
    const actionTypes = { thing: 'Query', createThing: 'Mutation' };
    const inventory = {
      name: 'test',
      include: { Query: true, Mutation: true },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        [0, 0], // Restaurant, thing
        [0, 1], // Restaurant, createThing
      ],
      [
        [1, 0], // Post, thing
        [1, 1], // Post, createThing
      ],
      [
        [2, 0], // User, thing
        [2, 1], // User, createThing
      ],
    ];

    const result = createValidActionsMatrix({ actionNames, actionTypes, inventory, thingNames });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 2', () => {
    const actionNames = ['thing', 'createThing'];
    const actionTypes = { thing: 'Query', createThing: 'Mutation' };
    const inventory = {
      name: 'test',
      exclude: { Query: true, Mutation: true },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        null, // Restaurant, thing
        null, // Restaurant, createThing
      ],
      [
        null, // Post, thing
        null, // Post, createThing
      ],
      [
        null, // User, thing
        null, // User, createThing
      ],
    ];

    const result = createValidActionsMatrix({ actionNames, actionTypes, inventory, thingNames });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 3', () => {
    const actionNames = ['thing', 'createThing'];
    const actionTypes = { thing: 'Query', createThing: 'Mutation' };
    const inventory = {
      name: 'test',
      exclude: { Query: { thing: ['User'] }, Mutation: { createThing: ['Restaurant'] } },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        [0, 0], // Restaurant, thing
        null, // Restaurant, createThing
      ],
      [
        [1, 0], // Post, thing
        [1, 1], // Post, createThing
      ],
      [
        null, // User, thing
        [2, 1], // User, createThing
      ],
    ];

    const result = createValidActionsMatrix({ actionNames, actionTypes, inventory, thingNames });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 4', () => {
    const actionNames = ['thing', 'createThing'];
    const actionTypes = { thing: 'Query', createThing: 'Mutation' };
    const inventory = {
      name: 'test',
      exclude: { Query: { thing: ['User'] }, Mutation: { createThing: ['Restaurant'] } },
    };
    const inventory2 = {
      name: 'test',
      exclude: { Query: { thing: ['Post'] }, Mutation: { createThing: ['User'] } },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        [0, 0], // Restaurant, thing
        null, // Restaurant, createThing
      ],
      [
        null, // Post, thing
        [1, 1], // Post, createThing
      ],
      [
        null, // User, thing
        null, // User, createThing
      ],
    ];

    const result = createValidActionsMatrix({
      actionNames,
      actionTypes,
      inventory,
      inventory2,
      thingNames,
    });

    expect(result).toEqual(expectedResult);
  });
});
