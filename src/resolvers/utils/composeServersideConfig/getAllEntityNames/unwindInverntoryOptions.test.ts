/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DescendantAttributes,
  EntityConfig,
  GeneralConfig,
  Inventory,
  InventoryOptions,
  TangibleEntityConfig,
} from '../../../../tsTypes';

import composeDescendantConfigByName from '../../../../utils/composeDescendantConfigByName';
import unwindInverntoryOptions from './unwindInverntoryOptions';

describe('unwindInverntoryOptions', () => {
  const ForCatalogDescendant: DescendantAttributes = {
    allow: {
      Example: ['childEntityCount', 'entities', 'updateEntity'],
      ChildExample: ['childEntity', 'childEntities'],
    },
    descendantKey: 'ForCatalog',
  };

  const specialUpdateEntity: ActionSignatureMethods = {
    name: 'specialUpdateEntity',
    specificName: ({ name }: any) => (name === 'Example' ? `specialUpdate${name}` : ''),
    argNames: () => ['whereOne'],
    argTypes: ({ name }: any) => [`${name}WhereOneInput!`],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
    type: ({ name }: any) => `${name}ForCatalog`,
    config: (exampleConfig: any, generalConfig: any) =>
      composeDescendantConfigByName('ForCatalog', exampleConfig, generalConfig),
  };

  const exampleConfig = {} as TangibleEntityConfig;
  const childExampleConfig: EntityConfig = {
    name: 'ChildExample',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'parentChild',
        oppositeName: 'child',
        config: exampleConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  };

  Object.assign(exampleConfig, {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],

    relationalFields: [
      {
        name: 'child',
        oppositeName: 'parentChild',
        config: childExampleConfig,
        type: 'relationalFields',
      },
    ],
  });

  const allEntityConfigs = {
    Example: exampleConfig,
    ChildExample: childExampleConfig,
  };
  const inventory: Inventory = {
    name: 'test',

    include: {
      Query: { entitiesForCatalog: true, entity: true, specialUpdateEntity: true },
      Mutation: true,
    },
  };

  const custom = {
    Query: { specialUpdateEntity },
  };

  const descendant = { ForCatalog: ForCatalogDescendant };

  const generalConfig: GeneralConfig = { allEntityConfigs, custom, descendant, inventory };

  describe('actions full lists', () => {
    const allQueries = {
      childEntity: ['ChildExample'],
      childEntityCount: ['Example'],
      childEntities: ['Example'],
      childEntitiesForCatalog: ['ChildExample'],
      childEntitiesThroughConnection: ['Example'],
      childEntityCountForCatalog: ['Example'],
      childEntityDistinctValues: ['Example'],
      childEntityForCatalog: ['ChildExample'],
      childEntityGetOrCreate: ['ChildExample'],
      entities: ['Example', 'ChildExample'],
      entitiesByUnique: ['Example', 'ChildExample'],
      entitiesForCatalog: ['Example'],
      entitiesThroughConnection: ['Example', 'ChildExample'],
      entity: ['Example', 'ChildExample'],
      entityCount: ['Example', 'ChildExample'],
      entityDistinctValues: ['Example', 'ChildExample'],
      specialUpdateEntity: ['Example'],
    };

    const allMutations = {
      createEntity: ['Example', 'ChildExample'],
      createManyEntities: ['Example', 'ChildExample'],
      deleteEntity: ['Example', 'ChildExample'],
      deleteFilteredEntities: ['Example', 'ChildExample'],
      deleteFilteredEntitiesReturnScalar: ['Example', 'ChildExample'],
      deleteManyEntities: ['Example', 'ChildExample'],
      updateEntity: ['Example', 'ChildExample'],
      updateEntityForCatalog: ['Example'],
      updateFilteredEntities: ['Example', 'ChildExample'],
      updateFilteredEntitiesReturnScalar: ['Example', 'ChildExample'],
      updateManyEntities: ['Example', 'ChildExample'],
    };

    test('should unwind all actions', () => {
      const inventoryOptions: InventoryOptions = {};

      const result = unwindInverntoryOptions(inventoryOptions, generalConfig);

      const expectedResult = { Query: allQueries, Mutation: allMutations };
      expect(result).toEqual(expectedResult);
    });

    test('should unwind all actions', () => {
      const inventoryOptions: InventoryOptions = { Query: true };

      const result = unwindInverntoryOptions(inventoryOptions, generalConfig);

      const expectedResult = { Query: allQueries, Mutation: {} };
      expect(result).toEqual(expectedResult);
    });

    test('should unwind all actions', () => {
      const inventoryOptions: InventoryOptions = { Mutation: true };

      const result = unwindInverntoryOptions(inventoryOptions, generalConfig);

      const expectedResult = { Query: {}, Mutation: allMutations };
      expect(result).toEqual(expectedResult);
    });

    test('should unwind all actions', () => {
      const inventoryOptions: InventoryOptions = { Mutation: true };

      const result = unwindInverntoryOptions(inventoryOptions, generalConfig);

      const expectedResult = { Query: {}, Mutation: allMutations };
      expect(result).toEqual(expectedResult);
    });
  });

  test('should unwind all actions', () => {
    const inventoryOptions: InventoryOptions = {
      Mutation: { createEntity: ['Example', 'ChildExample'] },
    };

    const result = unwindInverntoryOptions(inventoryOptions, generalConfig);

    const expectedResult = { Query: {}, Mutation: { createEntity: ['Example', 'ChildExample'] } };
    expect(result).toEqual(expectedResult);
  });
});
