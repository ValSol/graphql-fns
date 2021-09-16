// @flow
/* eslint-env jest */

import moveThingsToObject from './moveThingsToObject';

describe('moveThingsToObject', () => {
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
      root: { name: 'root' },
    };

    const expectedResult = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToThing: { Restaurant: true },
            removeStaticThing: { Post: true, Restaurant: true },
            renewThingForView: { User: true },
            signinThingForView: { User: true },
          },
          Query: {
            thingsForView: { Restaurant: true, Post: true, MenuSection: true },
            thingForView: { Restaurant: true, Post: true, Menu: true },
            childThingForView: {
              BanquetHall: true,
              ConferenceHall: true,
              Restaurant: true,
              Menu: true,
            },
            childThingsForView: { Post: true, MenuSection: true },
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            thingForApprove: { Restaurant: true, Post: true },
            childThings: { MenuSectionClone: true },
            thingsForApprove: { Post: true, Restaurant: true },
            childThingForApprove: { User: true },
          },
          Mutation: {
            cloneThing: {
              BanquetHall: true,
              ConferenceHall: true,
              Menu: true,
              Post: true,
              Restaurant: true,
            },
            copyThing: {
              BanquetHallClone: true,
              BanquetHall: true,
              ConferenceHallClone: true,
              ConferenceHall: true,
              MenuClone: true,
              Menu: true,
              PostClone: true,
              Post: true,
              RestaurantClone: true,
              Restaurant: true,
            },
            deleteThing: {
              BanquetHallClone: true,
              ConferenceHallClone: true,
              PostClone: true,
              RestaurantClone: true,
            },
            createThing: { Menu: true },
            deleteWithChildrenThing: { MenuClone: true },
            removeStaticThing: { Restaurant: true, Post: true },
            cloneLevelOfThing: { Restaurant: true },
          },
        },
      },
      root: { name: 'root' },
    };

    const result = moveThingsToObject(inventoryByPermissions);

    expect(result).toEqual(expectedResult);
  });
});
