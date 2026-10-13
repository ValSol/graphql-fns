import moveEntitiesToObject from './moveEntitiesToObject';

describe('moveEntitiesToObject', () => {
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
      root: { name: 'root' },
    };

    const expectedResult = {
      '': {
        name: '',
        include: {
          Mutation: {
            allowAccessToEntity: { Restaurant: true },
            removeStaticEntity: { Post: true, Restaurant: true },
            renewEntityForView: { User: true },
            signinEntityForView: { User: true },
          },
          Query: {
            entitiesForView: { Restaurant: true, Post: true, MenuSection: true },
            entityForView: { Restaurant: true, Post: true, Menu: true },
            childEntityForView: {
              BanquetHall: true,
              ConferenceHall: true,
              Restaurant: true,
              Menu: true,
            },
            childEntitiesForView: { Post: true, MenuSection: true },
          },
        },
      },
      publisher: {
        name: 'publisher',
        include: {
          Query: {
            entityForApprove: { Restaurant: true, Post: true },
            childEntities: { MenuSectionClone: true },
            entitiesForApprove: { Post: true, Restaurant: true },
            childEntityForApprove: { User: true },
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
            deleteWithChildrenEntity: { MenuClone: true },
            removeStaticEntity: { Restaurant: true, Post: true },
            cloneLevelOfEntity: { Restaurant: true },
          },
        },
      },
      root: { name: 'root' },
    };

    const result = moveEntitiesToObject(inventoryByRoles);

    expect(result).toEqual(expectedResult);
  });
});
