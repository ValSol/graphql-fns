// @flow
/* eslint-env jest */

import compressInventory from './compressInventory';

describe('compressInventory', () => {
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
      insider: {
        name: 'insider',
        include: {
          Query: {
            childThingForCabinet: [
              'BanquetHall',
              'ConferenceHall',
              'Menu',
              'CommentListForRestaurant',
              'Post',
              'Restaurant',
            ],
            thingForCabinet: ['Restaurant', 'Post'],
            childThingsForCabinet: ['MenuSection', 'Post', 'Restaurant'],
            thingsForCabinet: ['Post', 'Restaurant'],
            thing: ['LegalEntity', 'RestaurantLevel'],
            childThings: ['LegalEntity'],
          },
          Mutation: {
            cloneLevelOfThing: ['Restaurant'],
            improvedUpdateThing: ['RestaurantLevel'],
            pushIntoThing: ['RestaurantLevel'],
          },
        },
      },
      editor: {
        name: 'editor',
        include: {
          Query: {
            thingForEdit: ['Restaurant'],
            thing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            thingsForEdit: ['Restaurant'],
            thingFiles: ['Photo', 'Illustration', 'Logo'],
            childThing: ['MenuClone'],
            childThings: ['MenuSectionClone'],
          },
          Mutation: {
            createThing: ['BanquetHall', 'ConferenceHall', 'Menu'],
            cloneThing: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            improvedUpdateThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            uploadThingFiles: ['Photo', 'Illustration', 'Logo'],
            updateThingWithChildren: ['MenuClone'],
            toggleCommentsOfThing: ['Restaurant'],
          },
        },
      },
      owner: {
        name: 'owner',
        include: {
          Query: {
            childThingForOwn: ['PostAccess', 'RestaurantAccess'],
            thingToken: ['Restaurant'],
            thingForOwn: ['User', 'RestaurantAccess'],
            thingsByUniqueForOwn: ['User'],
          },
          Mutation: {
            updateThingAndUserForOwn: ['Restaurant'],
          },
        },
      },
      creator: {
        name: 'creator',
        include: {
          Mutation: {
            createThingForCreate: ['Post', 'Restaurant'],
          },
          Query: {
            childThing: ['BanquetHall', 'ConferenceHall'],
          },
        },
      },
      toggler: {
        name: 'toggler',
        include: {
          Query: {
            thingsForToggle: ['Post', 'Restaurant'],
            thingForToggle: ['Post', 'Restaurant'],
          },
          Mutation: {
            updateThingForToggle: ['Post', 'Restaurant'],
            removeStaticThing: ['Post', 'Restaurant'],
          },
        },
      },
      admin: {
        name: 'admin',
        include: {
          Query: {
            thingForSetting: ['Restaurant', 'User'],
            childThings: ['LegalEntity'],
            thingsForSetting: ['User'],
          },
          Mutation: {
            cloneLevelOfThing: ['Restaurant'],
            updateThingForSetting: ['Restaurant', 'User'],
          },
        },
      },
      guest: {
        name: 'guest',
        include: {
          Query: {
            childThingForGuest: ['CommentListForRestaurant'],
          },
          Mutation: {
            pushIntoThingForGuest: ['CommentListForRestaurant'],
            updateThingProfileForGuest: ['User'],
            getThingBySMS: ['PhoneConfirmationCode'],
            addNewTelToThingForGuest: ['User'],
            signoutThingForGuest: ['User'],
          },
        },
      },
      root: { name: 'root' },
    };

    const umbrellaInventory = {
      '': [],
      guest: [''],
      insider: ['guest', ''],
      admin: ['insider', 'guest', ''],
      creator: ['insider', 'guest', ''],
      editor: ['insider', 'guest', ''],
      owner: ['insider', 'guest', ''],
      publisher: ['insider', 'guest', ''],
      toggler: ['insider', 'guest', ''],
      root: ['insider', 'guest', ''],
    };

    const expectedResult = {
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
          },
        },
      },
      insider: {
        name: 'insider',
        include: {
          Query: {
            childThingForCabinet: [
              'BanquetHall',
              'ConferenceHall',
              'Menu',
              'CommentListForRestaurant',
              'Post',
              'Restaurant',
            ],
            thingForCabinet: ['Restaurant', 'Post'],
            childThingsForCabinet: ['MenuSection', 'Post', 'Restaurant'],
            thingsForCabinet: ['Post', 'Restaurant'],
            thing: ['LegalEntity', 'RestaurantLevel'],
            childThings: ['LegalEntity'],
          },
          Mutation: {
            cloneLevelOfThing: ['Restaurant'],
            improvedUpdateThing: ['RestaurantLevel'],
            pushIntoThing: ['RestaurantLevel'],
          },
        },
      },
      editor: {
        name: 'editor',
        include: {
          Query: {
            thingForEdit: ['Restaurant'],
            thing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            thingsForEdit: ['Restaurant'],
            thingFiles: ['Photo', 'Illustration', 'Logo'],
            childThing: ['MenuClone'],
            childThings: ['MenuSectionClone'],
          },
          Mutation: {
            createThing: ['BanquetHall', 'ConferenceHall', 'Menu'],
            cloneThing: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            improvedUpdateThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            uploadThingFiles: ['Photo', 'Illustration', 'Logo'],
            updateThingWithChildren: ['MenuClone'],
            toggleCommentsOfThing: ['Restaurant'],
          },
        },
      },
      owner: {
        name: 'owner',
        include: {
          Query: {
            childThingForOwn: ['PostAccess', 'RestaurantAccess'],
            thingToken: ['Restaurant'],
            thingForOwn: ['User', 'RestaurantAccess'],
            thingsByUniqueForOwn: ['User'],
          },
          Mutation: {
            updateThingAndUserForOwn: ['Restaurant'],
          },
        },
      },
      creator: {
        name: 'creator',
        include: {
          Mutation: {
            createThingForCreate: ['Post', 'Restaurant'],
          },
          Query: {
            childThing: ['BanquetHall', 'ConferenceHall'],
          },
        },
      },
      toggler: {
        name: 'toggler',
        include: {
          Query: {
            thingsForToggle: ['Post', 'Restaurant'],
            thingForToggle: ['Post', 'Restaurant'],
          },
          Mutation: {
            updateThingForToggle: ['Post', 'Restaurant'],
          },
        },
      },
      admin: {
        name: 'admin',
        include: {
          Query: {
            thingForSetting: ['Restaurant', 'User'],
            thingsForSetting: ['User'],
          },
          Mutation: {
            updateThingForSetting: ['Restaurant', 'User'],
          },
        },
      },
      guest: {
        name: 'guest',
        include: {
          Query: {
            childThingForGuest: ['CommentListForRestaurant'],
          },
          Mutation: {
            pushIntoThingForGuest: ['CommentListForRestaurant'],
            updateThingProfileForGuest: ['User'],
            getThingBySMS: ['PhoneConfirmationCode'],
            addNewTelToThingForGuest: ['User'],
            signoutThingForGuest: ['User'],
          },
        },
      },
      root: { name: 'root' },
    };

    const result = compressInventory(inventoryByPermissions, umbrellaInventory);

    expect(result).toEqual(expectedResult);
  });
});
