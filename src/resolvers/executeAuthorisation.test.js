// @flow
/* eslint-env jest */

import type { ServersideConfig } from '../flowTypes';

import executeAuthorisation from './executeAuthorisation';

describe('executeAuthorisation', () => {
  const context = {};

  test('should return true for empty serversideConfig', async () => {
    const inventoryChain = ['Mutation', 'deleteThing', 'Post'];
    const serversideConfig: ServersideConfig = {};

    const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
    const expectedResult = [];
    expect(result).toEqual(expectedResult);
  });

  describe('unauthentificated user', () => {
    const inventoryByRoles = {
      '': { include: { Query: { thing: ['Post'] } } },
    };

    test('should return true', async () => {
      const inventoryChain = ['Query', 'thing', 'Post'];
      const getCredentials = () => Promise.resolve({ roles: [] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return false', async () => {
      const inventoryChain = ['Query', 'thing', 'User'];
      const getCredentials = () => Promise.resolve({ roles: [] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = null;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('guest user', () => {
    const inventoryByRoles = {
      '': { include: { Query: { thing: ['Post'] } } },
      guest: { include: { Query: { things: ['Post'] } } },
    };

    test('should true as unauthorized', async () => {
      const inventoryChain = ['Query', 'thing', 'Post'];
      const getCredentials = () => Promise.resolve({ roles: ['guest'] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return true', async () => {
      const inventoryChain = ['Query', 'things', 'Post'];
      const getCredentials = () => Promise.resolve({ roles: ['guest'] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return false', async () => {
      const inventoryChain = ['Query', 'things', 'User'];
      const getCredentials = () => Promise.resolve({ roles: ['guest'] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = null;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('editor user', () => {
    const inventoryByRoles = {
      '': { include: { Query: { thingForView: ['Post'] } } },
      guest: { include: { Query: { thingsForView: ['Post'] } } },
      editor: { include: { Query: { thingsForEdit: true } } },
    };

    test('should return true', async () => {
      const inventoryChain = ['Query', 'thingsForEdit', 'Restaurant'];
      const getCredentials = () => Promise.resolve({ roles: ['editor:Restaurant'] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return false', async () => {
      const inventoryChain = ['Query', 'thingsForEdit', 'Restaurant'];
      const getCredentials = () => Promise.resolve({ roles: ['editor:Hotel'] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = null;
      expect(result).toEqual(expectedResult);
    });

    test('should return true 2', async () => {
      const inventoryChain = ['Query', 'thingsForEdit', 'Restaurant'];
      const getCredentials = () => Promise.resolve({ roles: ['editor'] });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return true with filter', async () => {
      const inventoryChain = ['Query', 'thingsForEdit', 'Restaurant'];
      const getCredentials = () =>
        Promise.resolve({
          roles: [
            'editor:Restaurant:{"editors":"12345"}',
            'editor:Restaurant:{"cuisines":"Albanian"}',
          ],
        });

      const serversideConfig: ServersideConfig = { getCredentials, inventoryByRoles };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [{ editors: '12345' }, { cuisines: 'Albanian' }];
      expect(result).toEqual(expectedResult);
    });
  });
});
