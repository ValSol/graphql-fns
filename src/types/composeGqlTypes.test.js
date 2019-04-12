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
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}
input ExampleCreateInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateChildrenInput {
  connect: [ID!]!
  create: [ExampleCreateInput!]!
}
input ExampleWhereInput {
  id: ID!
}
type Query {
  Example(where: ExampleWhereInput!): Example
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
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
    const expectedResult = `scalar DateTime
type Example1 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  textField1: String
  textField2: String
  textField3: String!
}
type Example2 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  textField1: [String!]!
  textField2: [String!]!
}
input Example1CreateInput {
  textField1: String
  textField2: String
  textField3: String!
}
input Example1CreateChildInput {
  connect: ID
  create: Example1CreateInput
}
input Example1CreateChildrenInput {
  connect: [ID!]!
  create: [Example1CreateInput!]!
}
input Example1WhereInput {
  id: ID!
}
input Example2CreateInput {
  textField1: [String!]!
  textField2: [String!]!
}
input Example2CreateChildInput {
  connect: ID
  create: Example2CreateInput
}
input Example2CreateChildrenInput {
  connect: [ID!]!
  create: [Example2CreateInput!]!
}
input Example2WhereInput {
  id: ID!
}
type Query {
  Example1(where: Example1WhereInput!): Example1
  Example2(where: Example2WhereInput!): Example2
}
type Mutation {
  createExample1(data: Example1CreateInput!): Example1!
  createExample2(data: Example2CreateInput!): Example2!
}`;

    const result = composeGqlTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });
  test('should create things types for two related fields', () => {
    const personConfig = {
      thingName: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          thingName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          thingName: 'Person',
          array: true,
        },
        {
          name: 'location',
          thingName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          thingName: 'Place',
        },
      ],
    };
    const placeConfig = {
      thingName: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const thingConfigs = [personConfig, placeConfig];
    const expectedResult = `scalar DateTime
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  firstName: String!
  lastName: String!
  friends: [Person!]!
  enemies: [Person!]!
  location: Place!
  favoritePlace: Place
}
type Place {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  title: String!
}
input PersonCreateInput {
  firstName: String!
  lastName: String!
  friends: PersonCreateChildrenInput!
  enemies: PersonCreateChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateChildrenInput {
  connect: [ID!]!
  create: [PersonCreateInput!]!
}
input PersonWhereInput {
  id: ID!
}
input PlaceCreateInput {
  title: String!
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateChildrenInput {
  connect: [ID!]!
  create: [PlaceCreateInput!]!
}
input PlaceWhereInput {
  id: ID!
}
type Query {
  Person(where: PersonWhereInput!): Person
  Place(where: PlaceWhereInput!): Place
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  createPlace(data: PlaceCreateInput!): Place!
}`;

    const result = composeGqlTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });
});
