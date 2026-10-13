import mergeInventories from './mergeInventories';

describe('mergeInventories', () => {
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
    };

    const additionalInventoryByRoles = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToEntity: ['Post'],
            removeStaticEntity: ['Post', 'Restaurant'],
            renewEntityForView: ['User'],
            signinEntityForView: ['User'],
          },
          Query: {
            entitiesForView: ['MenuSection', 'ConferenceHall'],
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
            entity: ['Post'],
            entityForApprove: ['Restaurant', 'Post'],
            childEntities: ['MenuSectionClone'],
            entitiesForApprove: ['Post', 'Restaurant'],
            childEntityForApprove: ['User'],
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
            allowAccessToEntity: ['Restaurant', 'Post'],
            removeStaticEntity: ['Post', 'Restaurant'],
            renewEntityForView: ['User'],
            signinEntityForView: ['User'],
          },
          Query: {
            entitiesForView: ['Restaurant', 'Post', 'MenuSection', 'ConferenceHall'],
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
            entity: ['Post'],
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
      root: { name: 'root' },
    };

    const result = mergeInventories(inventoryByRoles, additionalInventoryByRoles);

    expect(result).toEqual(expectedResult);
  });
});
