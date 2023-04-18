/* eslint-env jest */

import type { DescendantAttributes } from '../../../tsTypes';

import extractDataFromDescendant from './extractDataFromDescendant';

describe('extractDataFromDescendant util', () => {
  test('should return valid actions matrix', () => {
    const actionTypes: {
      [actionName: string]: 'Query' | 'Mutation' | 'Subscription';
    } = {
      entity: 'Query',
      entities: 'Query',
      entityCount: 'Query',
      createEntity: 'Mutation',
    };

    const descendant: {
      [descendantKey: string]: DescendantAttributes;
    } = {
      ForEdit: {
        allow: {
          Restaurant: ['entity'],
          Post: ['entity', 'createEntity'],
        },
        descendantKey: 'ForEdit',
      },
      ForView: {
        allow: {
          Restaurant: ['entity', 'entities'],
          Post: ['entity', 'entities'],
          User: ['entity'],
        },
        descendantKey: 'ForView',
      },
    };

    const descendantActionNames = [
      'entityForEdit',
      'entityForView',
      'entitiesForView',
      'createEntityForEdit',
    ];

    const descendantActionTypes = {
      entityForEdit: 'DescendantQuery',
      createEntityForEdit: 'DescendantMutation',
      entityForView: 'DescendantQuery',
      entitiesForView: 'DescendantQuery',
    };

    const thingNamesByDescendantActions = {
      entityForEdit: ['Restaurant', 'Post'],
      createEntityForEdit: ['Post'],
      entityForView: ['Restaurant', 'Post', 'User'],
      entitiesForView: ['Restaurant', 'Post'],
    };

    const result = extractDataFromDescendant({ actionTypes, descendant });

    expect(result).toEqual({
      descendantActionNames,
      descendantActionTypes,
      thingNamesByDescendantActions,
    });
  });
});
