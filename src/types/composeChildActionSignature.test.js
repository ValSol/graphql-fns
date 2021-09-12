// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

import composeChildActionSignature from './composeChildActionSignature';

describe('composeChildActionSignature util', () => {
  test('should return right result', async () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
          weight: 1,
        },
      ],
    };

    const dic = {};

    const result = await composeChildActionSignature(thingConfig, dic);
    const expectedResult = 'where: ExampleWhereInput, sort: ExampleSortInput, search: String';

    expect(result).toEqual(expectedResult);

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
  textField_re: [RegExp!]
  textField_size: Int
  textField_notsize: Int
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

    expect(dic).toEqual(expectedDic);
  });
});
