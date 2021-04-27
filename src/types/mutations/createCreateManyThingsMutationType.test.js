// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createManyThingsMutationAttributes from '../actionAttributes/createManyThingsMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createCreateManyThingsMutationType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [{ name: 'textField' }],
    };
    const expectedResult = '  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(
      thingConfig,
      createManyThingsMutationAttributes,
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
}`,
    };

    expect(dic).toEqual(expectedDic);
  });
});
