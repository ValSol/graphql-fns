/* eslint-env jest */
import type { DescendantAttributes } from '../tsTypes';

import composeDescendant from './composeDescendant';

describe('composeDescendant', () => {
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
          relationalFields: [{ name: 'submitter', configName: 'User' }],
        },
        Post: {
          relationalFields: [{ name: 'submitter', configName: 'User' }],
        },
      },

      descendantFields: {
        Restaurant: {
          posts: 'ForView',
          commentList: 'ForView',
          submitter: 'ForApprove',
        },
        Post: {
          restaurants: 'ForView',
          submitter: 'ForApprove',
        },
      },
    };
    const result = composeDescendant([ForView, ForApprove]);

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

    const result = composeDescendant([ForView, ForCatalog]);

    const expectedForCatalog: DescendantAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      descendantKey: 'ForCatalog',

      excludeFields: { Example: ['anotherField'] },

      descendantFields: {
        ExampleEdge: { node: 'ForCatalog' },
        ExampleConnection: { edges: 'ForCatalog' },
      },
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

    const result = composeDescendant([ForView, ForCatalog]);

    const expectedForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      descendantFields: {
        ExampleEdge: { node: 'ForView' },
        ExampleConnection: { edges: 'ForView' },
      },
    };

    const expectedResult = { ForView: expectedForView, ForCatalog };
    expect(result).toEqual(expectedResult);
  });
});
