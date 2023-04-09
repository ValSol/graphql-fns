/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../tsTypes';

import createManyEntitiesMutationAttributes from './actionAttributes/createManyEntitiesMutationAttributes';
import composeActionSignature from './composeActionSignature';

describe('composeActionSignature util', () => {
  test('should return right result', async () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
          weight: 1,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = await composeActionSignature(
      entityConfig,
      generalConfig,
      createManyEntitiesMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    const expectedResult = '  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!';

    expect(result).toEqual(expectedResult);

    const expectedDic = {
      ExampleCreateInput: `input ExampleCreateInput {
  id: ID
  textField: [String!]
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
