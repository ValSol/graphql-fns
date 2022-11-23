// @flow
/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../../flowTypes';

import composeMutation from './composeMutation';

describe('composeMutation', () => {
  const loadThing: ActionSignatureMethods = {
    name: 'loadThing',
    specificName(thingConfig) {
      const { name } = thingConfig;
      return `load${name}`;
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

  const prefixName = 'Home';

  const thingConfig: ThingConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };
  const thingConfigs = { Example: thingConfig };
  const custom = { Mutation: { loadThing, tokenForThing } };
  const generalConfig: GeneralConfig = { thingConfigs, custom };

  test('should compose createThing mutation', () => {
    const mutationName = 'createThing';
    const expectedResult = `mutation Home_createExample($data: ExampleCreateInput!) {
  createExample(data: $data) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose createManyThings mutation', () => {
    const mutationName = 'createManyThings';
    const expectedResult = `mutation Home_createManyExamples($data: [ExampleCreateInput!]!) {
  createManyExamples(data: $data) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose deleteThing mutation', () => {
    const mutationName = 'deleteThing';
    const expectedResult = `mutation Home_deleteExample($whereOne: ExampleWhereOneInput!) {
  deleteExample(whereOne: $whereOne) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose updateThing mutation', () => {
    const mutationName = 'updateThing';
    const expectedResult = `mutation Home_updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!) {
  updateExample(whereOne: $whereOne, data: $data) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom loadThing mutation', () => {
    const mutationName = 'loadThing';
    const expectedResult = `mutation Home_loadExample($path: String!) {
  loadExample(path: $path) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom tokenForThing mutation', () => {
    const mutationName = 'tokenForThing';
    const expectedResult = `mutation Home_tokenForExample($path: String!) {
  tokenForExample(path: $path)
}`;

    const result = composeMutation(prefixName, mutationName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
