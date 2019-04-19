// @flow
/* eslint-env jest */
const composeGqlTypes = require('./composeGqlTypes');

describe('composeGqlTypes', () => {
  test('should create things types for one thing', () => {
    const thingConfig = {
      name: 'Example',
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
  connect: [ID!]
  create: [ExampleCreateInput!]
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
      name: 'Example1',
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
      name: 'Example2',
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
  connect: [ID!]
  create: [Example1CreateInput!]
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
  connect: [ID!]
  create: [Example2CreateInput!]
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
    const placeConfig = {
      name: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig = {
      name: 'Person',
      textFields: [],
      relationalFields: [],
    };
    Object.assign(personConfig, {
      name: 'Person',
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
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
      ],
    });
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
  connect: [ID!]
  create: [PersonCreateInput!]
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
  connect: [ID!]
  create: [PlaceCreateInput!]
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

  test('should create things types for regular and embedded fields', () => {
    const addressConfig = {
      name: 'Address',
      isEmbedded: true,
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
        },
        {
          name: 'province',
        },
      ],
    };
    const personConfig = {
      name: 'Person',
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
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
        },
        {
          name: 'place',
          config: addressConfig,
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
        },
      ],
    };
    const thingConfigs = [personConfig, addressConfig];
    const expectedResult = `scalar DateTime
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  firstName: String!
  lastName: String!
  location: Address!
  locations: [Address!]!
  place: Address
  places: [Address!]!
}
type Address {
  id: ID!
  country: String!
  province: String
}
input PersonCreateInput {
  firstName: String!
  lastName: String!
  location: AddressCreateInput!
  locations: [AddressCreateInput!]!
  place: AddressCreateInput
  places: [AddressCreateInput!]!
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}
input PersonWhereInput {
  id: ID!
}
input AddressCreateInput {
  country: String!
  province: String
}
input AddressWhereInput {
  id: ID!
}
type Query {
  Person(where: PersonWhereInput!): Person
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
}`;

    const result = composeGqlTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for two duplex fields', () => {
    const personConfig = {
      name: 'Person',
      textFields: [],
      duplexFields: [],
    };
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
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
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });
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
  name: String
  citizens: [Person!]!
  visitors: [Person!]!
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
  connect: [ID!]
  create: [PersonCreateInput!]
}
input PersonWhereInput {
  id: ID!
}
input PlaceCreateInput {
  name: String
  citizens: PersonCreateChildrenInput
  visitors: PersonCreateChildrenInput
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
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
