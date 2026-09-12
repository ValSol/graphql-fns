/* eslint-env jest */
import type { RepresentationAttributes } from '../tsTypes';

import composeRepresentation from './composeRepresentation';

describe('composeRepresentation', () => {
  const exampleConfig = { name: 'Example' };
  const postConfig = { name: 'Post' };
  const restaurantConfig = { name: 'Restaurant' };

  const allEntityConfigs = {
    Example: exampleConfig,
    Post: postConfig,
    Restaurant: restaurantConfig,
  };

  test('compose simple representations', () => {
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

    const ForView: RepresentationAttributes = {
      representationKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForApprove: RepresentationAttributes = {
      representationKey: 'ForApprove',
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
    const userConfig = { name: 'User' };

    const allEntityConfigs = { Post: postConfig, Restaurant: restaurantConfig, User: userConfig };

    const result = composeRepresentation([ForView, ForApprove], allEntityConfigs);

    const expectedResult = { ForView, ForApprove };
    expect(result).toEqual(expectedResult);
  });

  test('compose representations with additional virtual configs', () => {
    const ForView: RepresentationAttributes = {
      representationKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: RepresentationAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
      },
      representationKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
    };

    const result = composeRepresentation([ForView, ForCatalog], allEntityConfigs);

    const expectedForCatalog: RepresentationAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      representationKey: 'ForCatalog',

      excludeFields: { Example: ['anotherField'] },
    };

    const expectedResult = { ForView, ForCatalog: expectedForCatalog };
    expect(result).toEqual(expectedResult);
  });

  test('compose representations with additional virtual configs if child actions', () => {
    const ForView: RepresentationAttributes = {
      representationKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: RepresentationAttributes = {
      allow: {
        Example: ['childEntitiesThroughConnection'],
      },
      representationKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
    };

    const result = composeRepresentation([ForView, ForCatalog], allEntityConfigs);

    const expectedForCatalog: RepresentationAttributes = {
      allow: {
        Example: ['childEntitiesThroughConnection'],
        ExampleConnection: [],
        ExampleEdge: [],
      },

      representationKey: 'ForCatalog',

      excludeFields: { Example: ['anotherField'] },
    };

    const expectedResult = { ForView, ForCatalog: expectedForCatalog };
    expect(result).toEqual(expectedResult);
  });

  test('compose representations with additional virtual configs and change output entity', () => {
    const ForView: RepresentationAttributes = {
      representationKey: 'ForView',
      allow: {
        Restaurant: ['entity', 'entities'],
        Post: ['entity', 'entities'],
      },
    };

    const ForCatalog: RepresentationAttributes = {
      allow: {
        Example: ['entitiesThroughConnection'],
      },
      representationKey: 'ForCatalog',
      excludeFields: { Example: ['anotherField'] },
      involvedOutputRepresentationKeys: { Example: { outputEntity: 'ForView' } },
    };

    const result = composeRepresentation([ForView, ForCatalog], allEntityConfigs);

    const expectedForView: RepresentationAttributes = {
      representationKey: 'ForView',
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
