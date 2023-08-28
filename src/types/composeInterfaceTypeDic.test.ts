/* eslint-env jest */

import type { EntityConfig } from '../tsTypes';

import composeInterfaceTypeDic from './composeInterfaceTypeDic';

describe('composeInterfaceTypeDic', () => {
  test('should create entity type with Text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',

      interfaces: ['ExampleInterface'],

      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };

    const interfaces = { ExampleInterface: ['textField1', 'textField5'] };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig }, interfaces };

    const entityTypeDic = {
      Example: `type Example implements Node & ExampleInterface {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  textField4(slice: SliceInput): [String!]!
  textField5(slice: SliceInput): [String!]!
}`,
    };

    const result = composeInterfaceTypeDic(entityTypeDic, generalConfig);

    const expectedResult = {
      ExampleInterface: `interface ExampleInterface {
  textField1: String
  textField5(slice: SliceInput): [String!]!
}`,
    };

    expect(result).toEqual(expectedResult);
  });
});
