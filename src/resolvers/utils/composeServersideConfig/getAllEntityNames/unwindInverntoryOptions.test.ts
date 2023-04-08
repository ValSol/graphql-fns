/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DerivativeAttributes,
  EntityConfig,
  GeneralConfig,
  Inventory,
  InventoryOptions,
} from '../../../../tsTypes';

import composeDerivativeConfigByName from '../../../../utils/composeDerivativeConfigByName';
import unwindInverntoryOptions from './unwindInverntoryOptions';

describe('unwindInverntoryOptions', () => {
  const ForCatalogDerivative: DerivativeAttributes = {
    allow: { Example: ['entities', 'updateEntity'] },
    derivativeKey: 'ForCatalog',
  };

  const specialUpdateEntity: ActionSignatureMethods = {
    name: 'specialUpdateEntity',
    specificName: ({ name }: any) => (name === 'Example' ? `specialUpdate${name}` : ''),
    argNames: () => ['whereOne'],
    argTypes: ({ name }: any) => [`${name}WhereOneInput!`],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
    type: ({ name }: any) => `${name}ForCatalog`,
    config: (exampleConfig: any, generalConfig: any) =>
      composeDerivativeConfigByName('ForCatalog', exampleConfig, generalConfig),
  };

  const childExampleConfig: EntityConfig = {
    name: 'ChildExample',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  const exampleConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],

    relationalFields: [{ name: 'child', config: childExampleConfig }],
  };

  const exampleFileConfig: EntityConfig = {
    name: 'ExampleFile',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  const allEntityConfigs = {
    Example: exampleConfig,
    ExampleFile: exampleFileConfig,
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

  const derivative = { ForCatalog: ForCatalogDerivative };

  const generalConfig: GeneralConfig = { allEntityConfigs, custom, derivative, inventory };

  describe('actions full lists', () => {
    const allQueries = {
      childEntity: ['ChildExample'],
      entities: ['Example', 'ChildExample'],
      entitiesByUnique: ['Example', 'ChildExample'],
      entitiesForCatalog: ['Example'],
      entitiesThroughConnection: ['Example', 'ChildExample'],
      entity: ['Example', 'ChildExample'],
      entityCount: ['Example', 'ChildExample'],
      entityDistinctValues: ['Example', 'ChildExample'],
      entityFile: ['ExampleFile'],
      entityFileCount: ['ExampleFile'],
      entityFiles: ['ExampleFile'],
      entityFilesThroughConnection: ['ExampleFile'],
      specialUpdateEntity: ['Example'],
    };

    const allMutations = {
      createEntity: ['Example', 'ChildExample'],
      createManyEntities: ['Example', 'ChildExample'],
      deleteEntity: ['Example', 'ChildExample'],
      deleteFilteredEntities: ['Example', 'ChildExample'],
      deleteFilteredEntitiesReturnScalar: ['Example', 'ChildExample'],
      deleteManyEntities: ['Example', 'ChildExample'],
      importEntities: ['Example', 'ChildExample'],
      updateEntity: ['Example', 'ChildExample'],
      updateEntityForCatalog: ['Example'],
      updateFilteredEntities: ['Example', 'ChildExample'],
      updateFilteredEntitiesReturnScalar: ['Example', 'ChildExample'],
      updateManyEntities: ['Example', 'ChildExample'],
      uploadEntityFiles: ['ExampleFile'],
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
