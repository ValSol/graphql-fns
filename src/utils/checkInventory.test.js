// @flow
/* eslint-env jest */
import type { Inventory } from '../flowTypes';

const checkInventory = require('./checkInventory');

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

    inventoryСhain = ['Subscription', 'thingSubscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
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

    inventoryСhain = ['Subscription', 'thingSubscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
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

    inventoryСhain = ['Subscription', 'thingSubscription'];
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

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
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

    inventoryСhain = ['Subscription', 'thingSubscription'];
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

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
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

    inventoryСhain = ['Subscription', 'thingSubscription'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Query', 'thing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(false);

    inventoryСhain = ['Mutation', 'createThing', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
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

    inventoryСhain = ['Subscription', 'thingSubscription'];
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

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
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

    inventoryСhain = ['Subscription', 'thingSubscription'];
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

    inventoryСhain = ['Subscription', 'thingSubscription', 'User'];
    result = checkInventory(inventoryСhain, inventory);
    expect(result).toBe(true);
  });
});
