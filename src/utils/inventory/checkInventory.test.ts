/* eslint-env jest */
import type { InventoryByRoles, Inventory, InventoryChain } from '../../tsTypes';

import checkInventory from './checkInventory';

describe('checkInventory', () => {
  test('should return correct results for empty inventory object', () => {
    const inventory: Inventory = { name: 'test' };

    let inventoryChain: InventoryChain = ['Query'];
    let result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory include object with 1 level', () => {
    const inventory: Inventory = { name: 'test', include: { Query: true } };

    let inventoryChain: InventoryChain = ['Query'];
    let result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Subscription'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Query', 'entity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);
  });

  test('should return correct results for inventory exclude object with 1 level', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: true } };

    let inventoryChain: InventoryChain = ['Query'];
    let result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Mutation'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 2 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { entity: true } } };

    let inventoryChain: InventoryChain = ['Query'];
    let result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Query', 'entities'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Query', 'entities', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 3 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { entity: ['User'] } } };

    let inventoryChain: InventoryChain = ['Query'];
    let result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entities'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);

    inventoryChain = ['Query', 'entity', 'Place'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Query', 'entities', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Mutation', 'createEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);

    inventoryChain = ['Subscription', 'createdEntity', 'User'];
    result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 3 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { entityCount: true } } };

    const inventoryChain: InventoryChain = ['Query', 'entityCount', 'Invoice'];
    const result = checkInventory(inventoryChain, inventory);
    expect(result).toBe(false);
  });

  describe('checkInventory in inventoryByRoles', () => {
    const inventoryByRoles: InventoryByRoles = {
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
    test('should return correct results for InventoryByRoles ""', () => {
      const roles = [''];
      const inventoryChain: InventoryChain = ['Mutation', 'renewEntity', 'User'];
      const result = roles.some((role: any) =>
        checkInventory(inventoryChain, inventoryByRoles[role]),
      );
      expect(result).toBe(true);
    });
    test('should return correct results for InventoryByRoles guest', () => {
      const roles = ['guest'];
      const inventoryChain: InventoryChain = ['Mutation', 'signoutEntity', 'User'];
      const result = roles.some((role: any) =>
        checkInventory(inventoryChain, inventoryByRoles[role]),
      );
      expect(result).toBe(false);
    });
    test('should return correct results for InventoryByRoles guest & Subscription', () => {
      const roles = [''];
      const inventoryChain: InventoryChain = ['Subscription', 'deletedEntity', 'User'];
      const result = roles.some((role: any) =>
        checkInventory(inventoryChain, inventoryByRoles[role]),
      );
      expect(result).toBe(false);
    });
  });
});
