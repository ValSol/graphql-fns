// @flow
/* eslint-env jest */
const composeGqlTypes = require('./composeGqlTypes');

describe('composeGqlTypes', () => {
  test('should create things types for one thing', () => {
    const thingConfig = {
      thingName: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime
  deletedAt: DateTime
  permanentlyDeleted: DateTime
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}
input ExampleInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}
type Mutation {
  addExample(input: ExampleInput): Example!
}`;

    const result = composeGqlTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });
  test('should create things types for two things', () => {
    const thingConfig1 = {
      thingName: 'Example1',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
      ],
    };
    const thingConfig2 = {
      thingName: 'Example2',
      textFields: [
        {
          name: 'textField1',
          array: true,
        },
        {
          name: 'textField2',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const thingConfigs = [thingConfig1, thingConfig2];
    const expectedResult = `type Example1 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime
  deletedAt: DateTime
  permanentlyDeleted: DateTime
  textField1: String
  textField2: String
  textField3: String!
}
type Example2 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime
  deletedAt: DateTime
  permanentlyDeleted: DateTime
  textField1: [String!]!
  textField2: [String!]!
}
input Example1Input {
  textField1: String
  textField2: String
  textField3: String!
}
input Example2Input {
  textField1: [String!]!
  textField2: [String!]!
}
type Mutation {
  addExample1(input: Example1Input): Example1!
  addExample2(input: Example2Input): Example2!
}`;

    const result = composeGqlTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });
});
