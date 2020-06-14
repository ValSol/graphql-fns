// @flow
/* eslint-env jest */
import type { AuthData, Inventory } from '../flowTypes';

import checkInventory from './checkInventory';

describe('checkInventory', () => {
  test('should return correct results for empty inventory object', () => {
    const inventory: Inventory = {};

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
    const inventory: Inventory = { include: { Query: null } };

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
    const inventory: Inventory = { include: { Query: { thing: null } } };

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
    const inventory: Inventory = { include: { Query: { thing: ['User'] } } };

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
    const inventory: Inventory = { exclude: { Query: null } };

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
    const inventory: Inventory = { exclude: { Query: { thing: null } } };

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
    const inventory: Inventory = { exclude: { Query: { thing: ['User'] } } };

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
    const inventory: Inventory = { exclude: { Query: { thingCount: null } } };

    const inventoryСhain = ['Query', 'thingCount', 'Invoice'];
    const result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);
  });

  describe('checkInventory in authData', () => {
    const authData: AuthData = {
      '': {
        include: {
          Query: {
            thingForCatalog: null,
            thingsForCatalog: null,
          },
          Mutation: { renewThing: null, signinThing: null },
        },
      },
      guest: {
        include: {
          Mutation: { renewThing: null, signinThing: null },
        },
      },
      // editor: {},
      // admin: { include: { Query: null, Mutation: null } },
      // master: {},
    };
    test('should return correct results for AuthData guest', () => {
      const roles = [''];
      const inventoryСhain = ['Mutation', 'renewThing', 'User'];
      const result = roles.some((role) => checkInventory(inventoryСhain, authData[role]));
      expect(result).toBe(true);
    });
    test('should return correct results for AuthData guest', () => {
      const roles = ['guest'];
      const inventoryСhain = ['Mutation', 'signoutThing', 'User'];
      const result = roles.some((role) => checkInventory(inventoryСhain, authData[role]));
      expect(result).toBe(false);
    });
  });
});
