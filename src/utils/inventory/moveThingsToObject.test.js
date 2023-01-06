// @flow
/* eslint-env jest */

import moveThingsToObject from './moveThingsToObject';

describe('moveThingsToObject', () => {
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
            entitiesForView: { Restaurant: true, Post: true, MenuSection: true },
            entityForView: { Restaurant: true, Post: true, Menu: true },
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
            childEntities: { MenuSectionClone: true },
            thingsForApprove: { Post: true, Restaurant: true },
            childThingForApprove: { User: true },
          },
          Mutation: {
            cloneEntity: {
              BanquetHall: true,
              ConferenceHall: true,
              Menu: true,
              Post: true,
              Restaurant: true,
            },
            copyEntity: {
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
            deleteEntity: {
              BanquetHallClone: true,
              ConferenceHallClone: true,
              PostClone: true,
              RestaurantClone: true,
            },
            createEntity: { Menu: true },
            deleteWithChildrenThing: { MenuClone: true },
            removeStaticThing: { Restaurant: true, Post: true },
            cloneLevelOfThing: { Restaurant: true },
          },
        },
      },
      root: { name: 'root' },
    };

    const result = moveThingsToObject(inventoryByRoles);

    expect(result).toEqual(expectedResult);
  });
});
