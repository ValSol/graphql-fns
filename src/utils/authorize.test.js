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
      applyCallback: {
        include: { Mutation: { deleteThing: ['User'], updateThing: ['User'] } },
      },
      callback: async (inventoryChain, fields) => fields,
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
  const requestArgs = {};

  test('should return fields for Customer query', async () => {
    const inventoryСhain = ['Query', 'thing', 'User'];
    const fields = ['email', 'position'];
    const roles = ['Customer'];

    const expectedResult = false;
    const result = await authorize(inventoryСhain, fields, roles, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Customer mutation', async () => {
    const inventoryСhain = ['Mutation', 'createThing', 'Blog'];
    const fields = ['title', 'content'];
    const roles = ['Customer'];

    const expectedResult = false;
    const result = await authorize(inventoryСhain, fields, roles, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Author mutation', async () => {
    const inventoryСhain = ['Mutation', 'createThing', 'Blog'];
    const fields = ['title', 'content'];
    const roles = ['Author'];

    const expectedResult = true;
    const result = await authorize(inventoryСhain, fields, roles, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Author mutation updateThing for User', async () => {
    const inventoryСhain = ['Mutation', 'updateThing', 'User'];
    const fields = ['email', 'position'];
    const roles = ['Author'];

    const expectedResult = true;
    const result = await authorize(inventoryСhain, fields, roles, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });
});
