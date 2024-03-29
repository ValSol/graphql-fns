/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../../tsTypes';

import composeMutation from './composeMutation';

describe('composeMutation', () => {
  const loadEntity: ActionSignatureMethods = {
    name: 'loadEntity',
    specificName(entityConfig: EntityConfig) {
      const { name } = entityConfig;
      return `load${name}`;
    },
    argNames() {
      return ['path'];
    },
    argTypes() {
      return ['String!'];
    },
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type(entityConfig: EntityConfig) {
      const { name } = entityConfig;
      return `[${name}!]!`;
    },
    config(entityConfig: EntityConfig) {
      return entityConfig;
    },
  };

  const tokenForEntity: ActionSignatureMethods = {
    name: 'tokenForEntity',
    specificName(entityConfig: EntityConfig) {
      const { name } = entityConfig;
      return `tokenFor${name}`;
    },
    argNames() {
      return ['path'];
    },
    argTypes() {
      return ['String!'];
    },
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type: () => 'String',
    config: () => null,
  };

  const prefixName = 'Home';

  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        type: 'textFields',
      },
    ],
  };
  const allEntityConfigs = { Example: entityConfig };
  const custom = { Mutation: { loadEntity, tokenForEntity } };
  const generalConfig: GeneralConfig = { allEntityConfigs, custom };

  test('should compose createEntity mutation', () => {
    const mutationName = 'createEntity';
    const expectedResult = `mutation Home_createExample($data: ExampleCreateInput!, $token: String) {
  createExample(data: $data, token: $token) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose createManyEntities mutation', () => {
    const mutationName = 'createManyEntities';
    const expectedResult = `mutation Home_createManyExamples($data: [ExampleCreateInput!]!, $token: String) {
  createManyExamples(data: $data, token: $token) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose deleteEntity mutation', () => {
    const mutationName = 'deleteEntity';
    const expectedResult = `mutation Home_deleteExample($whereOne: ExampleWhereOneInput!, $token: String) {
  deleteExample(whereOne: $whereOne, token: $token) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose updateEntity mutation', () => {
    const mutationName = 'updateEntity';
    const expectedResult = `mutation Home_updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!, $token: String) {
  updateExample(whereOne: $whereOne, data: $data, token: $token) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom loadEntity mutation', () => {
    const mutationName = 'loadEntity';
    const expectedResult = `mutation Home_loadExample($path: String!) {
  loadExample(path: $path) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(prefixName, mutationName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose custom tokenForEntity mutation', () => {
    const mutationName = 'tokenForEntity';
    const expectedResult = `mutation Home_tokenForExample($path: String!) {
  tokenForExample(path: $path)
}`;

    const result = composeMutation(prefixName, mutationName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
