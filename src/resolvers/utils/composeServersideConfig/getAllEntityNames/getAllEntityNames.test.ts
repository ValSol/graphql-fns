/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, Inventory } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import getAllEntityNames from '.';

describe('getAllEntityNames', () => {
  const Place = {
    name: 'Place',

    textFields: [{ name: 'title', required: true }],

    duplexFields: [
      { name: 'visitors', oppositeName: 'favoritePlace', array: true, configName: 'Person' },
    ],
  };

  const Person = {
    name: 'Person',

    textFields: [
      { name: 'firstName', required: true },
      { name: 'lastName', required: true },
    ],

    duplexFields: [{ name: 'favoritePlace', oppositeName: 'visitors', configName: 'Place' }],

    relationalFields: [
      {
        name: 'friends',
        oppositeName: 'fellows',
        configName: 'Person',
        array: true,
        required: true,
      },
      { name: 'enemies', oppositeName: 'opponents', configName: 'Person', array: true },
      { name: 'location', oppositeName: 'citizens', configName: 'Place', required: true },
    ],
  };

  const ForView: DescendantAttributes = {
    descendantKey: 'ForView',
    allow: {
      Person: ['entity', 'entities', 'childEntityCount'],
      Place: ['childEntity', 'childEntities', 'updatedEntity'],
      PlaceUpdatedPayload: [],
    },
  };

  const descendant = { ForView };

  const inventory: Inventory = {
    name: 'test',
    include: true,
  };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: composeAllEntityConfigs([Person, Place]),
    descendant,
    inventory,
  };

  test('should check the simplest correct filter', () => {
    const serversideConfig: Record<string, any> = {};

    const result = getAllEntityNames(generalConfig, serversideConfig);

    const allEntityNames = {
      Place: {
        descriptions: [
          'inventory "test", option item: "childEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "childEntityGetOrCreate": "Place", involvedEntityKey: "inputOutputEntity"',
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
          'inventory "test", option item: "pushIntoEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateManyEntities": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "createdEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deletedEntity": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updatedEntity": "Place", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
      Person: {
        descriptions: [
          'inventory "test", option item: "childEntityCount": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "childEntityDistinctValues": "Person", involvedEntityKey: "inputOutputEntity"',
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
          'inventory "test", option item: "pushIntoEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateFilteredEntitiesReturnScalar": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateManyEntities": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updateEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "createdEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "deletedEntity": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updatedEntity": "Person", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
      PersonForView: {
        descriptions: [
          'inventory "test", option item: "childEntityCountForView": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entityForView": "Person", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "entitiesForView": "Person", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
      PlaceForView: {
        descriptions: [
          'inventory "test", option item: "childEntityForView": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "childEntitiesForView": "Place", involvedEntityKey: "inputOutputEntity"',
          'inventory "test", option item: "updatedEntityForView": "Place", involvedEntityKey: "inputOutputEntity"',
        ],
        isOutput: true,
      },
    };

    const subscribePayloadEntityNames = {
      Person: {
        descriptions: [
          'inventory "test", option item: "createdEntity": "Person", involvedEntityKey: "inputOutputEntity',
          'inventory "test", option item: "deletedEntity": "Person", involvedEntityKey: "inputOutputEntity',
          'inventory "test", option item: "updatedEntity": "Person", involvedEntityKey: "inputOutputEntity',
        ],
        isOutput: true,
      },
      Place: {
        descriptions: [
          'inventory "test", option item: "createdEntity": "Place", involvedEntityKey: "inputOutputEntity',
          'inventory "test", option item: "deletedEntity": "Place", involvedEntityKey: "inputOutputEntity',
          'inventory "test", option item: "updatedEntity": "Place", involvedEntityKey: "inputOutputEntity',
          'inventory "test", option item: "updatedEntityForView": "Place", involvedEntityKey: "inputOutputEntity',
        ],
        isOutput: true,
      },
    };

    const expectedResult = { allEntityNames, subscribePayloadEntityNames };

    expect(result).toEqual(expectedResult);
  });
});
