// @flow
/* eslint-env jest */

import createValidActionsMatrix from './createValidActionsMatrix';

describe('createValidActionsMatrix util', () => {
  test('should return valid actions matrix', () => {
    const actionNames = ['entity', 'createEntity'];
    const actionTypes = { entity: 'Query', createEntity: 'Mutation' };
    const inventory = {
      name: 'test',
      include: { Query: true, Mutation: true },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        [0, 0], // Restaurant, entity
        [0, 1], // Restaurant, createEntity
      ],
      [
        [1, 0], // Post, entity
        [1, 1], // Post, createEntity
      ],
      [
        [2, 0], // User, entity
        [2, 1], // User, createEntity
      ],
    ];

    const result = createValidActionsMatrix({ actionNames, actionTypes, inventory, thingNames });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 2', () => {
    const actionNames = ['entity', 'createEntity'];
    const actionTypes = { entity: 'Query', createEntity: 'Mutation' };
    const inventory = {
      name: 'test',
      exclude: { Query: true, Mutation: true },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        null, // Restaurant, entity
        null, // Restaurant, createEntity
      ],
      [
        null, // Post, entity
        null, // Post, createEntity
      ],
      [
        null, // User, entity
        null, // User, createEntity
      ],
    ];

    const result = createValidActionsMatrix({ actionNames, actionTypes, inventory, thingNames });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 3', () => {
    const actionNames = ['entity', 'createEntity'];
    const actionTypes = { entity: 'Query', createEntity: 'Mutation' };
    const inventory = {
      name: 'test',
      exclude: { Query: { entity: ['User'] }, Mutation: { createEntity: ['Restaurant'] } },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        [0, 0], // Restaurant, entity
        null, // Restaurant, createEntity
      ],
      [
        [1, 0], // Post, entity
        [1, 1], // Post, createEntity
      ],
      [
        null, // User, entity
        [2, 1], // User, createEntity
      ],
    ];

    const result = createValidActionsMatrix({ actionNames, actionTypes, inventory, thingNames });

    expect(result).toEqual(expectedResult);
  });

  test('should return valid actions matrix 4', () => {
    const actionNames = ['entity', 'createEntity'];
    const actionTypes = { entity: 'Query', createEntity: 'Mutation' };
    const inventory = {
      name: 'test',
      exclude: { Query: { entity: ['User'] }, Mutation: { createEntity: ['Restaurant'] } },
    };
    const inventory2 = {
      name: 'test',
      exclude: { Query: { entity: ['Post'] }, Mutation: { createEntity: ['User'] } },
    };
    const thingNames = ['Restaurant', 'Post', 'User'];

    const expectedResult = [
      [
        [0, 0], // Restaurant, entity
        null, // Restaurant, createEntity
      ],
      [
        null, // Post, entity
        [1, 1], // Post, createEntity
      ],
      [
        null, // User, entity
        null, // User, createEntity
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
