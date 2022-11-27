// @flow
/* eslint-env jest */

import type { ServersideConfig } from '../../../flowTypes';

import executeAuthorisation from './index';

describe('executeAuthorisation', () => {
  const context = {};

  test('should return true for empty serversideConfig', async () => {
    const inventoryChain = ['Mutation', 'deleteEntity', 'Post'];
    const serversideConfig: ServersideConfig = {};

    const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
    const expectedResult = [];
    expect(result).toEqual(expectedResult);
  });

  describe('unauthentificated user', () => {
    const inventoryByPermissions = {
      '': { name: '', include: { Query: { entity: ['Post'] } } },
    };

    test('should return true', async () => {
      const inventoryChain = ['Query', 'entity', 'Post'];
      const getActionFilter = () => Promise.resolve({ '': [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return false', async () => {
      const inventoryChain = ['Query', 'entity', 'User'];
      const getActionFilter = () => Promise.resolve({ '': [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = null;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('guest user', () => {
    const inventoryByPermissions = {
      '': { name: '', include: { Query: { entity: ['Post'] } } },
      guest: { name: 'guest', include: { Query: { entities: ['Post'] } } },
    };

    test('should true as unauthorized', async () => {
      const inventoryChain = ['Query', 'entity', 'Post'];
      const getActionFilter = () => Promise.resolve({ guest: [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return true', async () => {
      const inventoryChain = ['Query', 'entities', 'Post'];
      const getActionFilter = () => Promise.resolve({ guest: [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return false', async () => {
      const inventoryChain = ['Query', 'entities', 'User'];
      const getActionFilter = () => Promise.resolve({ guest: [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = null;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('editor user', () => {
    const inventoryByPermissions = {
      '': { name: '', include: { Query: { entityForView: ['Post'] } } },
      guest: { name: 'guest', include: { Query: { entitiesForView: ['Post'] } } },
      editor: { name: 'editor', include: { Query: { entitiesForEdit: true } } },
      toggler: { name: 'editor', include: { Query: { entitiesForEdit: true } } },
    };

    test('should return true', async () => {
      const inventoryChain = ['Query', 'entitiesForEdit', 'Restaurant'];
      const getActionFilter = () => Promise.resolve({ editor: [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return false', async () => {
      const inventoryChain = ['Query', 'entitiesForEdit', 'Restaurant'];
      const getActionFilter = () => Promise.resolve({});

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = null;
      expect(result).toEqual(expectedResult);
    });

    test('should return true 2', async () => {
      const inventoryChain = ['Query', 'entitiesForEdit', 'Restaurant'];
      const getActionFilter = () => Promise.resolve({ editor: [] });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [];
      expect(result).toEqual(expectedResult);
    });

    test('should return true with filter', async () => {
      const inventoryChain = ['Query', 'entitiesForEdit', 'Restaurant'];
      const getActionFilter = () =>
        Promise.resolve({
          editor: [{ editors: '12345' }, { cuisines: 'Albanian' }],
        });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [{ editors: '12345' }, { cuisines: 'Albanian' }];
      expect(result).toEqual(expectedResult);
    });

    test('should return true with filter', async () => {
      const inventoryChain = ['Query', 'entitiesForEdit', 'Restaurant'];
      const getActionFilter = () =>
        Promise.resolve({
          editor: [{ editors: '12345' }, { cuisines: 'Albanian' }],
          toggler: [{ editors: '54321' }, { cuisines_ne: 'Albanian' }],
        });

      const serversideConfig: ServersideConfig = { getActionFilter, inventoryByPermissions };

      const result = await executeAuthorisation(inventoryChain, context, serversideConfig);
      const expectedResult = [
        { editors: '12345' },
        { cuisines: 'Albanian' },
        { editors: '54321' },
        { cuisines_ne: 'Albanian' },
      ];
      expect(result).toEqual(expectedResult);
    });
  });
});
