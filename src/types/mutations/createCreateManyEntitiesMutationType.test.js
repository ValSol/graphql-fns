// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createManyEntitiesMutationAttributes from '../actionAttributes/createManyEntitiesMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createCreateManyEntitiesMutationType', () => {
  test('should create mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField' }],
    };
    const expectedResult = '  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      createManyEntitiesMutationAttributes,
      dic,
    );

    expect(result).toEqual(expectedResult);
    const expectedDic = {
      ExampleCreateInput: `input ExampleCreateInput {
  id: ID
  textField: String
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
    };

    expect(dic).toEqual(expectedDic);
  });
});
