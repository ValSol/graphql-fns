/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createManyEntitiesMutationAttributes from '../actionAttributes/createManyEntitiesMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createCreateManyEntitiesMutationType', () => {
  test('should create mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField', type: 'textFields' }],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult =
      '  createManyExamples(data: [ExampleCreateInput!]!, token: String): [Example!]!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      createManyEntitiesMutationAttributes,
      entityTypeDic,
      inputDic,
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

    expect(inputDic).toEqual(expectedDic);
  });
});
