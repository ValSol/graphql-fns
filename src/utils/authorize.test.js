// @flow
/* eslint-env jest */
import type { AuthData } from '../flowTypes';

import authorize from './authorize';

describe('authorize', () => {
  const data: AuthData = {
    Master: {},
    Admin: {
      request: {
        exclude: { Mutation: { deleteThing: ['User'] } },
      },
    },
    Author: {
      request: {
        exclude: { Mutation: { deleteThing: ['User'], updateThing: ['User'] } },
      },
    },
    Customer: {
      request: {
        include: { Query: null },
      },
      response: {
        User: { include: ['name', 'email'] },
      },
    },
  };

  test('should return fields for Customer query', () => {
    const inventoryСhain = ['Query', 'thing', 'User'];
    const fields = ['email', 'position'];
    const roles = ['Customer'];

    const expectedResult = ['email'];
    const result = authorize(inventoryСhain, fields, roles, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Customer mutation', () => {
    const inventoryСhain = ['Mutation', 'createThing', 'Blog'];
    const fields = ['title', 'content'];
    const roles = ['Customer'];

    const expectedResult = [];
    const result = authorize(inventoryСhain, fields, roles, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Author mutation', () => {
    const inventoryСhain = ['Mutation', 'createThing', 'Blog'];
    const fields = ['title', 'content'];
    const roles = ['Author'];

    const expectedResult = ['title', 'content'];
    const result = authorize(inventoryСhain, fields, roles, data);
    expect(result).toEqual(expectedResult);
  });
});
