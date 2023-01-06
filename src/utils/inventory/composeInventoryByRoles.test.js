// @flow
/* eslint-env jest */
import type { Inventory } from '../../flowTypes';

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
        Mutation: { renewThingForView: true, signinThingForView: true },
      },
    };

    const guest: Inventory = {
      name: 'guest',
      include: {
        Mutation: {
          signoutThingForView: true,
          pushIntoThingForView: ['CommentListForRestaurant'],
        },
      },
    };

    const informer: Inventory = {
      name: 'informer',
      include: {
        Query: {
          thingForEdit: true,
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
          thingForEdit: true,
          entitiesForEdit: true,
          entity: ['RestaurantClone', 'PostClone'],
        },
        Mutation: {
          cloneEntity: true,
          toggleCommentsOfThing: ['Restaurant'],
          updateEntity: ['RestaurantClone', 'PostClone'],
        },
      },
    };

    const publisher: Inventory = {
      name: 'publisher',
      include: {
        Query: {
          thingForApprove: true,
          thingsForApprove: true,
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
          thingForToggle: true,
          thingsForToggle: true,
        },
        Mutation: {
          updateThingForToggle: ['Restaurant', 'Post'],
        },
      },
    };

    const creator: Inventory = {
      name: 'creator',
      include: {
        Query: {
          thingForCreate: true,
        },
        Mutation: {
          createThingForCreate: ['Restaurant', 'Post'],
          uploadFilesToThingForCreate: ['Restaurant', 'Post'],
        },
      },
    };

    const inventories = [empty, guest, informer, editor, publisher, toggler, creator];

    const result = composeInventoryByRoles(inventories);

    const expectedResult = { '': empty, guest, informer, editor, publisher, toggler, creator };
    expect(result).toEqual(expectedResult);
  });
});
