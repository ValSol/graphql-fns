// @flow
/* eslint-env jest */

import type { EntityConfig } from '../flowTypes';

import createManyEntitiesMutationAttributes from './actionAttributes/createManyEntitiesMutationAttributes';
import composeStandardActionSignature from './composeStandardActionSignature';

describe('composeStandardActionSignature util', () => {
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
        },
      ],
    };

    const dic = {};

    const result = await composeStandardActionSignature(
      entityConfig,
      createManyEntitiesMutationAttributes,
      dic,
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

    expect(dic).toEqual(expectedDic);
  });
});
