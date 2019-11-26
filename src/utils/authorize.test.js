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
      callback: async (inventoryChain, fields, userId) => (userId === '1' ? fields : []),
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
    const credentials = { roles, id: '1' };

    const expectedResult = false;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Customer mutation', async () => {
    const inventoryСhain = ['Mutation', 'createThing', 'Blog'];
    const fields = ['title', 'content'];
    const roles = ['Customer'];
    const credentials = { roles, id: '1' };

    const expectedResult = false;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Author mutation', async () => {
    const inventoryСhain = ['Mutation', 'createThing', 'Blog'];
    const fields = ['title', 'content'];
    const roles = ['Author'];
    const credentials = { roles, id: '1' };

    const expectedResult = true;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Author mutation updateThing for User id="1"', async () => {
    const inventoryСhain = ['Mutation', 'updateThing', 'User'];
    const fields = ['email', 'position'];
    const roles = ['Author'];
    const credentials = { roles, id: '1' };

    const expectedResult = true;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Author mutation updateThing for User id="2"', async () => {
    const inventoryСhain = ['Mutation', 'updateThing', 'User'];
    const fields = ['email', 'position'];
    const roles = ['Author'];
    const credentials = { roles, id: '2' };

    const expectedResult = false;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Master mutation updateThing', async () => {
    const inventoryСhain = ['Mutation', 'updateThing', 'User'];
    const fields = ['email', 'position'];
    const roles = ['Master'];
    const credentials = { roles, id: '2' };

    const expectedResult = true;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });

  test('should return fields for Master mutation updateThing', async () => {
    const inventoryСhain = ['Mutation', 'createThing', 'TextExample'];
    const fields = ['text', 'textRequired', '​textItems', '​textRequiredItems'];
    const roles = ['Author'];
    const credentials = { roles, id: '2' };

    const expectedResult = true;
    const result = await authorize(inventoryСhain, fields, credentials, requestArgs, data);
    expect(result).toEqual(expectedResult);
  });
});
