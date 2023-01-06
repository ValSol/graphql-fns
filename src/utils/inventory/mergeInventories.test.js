// @flow
/* eslint-env jest */

import mergeInventories from './mergeInventories';

describe('mergeInventories', () => {
  test('have to return compressed inventoryByRoles', () => {
    const inventoryByRoles = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToThing: ['Restaurant'],
            removeStaticThing: ['Post', 'Restaurant'],
            renewThingForView: ['User'],
            signinThingForView: ['User'],
          },
          Query: {
            entitiesForView: ['Restaurant', 'Post', 'MenuSection'],
            entityForView: ['Restaurant', 'Post', 'Menu'],
            childThingForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childThingsForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            thingForApprove: ['Restaurant', 'Post'],
            childEntities: ['MenuSectionClone'],
            thingsForApprove: ['Post', 'Restaurant'],
            childThingForApprove: ['User'],
          },
          Mutation: {
            cloneEntity: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            copyEntity: [
              'BanquetHallClone',
              'BanquetHall',
              'ConferenceHallClone',
              'ConferenceHall',
              'MenuClone',
              'Menu',
              'PostClone',
              'Post',
              'RestaurantClone',
              'Restaurant',
            ],
            deleteEntity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'PostClone',
              'RestaurantClone',
            ],
            createEntity: ['Menu'],
            deleteWithChildrenThing: ['MenuClone'],
            removeStaticThing: ['Restaurant', 'Post'],
            cloneLevelOfThing: ['Restaurant'],
          },
        },
      },
    };

    const additionalInventoryByRoles = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToThing: ['Post'],
            removeStaticThing: ['Post', 'Restaurant'],
            renewThingForView: ['User'],
            signinThingForView: ['User'],
          },
          Query: {
            entitiesForView: ['MenuSection', 'ConferenceHall'],
            entityForView: ['Restaurant', 'Post', 'Menu'],
            childThingForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childThingsForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            entity: ['Post'],
            thingForApprove: ['Restaurant', 'Post'],
            childEntities: ['MenuSectionClone'],
            thingsForApprove: ['Post', 'Restaurant'],
            childThingForApprove: ['User'],
          },
          Mutation: {
            deleteEntity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'PostClone',
              'RestaurantClone',
            ],
            createEntity: ['Menu'],
          },
        },
      },
      root: { name: 'root' },
    };

    const expectedResult = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToThing: ['Restaurant', 'Post'],
            removeStaticThing: ['Post', 'Restaurant'],
            renewThingForView: ['User'],
            signinThingForView: ['User'],
          },
          Query: {
            entitiesForView: ['Restaurant', 'Post', 'MenuSection', 'ConferenceHall'],
            entityForView: ['Restaurant', 'Post', 'Menu'],
            childThingForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childThingsForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            entity: ['Post'],
            thingForApprove: ['Restaurant', 'Post'],
            childEntities: ['MenuSectionClone'],
            thingsForApprove: ['Post', 'Restaurant'],
            childThingForApprove: ['User'],
          },
          Mutation: {
            cloneEntity: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            copyEntity: [
              'BanquetHallClone',
              'BanquetHall',
              'ConferenceHallClone',
              'ConferenceHall',
              'MenuClone',
              'Menu',
              'PostClone',
              'Post',
              'RestaurantClone',
              'Restaurant',
            ],
            deleteEntity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'PostClone',
              'RestaurantClone',
            ],
            createEntity: ['Menu'],
            deleteWithChildrenThing: ['MenuClone'],
            removeStaticThing: ['Restaurant', 'Post'],
            cloneLevelOfThing: ['Restaurant'],
          },
        },
      },
      root: { name: 'root' },
    };

    const result = mergeInventories(inventoryByRoles, additionalInventoryByRoles);

    expect(result).toEqual(expectedResult);
  });
});
