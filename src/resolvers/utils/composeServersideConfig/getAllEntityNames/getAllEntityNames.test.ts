/* eslint-env jest */
import type {
  DerivativeAttributes,
  TangibleEntityConfig,
  GeneralConfig,
  Inventory,
} from '../../../../tsTypes';

import getAllEntityNames from './index';

describe('getAllEntityNames', () => {
  const personConfig = {} as TangibleEntityConfig;

  const placeConfig: TangibleEntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
        type: 'duplexFields',
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
        type: 'textFields',
      },
      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
        type: 'duplexFields',
      },
    ],

    relationalFields: [
      {
        name: 'friends',
        config: personConfig,
        array: true,
        required: true,
        type: 'relationalFields',
      },
      {
        name: 'enemies',
        config: personConfig,
        array: true,
        type: 'relationalFields',
      },
      {
        name: 'location',
        config: placeConfig,
        required: true,
        type: 'relationalFields',
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
    const serversideConfig: Record<string, any> = {};

    const result = getAllEntityNames(generalConfig, serversideConfig);

    const expectedResult = {
      Place: {
        descriptions: [
          'inventory "test", option item: "childEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entityCount": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entityDistinctValues": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entitiesThroughConnection": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entitiesByUnique": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "createManyEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "createEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteFilteredEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesReturnScalar": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesWithChildren": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesWithChildrenReturnScalar": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteManyEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteManyEntitiesWithChildren": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteEntityWithChildren": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "importEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "pushIntoEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateManyEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateEntity": "Place", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
      Person: {
        descriptions: [
          'inventory "test", option item: "childEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "childEntitiesThroughConnection": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entityCount": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entityDistinctValues": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entitiesThroughConnection": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entitiesByUnique": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "createManyEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "createEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteFilteredEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteFilteredEntitiesReturnScalar": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteManyEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deleteEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "importEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "pushIntoEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateManyEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateEntity": "Person", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
      PersonForView: {
        descriptions: [
          'inventory "test", option item: "entityForView": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entitiesForView": "Person", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
