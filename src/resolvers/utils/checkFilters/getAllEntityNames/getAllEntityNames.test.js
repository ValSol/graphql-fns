// @flow
/* eslint-env jest */
import type {
  DerivativeAttributes,
  EntityConfig,
  GeneralConfig,
  Inventory,
  ServersideConfig,
} from '../../../../flowTypes';

import getAllEntityNames from './index';

describe('getAllEntityNames', () => {
  const personConfig: EntityConfig = {};

  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
      },
    ],
    duplexFields: [
      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
      },
    ],
  };

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',

    textFields: [
      {
        name: 'firstName',
        required: true,
      },
      {
        name: 'lastName',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
      },
    ],

    relationalFields: [
      {
        name: 'friends',
        config: personConfig,
        array: true,
        required: true,
      },
      {
        name: 'enemies',
        config: personConfig,
        array: true,
      },
      {
        name: 'location',
        config: placeConfig,
        required: true,
      },
    ],
  });

  const ForView: DerivativeAttributes = {
    derivativeKey: 'ForView',
    allow: {
      Person: ['entity', 'entities'],
    },
  };

  const derivative = { ForView };

  const inventory: Inventory = {
    name: 'test',
    include: true,
    exclude: { Subscription: true },
  };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Person: personConfig, Place: placeConfig },
    derivative,
    inventory,
  };

  test('should check the simplest correct filter', () => {
    const serversideConfig: ServersideConfig = {};

    const result = getAllEntityNames(generalConfig, serversideConfig);

    const expectedResult = {
      Place: [
        'inventory "test", option item: "childEntity": "Place"',
        'inventory "test", option item: "entityCount": "Place"',
        'inventory "test", option item: "entityDistinctValues": "Place"',
        'inventory "test", option item: "entity": "Place"',
        'inventory "test", option item: "entities": "Place"',
        'inventory "test", option item: "entitiesThroughConnection": "Place"',
        'inventory "test", option item: "entitiesByUnique": "Place"',
        'inventory "test", option item: "createManyEntities": "Place"',
        'inventory "test", option item: "createEntity": "Place"',
        'inventory "test", option item: "deleteFilteredEntities": "Place"',
        'inventory "test", option item: "deleteFilteredEntitiesReturnScalar": "Place"',
        'inventory "test", option item: "deleteFilteredEntitiesWithChildren": "Place"',
        'inventory "test", option item: "deleteFilteredEntitiesWithChildrenReturnScalar": "Place"',
        'inventory "test", option item: "deleteManyEntities": "Place"',
        'inventory "test", option item: "deleteManyEntitiesWithChildren": "Place"',
        'inventory "test", option item: "deleteEntity": "Place"',
        'inventory "test", option item: "deleteEntityWithChildren": "Place"',
        'inventory "test", option item: "importEntities": "Place"',
        'inventory "test", option item: "pushIntoEntity": "Place"',
        'inventory "test", option item: "updateFilteredEntities": "Place"',
        'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Place"',
        'inventory "test", option item: "updateManyEntities": "Place"',
        'inventory "test", option item: "updateEntity": "Place"',
      ],
      Person: [
        'inventory "test", option item: "childEntities": "Person"',
        'inventory "test", option item: "childEntitiesThroughConnection": "Person"',
        'inventory "test", option item: "entityCount": "Person"',
        'inventory "test", option item: "entityDistinctValues": "Person"',
        'inventory "test", option item: "entity": "Person"',
        'inventory "test", option item: "entities": "Person"',
        'inventory "test", option item: "entitiesThroughConnection": "Person"',
        'inventory "test", option item: "entitiesByUnique": "Person"',
        'inventory "test", option item: "createManyEntities": "Person"',
        'inventory "test", option item: "createEntity": "Person"',
        'inventory "test", option item: "deleteFilteredEntities": "Person"',
        'inventory "test", option item: "deleteFilteredEntitiesReturnScalar": "Person"',
        'inventory "test", option item: "deleteManyEntities": "Person"',
        'inventory "test", option item: "deleteEntity": "Person"',
        'inventory "test", option item: "importEntities": "Person"',
        'inventory "test", option item: "pushIntoEntity": "Person"',
        'inventory "test", option item: "updateFilteredEntities": "Person"',
        'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Person"',
        'inventory "test", option item: "updateManyEntities": "Person"',
        'inventory "test", option item: "updateEntity": "Person"',
      ],
      PersonForView: [
        'inventory "test", option item: "entityForView": "Person"',
        'inventory "test", option item: "entitiesForView": "Person"',
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
