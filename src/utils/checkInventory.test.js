// @flow
/* eslint-env jest */
import type { InventoryByRights, Inventory } from '../flowTypes';

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

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thingFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
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

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thingFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  test('should return correct results for inventory include object with 2 levels', () => {
    const inventory: Inventory = {
      name: 'test',
      include: { Query: { thing: true, thingFiles: true } },
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

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thingFiles'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'things'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thingFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'things', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  test('should return correct results for inventory include object with 3 levels', () => {
    const inventory: Inventory = {
      name: 'test',
      include: { Query: { thing: ['User'], thingFile: ['Image'] } },
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

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thingFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thingFile', 'Image'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thingFile', 'Logo'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'things'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'Place'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'things', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
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

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thingFile'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 2 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { thing: true } } };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'things'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'things', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 3 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { thing: ['User'] } } };

    let inventoryСhain = ['Query'];
    let result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'things'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thing', 'Place'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'things', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'createdThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });

  test('should return correct results for inventory exclude object with 3 levels', () => {
    const inventory: Inventory = { name: 'test', exclude: { Query: { thingCount: true } } };

    const inventoryСhain = ['Query', 'thingCount', 'Invoice'];
    const result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  describe('checkInventory in inventoryByRights', () => {
    const inventoryByRights: InventoryByRights = {
      '': {
        name: '',
        include: {
          Query: {
            thingForCatalog: true,
            thingsForCatalog: true,
          },
          Mutation: { renewThing: true, signinThing: true },
        },
      },
      guest: {
        name: 'guest',
        include: {
          Mutation: { renewThing: true, signinThing: true },
        },
      },
      // editor: {},
      // admin: { include: { Query: true, Mutation: true } },
      // master: {},
    };
    test('should return correct results for InventoryByRights guest', () => {
      const rights = [''];
      const inventoryСhain = ['Mutation', 'renewThing', 'User'];
      const result = rights.some((right) =>
        checkInventory(inventoryСhain, inventoryByRights[right]),
      );
      expect(result).toBe(true);
    });
    test('should return correct results for InventoryByRights guest', () => {
      const rights = ['guest'];
      const inventoryСhain = ['Mutation', 'signoutThing', 'User'];
      const result = rights.some((right) =>
        checkInventory(inventoryСhain, inventoryByRights[right]),
      );
      expect(result).toBe(false);
    });
  });
});
