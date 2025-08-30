/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../tsTypes';

import deletedEntitySubscriptionAttributes from './actionAttributes/deletedEntitySubscriptionAttributes';
import createManyEntitiesMutationAttributes from './actionAttributes/createManyEntitiesMutationAttributes';
import composeActionSignature from './composeActionSignature';

describe('composeActionSignature util', () => {
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

  test('createManyEntitiesMutationAttributes', async () => {
    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      createManyEntitiesMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    const expectedResult =
      '  createManyExamples(data: [ExampleCreateInput!]!, token: String): [Example!]!';

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

  test('createDeletedEntitySubscriptionAttributes', async () => {
    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      deletedEntitySubscriptionAttributes,
      entityTypeDic,
      inputDic,
    );
    const expectedResult = '  deletedExample(wherePayload: ExampleWherePayloadInput): Example!';

    expect(result).toEqual(expectedResult);

    const expectedDic = {
      ExampleWherePayloadInput: `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
  textField_re: [RegExp!]
  textField_size: Int
  textField_notsize: Int
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
    };

    expect(inputDic).toEqual(expectedDic);
  });
});
