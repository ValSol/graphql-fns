// @flow
/* eslint-env jest */
import type { InventoryByPermissions, Inventory } from '../../flowTypes';

import checkInventory from './checkInventory';

describe('checkInventory', () => {
  test('should return correct results for empty inventory object', () => {
    const inventory: Inventory = { name: 'test' };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entityFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory include object with 1 level', () => {
    const inventory: Inventory = { name: 'test', include: { Query: true } };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entityFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  test('should return correct results for inventory include object with 2 levels', () => {
    const inventory: Inventory = {
      name: 'test',
      include: { Query: { entity: true, entityFiles: true } },
    };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entityFiles'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entities'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entityFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entities', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  test('should return correct results for inventory include object with 3 levels', () => {
    const inventory: Inventory = {
      name: 'test',
      include: { Query: { entity: ['User'], entityFile: ['Image'] } },
    };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entityFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entityFile', 'Image'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entityFile', 'Logo'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entities'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity', 'Place'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entities', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  test('should return correct results for inventory exclude object with 1 level', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: true } };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entityFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 2 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { entity: true } } };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entities'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entities', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 3 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { entity: ['User'] } } };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entities'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'entity', 'Place'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'entities', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 3 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { entityCount: true } } };

    const inventoryСhain = ['Query', 'entityCount', 'Invoice'];
    const result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  describe('checkInventory in inventoryByPermissions', () => {
    const inventoryByPermissions: InventoryByPermissions = {
      '': {
        name: '',
        include: {
          Query: {
            entityForCatalog: true,
            entitiesForCatalog: true,
          },
          Mutation: { renewEntity: true, signinEntity: true },
        },
      },
      guest: {
        name: 'guest',
        include: {
          Mutation: { renewEntity: true, signinEntity: true },
        },
      },
      // editor: {},
      // admin: { include: { Query: true, Mutation: true } },
      // master: {},
    };
    test('should return correct results for InventoryByPermissions guest', () => {
      const permissions = [''];
      const inventoryСhain = ['Mutation', 'renewEntity', 'User'];
      const result = permissions.some((permission) =>
        checkInventory(inventoryСhain, inventoryByPermissions[permission]),
      );
      expect(result).toBe(true);
    });
    test('should return correct results for InventoryByPermissions guest', () => {
      const permissions = ['guest'];
      const inventoryСhain = ['Mutation', 'signoutEntity', 'User'];
      const result = permissions.some((permission) =>
        checkInventory(inventoryСhain, inventoryByPermissions[permission]),
      );
      expect(result).toBe(false);
    });
  });
});
