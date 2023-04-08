/* eslint-env jest */

import type {
  DerivativeAttributes,
  Enums,
  GeneralConfig,
  ObjectSignatureMethods,
  SimplifiedEntityConfig,
} from '../../tsTypes';

import composeAllEntityConfigs from '../../utils/composeAllEntityConfigs';
import fillInputDicForCustom from './fillInputDicForCustom';

describe('fillInputDicForCustom', () => {
  const entityConfig: SimplifiedEntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      { name: 'textField', index: true },
      { name: 'textArrayField', array: true },
    ],
  };

  const placeConfig: SimplifiedEntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'name' }],
  };

  const personConfig: SimplifiedEntityConfig = {
    name: 'Person',
    type: 'tangible',
    relationalFields: [
      {
        name: 'friends',
        configName: 'Person',
        array: true,
        required: true,
      },
      {
        name: 'enemies',
        configName: 'Person',
        array: true,
      },
      {
        name: 'location',
        configName: 'Place',
        required: true,
      },
      {
        name: 'favoritePlace',
        configName: 'Place',
      },
    ],
  };

  const enumKeys = ['key1', 'key2', 'key3'];
  const enums: Enums = { EnumKeys: enumKeys };

  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['entitiesThroughConnection'], ExampleEdge: [], ExampleConnection: [] },
    derivativeKey: 'ForCatalog',
    derivativeFields: {
      ExampleEdge: { node: 'ForCatalog' },
      ExampleConnection: { edges: 'ForCatalog' },
    },
  };

  const entityInTimeRangeInput: ObjectSignatureMethods = {
    name: 'entityTimeRangeInput',
    specificName: ({ name }: any) => `${name}TimeRangeInput`,
    fieldNames: () => ['start', 'end', 'data'],
    fieldTypes: () => ['DateTime!', 'DateTime!', '[PushIntoExampleForCatalogInput!]!'],
  };

  const custom = {
    Input: { entityInTimeRangeInput },
  };

  const simplifiedAllEntityConfigs = [placeConfig, personConfig, entityConfig];
  const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
  const derivative = { ForCatalog };
  const generalConfig: GeneralConfig = { allEntityConfigs, custom, derivative, enums };

  test('update nothing for argType = "Int"', () => {
    const argType = 'Int';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic: Record<string, any> = {};

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update nothing for argType = "PushIntoExampleInput"', () => {
    const argType = 'PushIntoExampleInput';
    const inputDic = {
      PushIntoExampleInput: `input PushIntoExampleInput {
  textArrayField: [String!]
}`,
    };

    const expectedInputDic = {
      PushIntoExampleInput: `input PushIntoExampleInput {
  textArrayField: [String!]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "PushIntoExampleInput"', () => {
    const argType = 'PushIntoExampleInput';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic = {
      PushIntoExampleInput: `input PushIntoExampleInput {
  textArrayField: [String!]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "PersonUpdateInput"', () => {
    const argType = 'PersonUpdateInput';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic = {
      PersonCreateInput: `input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}`,
      PersonUpdateInput: `input PersonUpdateInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
}`,
      PlaceCreateInput: `input PlaceCreateInput {
  id: ID
  name: String
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
  createPositions: [Int!]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "PushIntoExampleForCatalogInput"', () => {
    const argType = 'PushIntoExampleForCatalogInput';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic = {
      PushIntoExampleForCatalogInput: `input PushIntoExampleForCatalogInput {
  textArrayField: [String!]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "ExampleTimeRangeInput"', () => {
    const argType = 'ExampleTimeRangeInput';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic = {
      ExampleTimeRangeInput: `input ExampleTimeRangeInput {
  start: DateTime!
  end: DateTime!
  data: [PushIntoExampleForCatalogInput!]!
}`,
      PushIntoExampleForCatalogInput: `input PushIntoExampleForCatalogInput {
  textArrayField: [String!]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "PersonCreateChildInput"', () => {
    const argType = 'PersonCreateChildInput';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic = {
      '!PersonCreateChildInput': 'defined',
      PersonCreateInput: `input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}`,
      PlaceCreateInput: `input PlaceCreateInput {
  id: ID
  name: String
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
  createPositions: [Int!]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "ExampleSortEnum"', () => {
    const argType = 'ExampleSortEnum';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic = {
      '!ExampleSortEnum': 'defined',
      ExampleSortInput: `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  textField_ASC
  textField_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
    };

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });

  test('update inputDic for argType = "EnumKeysEnumeration"', () => {
    const argType = 'EnumKeysEnumeration';
    const inputDic: { [inputName: string]: string } = {};

    const expectedInputDic: Record<string, any> = {};

    fillInputDicForCustom(argType, generalConfig, inputDic);
    expect(inputDic).toEqual(expectedInputDic);
  });
});
