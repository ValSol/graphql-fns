import type { Inventory } from '../../tsTypes';

import composeInventoryByRoles from './composeInventoryByRoles';

describe('composeInventoryByRoles', () => {
  test('compose simple allEntityConfigs', () => {
    const empty: Inventory = {
      name: '',
      include: {
        Query: {
          entityForView: true,
          entitiesForView: true,
        },
        Mutation: { renewEntityForView: true, signinEntityForView: true },
      },
    };

    const guest: Inventory = {
      name: 'guest',
      include: {
        Mutation: {
          signoutEntityForView: true,
          pushIntoEntityForView: ['CommentListForRestaurant'],
        },
      },
    };

    const informer: Inventory = {
      name: 'informer',
      include: {
        Query: {
          entityForEdit: true,
          entitiesForEdit: true,
          entity: ['RestaurantClone', 'PostClone'],
        },
        Mutation: {
          cloneEntity: ['Post', 'Restaurant'],
          updateEntity: ['RestaurantClone', 'PostClone'],
        },
      },
    };

    const editor: Inventory = {
      name: 'editor',
      include: {
        Query: {
          entityForEdit: true,
          entitiesForEdit: true,
          entity: ['RestaurantClone', 'PostClone'],
        },
        Mutation: {
          cloneEntity: true,
          toggleCommentsOfEntity: ['Restaurant'],
          updateEntity: ['RestaurantClone', 'PostClone'],
        },
      },
    };

    const publisher: Inventory = {
      name: 'publisher',
      include: {
        Query: {
          entityForApprove: true,
          entitiesForApprove: true,
          entity: ['RestaurantClone', 'PostClone'],
        },
        Mutation: {
          copyEntity: true,
          updateEntity: ['RestaurantClone', 'PostClone'],
          deleteEntity: ['RestaurantClone', 'PostClone'],
        },
      },
    };

    const toggler: Inventory = {
      name: 'toggler',
      include: {
        Query: {
          entityForToggle: true,
          entitiesForToggle: true,
        },
        Mutation: {
          updateEntityForToggle: ['Restaurant', 'Post'],
        },
      },
    };

    const creator: Inventory = {
      name: 'creator',
      include: {
        Query: {
          entityForCreate: true,
        },
        Mutation: {
          createEntityForCreate: ['Restaurant', 'Post'],
        },
      },
    };

    const inventories = [empty, guest, informer, editor, publisher, toggler, creator];

    const result = composeInventoryByRoles(inventories);

    const expectedResult = { '': empty, guest, informer, editor, publisher, toggler, creator };
    expect(result).toEqual(expectedResult);
  });
});
