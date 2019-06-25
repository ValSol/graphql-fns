// @flow
/* eslint-env jest */

import type { GeneralConfig, SignatureMethods, ThingConfig } from '../../flowTypes';

import composeQuery from './composeQuery';

describe('composeQuery', () => {
  const signatureMethods: SignatureMethods = {
    name(thingConfig) {
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

  const thingConfigs = [thingConfig];
  const custom = { Query: { getThing: signatureMethods } };
  const generalConfig: GeneralConfig = { thingConfigs, custom };

  test('should compose thing query', () => {
    const expectedResult = `query Example($whereOne: ExampleWhereOneInput!) {
  Example(whereOne: $whereOne) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery('thing', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose things query', () => {
    const expectedResult = `query Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {
  Examples(where: $where, sort: $sort) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery('things', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose thingCount query', () => {
    const expectedResult = `query ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`;

    const result = composeQuery('thingCount', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom getThing query', () => {
    const expectedResult = `query getExample($path: String!) {
  getExample(path: $path) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery('getThing', thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
