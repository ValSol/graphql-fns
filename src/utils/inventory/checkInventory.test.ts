/* eslint-env jest */
import type { InventoryByRoles, Inventory, InventoryСhain } from '../../tsTypes';

import checkInventory from './checkInventory';

describe('checkInventory', () => {
  test('should return correct results for empty inventory object', () => {
    const inventory: Inventory = { name: 'test' };

    let inventoryСhain: InventoryСhain = ['Query'];
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

    let inventoryСhain: InventoryСhain = ['Query'];
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

    let inventoryСhain: InventoryСhain = ['Query'];
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

    let inventoryСhain: InventoryСhain = ['Query'];
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

    let inventoryСhain: InventoryСhain = ['Query'];
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

    let inventoryСhain: InventoryСhain = ['Query'];
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

    let inventoryСhain: InventoryСhain = ['Query'];
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

    const inventoryСhain: InventoryСhain = ['Query', 'entityCount', 'Invoice'];
    const result = checkInventory(inventoryСhain, inventory);
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
    test('should return correct results for InventoryByRoles guest', () => {
      const roles = [''];
      const inventoryСhain: InventoryСhain = ['Mutation', 'renewEntity', 'User'];
      const result = roles.some((role: any) =>
        checkInventory(inventoryСhain, inventoryByRoles[role]),
      );
      expect(result).toBe(true);
    });
    test('should return correct results for InventoryByRoles guest', () => {
      const roles = ['guest'];
      const inventoryСhain: InventoryСhain = ['Mutation', 'signoutEntity', 'User'];
      const result = roles.some((role: any) =>
        checkInventory(inventoryСhain, inventoryByRoles[role]),
      );
      expect(result).toBe(false);
    });
  });
});
