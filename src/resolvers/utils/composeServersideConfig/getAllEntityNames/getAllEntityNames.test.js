// @flow
/* eslint-env jest */
import type {
  DerivativeAttributes,
  EntityConfig,
  GeneralConfig,
  Inventory,
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
    const serversideConfig = {};

    const result = getAllEntityNames(generalConfig, serversideConfig);

    const expectedResult = {
      Place: {
        descriptions: [
          'inventory "test", option item: "childEntity": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "childEntity": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entityCount": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entityDistinctValues": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entity": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entity": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entitiesThroughConnection": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entitiesThroughConnection": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entitiesByUnique": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entitiesByUnique": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "createManyEntities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "createManyEntities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "createEntity": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "createEntity": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteFilteredEntities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteFilteredEntities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesReturnScalar": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesWithChildren": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesWithChildren": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesWithChildrenReturnScalar": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteManyEntities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteManyEntities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteManyEntitiesWithChildren": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteManyEntitiesWithChildren": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteEntity": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteEntity": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteEntityWithChildren": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteEntityWithChildren": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "importEntities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "importEntities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "pushIntoEntity": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "pushIntoEntity": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateManyEntities": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateManyEntities": "Place", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "updateEntity": "Place", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateEntity": "Place", involvedEntityKey: "outputEntity"',
        ],
        isOutput: true,
      },
      Person: {
        descriptions: [
          'inventory "test", option item: "childEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "childEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "childEntitiesThroughConnection": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "childEntitiesThroughConnection": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entityCount": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entityDistinctValues": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entity": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entity": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entitiesThroughConnection": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entitiesThroughConnection": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entitiesByUnique": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entitiesByUnique": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "createManyEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "createManyEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "createEntity": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "createEntity": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteFilteredEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteFilteredEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesReturnScalar": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteManyEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteManyEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "deleteEntity": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "deleteEntity": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "importEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "importEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "pushIntoEntity": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "pushIntoEntity": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateManyEntities": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateManyEntities": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "updateEntity": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "updateEntity": "Person", involvedEntityKey: "outputEntity"',
        ],
        isOutput: true,
      },
      PersonForView: {
        descriptions: [
          'inventory "test", option item: "entityForView": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entityForView": "Person", involvedEntityKey: "outputEntity"',
          'inventory "test", option item: "entitiesForView": "Person", involvedEntityKey: "inputEntity"',
          'inventory "test", option item: "entitiesForView": "Person", involvedEntityKey: "outputEntity"',
        ],
        isOutput: true,
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
