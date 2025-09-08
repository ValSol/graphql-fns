/* eslint-env jest */
import type { DescendantAttributes } from '../tsTypes';

import composeDescendant from './composeDescendant';

describe('composeDescendant', () => {
  const exampleConfig = { name: 'Example' };

  const allEntityConfigs = { Example: exampleConfig };

  test('compose simple descendants', () => {
    const filteredRestaurantFieldNames = [
      'clone',
      'backup',
      'show',
      'editors',
      'publishers',
      'togglers',
      'creators',
    ];

    const filteredPostFieldNames = [
      'clone',
      'backup',
      'show',
      'editors',
      'publishers',
      'togglers',
      'creators',
    ];

    const ForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForApprove: DescendantAttributes = {
      descendantKey: 'ForApprove',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
        User: ['entity'],
      },

      includeFields: {
        User: ['email'],
      },

      excludeFields: {
        Restaurant: filteredRestaurantFieldNames,
        Post: filteredPostFieldNames,
      },

      addFields: {
        Restaurant: {
          relationalFields: [
            { name: 'submitter', oppositeName: 'restaurants', configName: 'User' },
          ],
        },
        Post: {
          relationalFields: [{ name: 'submitter', oppositeName: 'posts', configName: 'User' }],
        },
      },
    };

    const postConfig = { name: 'Post' };
    const restaurantConfig = { name: 'Restaurant' };

    const allEntityConfigs = { Post: postConfig, Restaurant: restaurantConfig };

    const result = composeDescendant([ForView, ForApprove], allEntityConfigs);

    const expectedResult = { ForView, ForApprove };
    expect(result).toEqual(expectedResult);
  });

  test('compose descendants with additional virtual configs', () => {
    const ForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: DescendantAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
      },
      descendantKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
    };

    const result = composeDescendant([ForView, ForCatalog], allEntityConfigs);

    const expectedForCatalog: DescendantAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      descendantKey: 'ForCatalog',

      excludeFields: { Example: ['anotherField'] },
    };

    const expectedResult = { ForView, ForCatalog: expectedForCatalog };
    expect(result).toEqual(expectedResult);
  });

  test('compose descendants with additional virtual configs if child actions', () => {
    const ForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: DescendantAttributes = {
      allow: {
        Example: ['childEntitiesThroughConnection'],
      },
      descendantKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
    };

    const result = composeDescendant([ForView, ForCatalog], allEntityConfigs);

    const expectedForCatalog: DescendantAttributes = {
      allow: {
        Example: ['childEntitiesThroughConnection'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      descendantKey: 'ForCatalog',

      excludeFields: { Example: ['anotherField'] },
    };

    const expectedResult = { ForView, ForCatalog: expectedForCatalog };
    expect(result).toEqual(expectedResult);
  });

  test('compose descendants with additional virtual configs and change output entity', () => {
    const ForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: DescendantAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
      },
      descendantKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
      involvedOutputDescendantKeys: { Example: { outputEntity: 'ForView' } },
    };

    const result = composeDescendant([ForView, ForCatalog], allEntityConfigs);

    const expectedForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
        ExampleConnection: [],
        ExampleEdge: [],
      },
    };

    const expectedResult = { ForView: expectedForView, ForCatalog };
    expect(result).toEqual(expectedResult);
  });
});
