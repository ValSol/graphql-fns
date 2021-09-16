// @flow
/* eslint-env jest */

import mergeInventories from './mergeInventories';

describe('mergeInventories', () => {
  test('have to return compressed inventoryByPermissions', () => {
    const inventoryByPermissions = {
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
            thingsForView: ['Restaurant', 'Post', 'MenuSection'],
            thingForView: ['Restaurant', 'Post', 'Menu'],
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
            childThings: ['MenuSectionClone'],
            thingsForApprove: ['Post', 'Restaurant'],
            childThingForApprove: ['User'],
          },
          Mutation: {
            cloneThing: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            copyThing: [
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
            deleteThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'PostClone',
              'RestaurantClone',
            ],
            createThing: ['Menu'],
            deleteWithChildrenThing: ['MenuClone'],
            removeStaticThing: ['Restaurant', 'Post'],
            cloneLevelOfThing: ['Restaurant'],
          },
        },
      },
    };

    const additionalInventoryByPermissions = {
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
            thingsForView: ['MenuSection', 'ConferenceHall'],
            thingForView: ['Restaurant', 'Post', 'Menu'],
            childThingForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childThingsForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            thing: ['Post'],
            thingForApprove: ['Restaurant', 'Post'],
            childThings: ['MenuSectionClone'],
            thingsForApprove: ['Post', 'Restaurant'],
            childThingForApprove: ['User'],
          },
          Mutation: {
            deleteThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'PostClone',
              'RestaurantClone',
            ],
            createThing: ['Menu'],
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
            thingsForView: ['Restaurant', 'Post', 'MenuSection', 'ConferenceHall'],
            thingForView: ['Restaurant', 'Post', 'Menu'],
            childThingForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childThingsForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            thing: ['Post'],
            thingForApprove: ['Restaurant', 'Post'],
            childThings: ['MenuSectionClone'],
            thingsForApprove: ['Post', 'Restaurant'],
            childThingForApprove: ['User'],
          },
          Mutation: {
            cloneThing: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            copyThing: [
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
            deleteThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'PostClone',
              'RestaurantClone',
            ],
            createThing: ['Menu'],
            deleteWithChildrenThing: ['MenuClone'],
            removeStaticThing: ['Restaurant', 'Post'],
            cloneLevelOfThing: ['Restaurant'],
          },
        },
      },
      root: { name: 'root' },
    };

    const result = mergeInventories(inventoryByPermissions, additionalInventoryByPermissions);

    expect(result).toEqual(expectedResult);
  });
});
