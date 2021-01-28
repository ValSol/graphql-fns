// @flow
/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../../flowTypes';

import composeQuery from './composeQuery';

describe('composeQuery', () => {
  const prefixName = 'Home';
  const getThing: ActionSignatureMethods = {
    name: 'getThing',
    specificName(thingConfig) {
      const { name } = thingConfig;
      return `get${name}`;
    },
    argNames() {
      return ['path'];
    },
    argTypes() {
      return ['String!'];
    },
    type(thingConfig) {
      const { name } = thingConfig;
      return `[${name}!]!`;
    },
    config(thingConfig) {
      return thingConfig;
    },
  };

  const tokenForThing: ActionSignatureMethods = {
    name: 'tokenForThing',
    specificName(thingConfig) {
      const { name } = thingConfig;
      return `tokenFor${name}`;
    },
    argNames() {
      return ['path'];
    },
    argTypes() {
      return ['String!'];
    },
    type: () => 'String',
    config: () => null,
  };

  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  const thingConfigs = { Example: thingConfig };
  const custom = { Query: { getThing, tokenForThing } };
  const generalConfig: GeneralConfig = { thingConfigs, custom };

  test('should compose thing query', () => {
    const expectedResult = `query Home_Example($whereOne: ExampleWhereOneInput!) {
  Example(whereOne: $whereOne) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery(prefixName, 'thing', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose things query', () => {
    const expectedResult = `query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {
  Examples(where: $where, sort: $sort) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery(prefixName, 'things', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose thingCount query', () => {
    const expectedResult = `query Home_ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`;

    const result = composeQuery(prefixName, 'thingCount', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose thingDistinctValues query', () => {
    const expectedResult = `query Home_ExampleDistinctValues($where: ExampleWhereInput, $options: ExampleDistinctValuesOptionsInput) {
  ExampleDistinctValues(where: $where, options: $options)
}`;

    const result = composeQuery(prefixName, 'thingDistinctValues', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom getThing query', () => {
    const expectedResult = `query Home_getExample($path: String!) {
  getExample(path: $path) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery(prefixName, 'getThing', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom tokenForThing query', () => {
    const expectedResult = `query Home_tokenForExample($path: String!) {
  tokenForExample(path: $path)
}`;

    const result = composeQuery(prefixName, 'tokenForThing', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
