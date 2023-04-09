/* eslint-env jest */

import type { EntityConfig } from '../tsTypes';

import composeChildActionSignature from './composeChildActionSignature';

describe('composeChildActionSignature util', () => {
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

    const generalConfig = { allEntityConfigs: { Example: entityConfig } };

    const inputDic: { [inputName: string]: string } = {};

    const result = composeChildActionSignature(
      entityConfig,
      generalConfig,
      'childEntities',
      inputDic,
    );
    const expectedResult =
      'where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, search: String';

    expect(result).toEqual(expectedResult);

    const result2 = composeChildActionSignature(
      entityConfig,
      generalConfig,
      'childEntitiesThroughConnection',
      inputDic,
    );
    const expectedResult2 =
      'where: ExampleWhereInput, sort: ExampleSortInput, search: String, after: String, before: String, first: Int, last: Int';

    expect(result2).toEqual(expectedResult2);

    const expectedDic = {
      ExampleWhereInput: `input ExampleWhereInput {
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
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
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
}`,
      PaginationInput: `input PaginationInput {
  skip: Int
  first: Int
}`,
      ExampleSortInput: `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
    };

    expect(inputDic).toEqual(expectedDic);
  });

  test('should return right result without inputDic', async () => {
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

    const generalConfig = { allEntityConfigs: { Example: entityConfig } };

    const result = composeChildActionSignature(entityConfig, generalConfig, 'childEntities');
    const expectedResult =
      'where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, search: String';

    expect(result).toEqual(expectedResult);

    const result2 = composeChildActionSignature(
      entityConfig,
      generalConfig,
      'childEntitiesThroughConnection',
    );
    const expectedResult2 =
      'where: ExampleWhereInput, sort: ExampleSortInput, search: String, after: String, before: String, first: Int, last: Int';

    expect(result2).toEqual(expectedResult2);
  });
});
