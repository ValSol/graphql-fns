import compressInventory from './compressInventory';

describe('compressInventory', () => {
  test('have to return compressed inventoryByRoles', () => {
    const inventoryByRoles = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToEntity: ['Restaurant'],
            removeStaticEntity: ['Post', 'Restaurant'],
            renewEntityForView: ['User'],
            signinEntityForView: ['User'],
          },
          Query: {
            entitiesForView: ['Restaurant', 'Post', 'MenuSection'],
            entityForView: ['Restaurant', 'Post', 'Menu'],
            childEntityForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childEntitiesForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            entityForApprove: ['Restaurant', 'Post'],
            childEntities: ['MenuSectionClone'],
            entitiesForApprove: ['Post', 'Restaurant'],
            childEntityForApprove: ['User'],
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
            deleteWithChildrenEntity: ['MenuClone'],
            removeStaticEntity: ['Restaurant', 'Post'],
            cloneLevelOfEntity: ['Restaurant'],
          },
        },
      },
      insider: {
        name: 'insider',
        include: {
          Query: {
            childEntityForCabinet: [
              'BanquetHall',
              'ConferenceHall',
              'Menu',
              'CommentListForRestaurant',
              'Post',
              'Restaurant',
            ],
            entityForCabinet: ['Restaurant', 'Post'],
            childEntitiesForCabinet: ['MenuSection', 'Post', 'Restaurant'],
            entitiesForCabinet: ['Post', 'Restaurant'],
            entity: ['LegalEntity', 'RestaurantLevel'],
            childEntities: ['LegalEntity'],
          },
          Mutation: {
            cloneLevelOfEntity: ['Restaurant'],
            improvedUpdateEntity: ['RestaurantLevel'],
            updateEntity: ['RestaurantLevel'],
          },
        },
      },
      editor: {
        name: 'editor',
        include: {
          Query: {
            entityForEdit: ['Restaurant'],
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
            improvedUpdateEntity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            updateEntityWithChildren: ['MenuClone'],
            toggleCommentsOfEntity: ['Restaurant'],
          },
        },
      },
      owner: {
        name: 'owner',
        include: {
          Query: {
            childEntityForOwn: ['PostAccess', 'RestaurantAccess'],
            entityToken: ['Restaurant'],
            entityForOwn: ['User', 'RestaurantAccess'],
            entitiesByUniqueForOwn: ['User'],
          },
          Mutation: {
            updateEntityAndUserForOwn: ['Restaurant'],
          },
        },
      },
      creator: {
        name: 'creator',
        include: {
          Mutation: {
            createEntityForCreate: ['Post', 'Restaurant'],
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
            entitiesForToggle: ['Post', 'Restaurant'],
            entityForToggle: ['Post', 'Restaurant'],
          },
          Mutation: {
            updateEntityForToggle: ['Post', 'Restaurant'],
            removeStaticEntity: ['Post', 'Restaurant'],
          },
        },
      },
      admin: {
        name: 'admin',
        include: {
          Query: {
            entityForSetting: ['Restaurant', 'User'],
            childEntities: ['LegalEntity'],
            entitiesForSetting: ['User'],
          },
          Mutation: {
            cloneLevelOfEntity: ['Restaurant'],
            updateEntityForSetting: ['Restaurant', 'User'],
          },
        },
      },
      guest: {
        name: 'guest',
        include: {
          Query: {
            childEntityForGuest: ['CommentListForRestaurant'],
          },
          Mutation: {
            pushIntoEntityForGuest: ['CommentListForRestaurant'],
            getEntityBySMS: ['PhoneConfirmationCode'],
            addNewTelToEntityForGuest: ['User'],
            signoutEntityForGuest: ['User'],
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
            allowAccessToEntity: ['Restaurant'],
            removeStaticEntity: ['Post', 'Restaurant'],
            renewEntityForView: ['User'],
            signinEntityForView: ['User'],
          },
          Query: {
            entitiesForView: ['Restaurant', 'Post', 'MenuSection'],
            entityForView: ['Restaurant', 'Post', 'Menu'],
            childEntityForView: ['BanquetHall', 'ConferenceHall', 'Restaurant', 'Menu'],
            childEntitiesForView: ['Post', 'MenuSection'],
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            entityForApprove: ['Restaurant', 'Post'],
            childEntities: ['MenuSectionClone'],
            entitiesForApprove: ['Post', 'Restaurant'],
            childEntityForApprove: ['User'],
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
            deleteWithChildrenEntity: ['MenuClone'],
          },
        },
      },
      insider: {
        name: 'insider',
        include: {
          Query: {
            childEntityForCabinet: [
              'BanquetHall',
              'ConferenceHall',
              'Menu',
              'CommentListForRestaurant',
              'Post',
              'Restaurant',
            ],
            entityForCabinet: ['Restaurant', 'Post'],
            childEntitiesForCabinet: ['MenuSection', 'Post', 'Restaurant'],
            entitiesForCabinet: ['Post', 'Restaurant'],
            entity: ['LegalEntity', 'RestaurantLevel'],
            childEntities: ['LegalEntity'],
          },
          Mutation: {
            cloneLevelOfEntity: ['Restaurant'],
            improvedUpdateEntity: ['RestaurantLevel'],
            updateEntity: ['RestaurantLevel'],
          },
        },
      },
      editor: {
        name: 'editor',
        include: {
          Query: {
            entityForEdit: ['Restaurant'],
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
            improvedUpdateEntity: [
              'BanquetHallClone',
              'ConferenceHallClone',
              'MenuClone',
              'PostClone',
              'RestaurantClone',
            ],
            updateEntityWithChildren: ['MenuClone'],
            toggleCommentsOfEntity: ['Restaurant'],
          },
        },
      },
      owner: {
        name: 'owner',
        include: {
          Query: {
            childEntityForOwn: ['PostAccess', 'RestaurantAccess'],
            entityToken: ['Restaurant'],
            entityForOwn: ['User', 'RestaurantAccess'],
            entitiesByUniqueForOwn: ['User'],
          },
          Mutation: {
            updateEntityAndUserForOwn: ['Restaurant'],
          },
        },
      },
      creator: {
        name: 'creator',
        include: {
          Mutation: {
            createEntityForCreate: ['Post', 'Restaurant'],
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
            entitiesForToggle: ['Post', 'Restaurant'],
            entityForToggle: ['Post', 'Restaurant'],
          },
          Mutation: {
            updateEntityForToggle: ['Post', 'Restaurant'],
          },
        },
      },
      admin: {
        name: 'admin',
        include: {
          Query: {
            entityForSetting: ['Restaurant', 'User'],
            entitiesForSetting: ['User'],
          },
          Mutation: {
            updateEntityForSetting: ['Restaurant', 'User'],
          },
        },
      },
      guest: {
        name: 'guest',
        include: {
          Query: {
            childEntityForGuest: ['CommentListForRestaurant'],
          },
          Mutation: {
            pushIntoEntityForGuest: ['CommentListForRestaurant'],
            getEntityBySMS: ['PhoneConfirmationCode'],
            addNewTelToEntityForGuest: ['User'],
            signoutEntityForGuest: ['User'],
          },
        },
      },
      root: { name: 'root' },
    };

    const result = compressInventory(inventoryByRoles, umbrellaInventory);

    expect(result).toEqual(expectedResult);
  });
});
