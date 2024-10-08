/* eslint-env jest */

import compressInventory from './compressInventory';

describe('compressInventory', () => {
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
            entity: ['LegalEntity', 'RestaurantLevel'],
            childEntities: ['LegalEntity'],
          },
          Mutation: {
            cloneLevelOfThing: ['Restaurant'],
            improvedUpdateThing: ['RestaurantLevel'],
            pushIntoEntity: ['RestaurantLevel'],
          },
        },
      },
      editor: {
        name: 'editor',
        include: {
          Query: {
            thingForEdit: ['Restaurant'],
            entity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            entitiesForEdit: ['Restaurant'],
            childEntity: ['MenuClone'],
            childEntities: ['MenuSectionClone'],
          },
          Mutation: {
            createEntity: ['BanquetHall', 'ConferenceHall', 'Menu'],
            cloneEntity: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            improvedUpdateThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
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
            childEntity: ['BanquetHall', 'ConferenceHall'],
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
            childEntities: ['LegalEntity'],
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
            entity: ['LegalEntity', 'RestaurantLevel'],
            childEntities: ['LegalEntity'],
          },
          Mutation: {
            cloneLevelOfThing: ['Restaurant'],
            improvedUpdateThing: ['RestaurantLevel'],
            pushIntoEntity: ['RestaurantLevel'],
          },
        },
      },
      editor: {
        name: 'editor',
        include: {
          Query: {
            thingForEdit: ['Restaurant'],
            entity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            entitiesForEdit: ['Restaurant'],
            childEntity: ['MenuClone'],
            childEntities: ['MenuSectionClone'],
          },
          Mutation: {
            createEntity: ['BanquetHall', 'ConferenceHall', 'Menu'],
            cloneEntity: ['BanquetHall', 'ConferenceHall', 'Menu', 'Post', 'Restaurant'],
            improvedUpdateThing: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
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
            childEntity: ['BanquetHall', 'ConferenceHall'],
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
            getThingBySMS: ['PhoneConfirmationCode'],
            addNewTelToThingForGuest: ['User'],
            signoutThingForGuest: ['User'],
          },
        },
      },
      root: { name: 'root' },
    };

    const result = compressInventory(inventoryByRoles, umbrellaInventory);

    expect(result).toEqual(expectedResult);
  });
});
