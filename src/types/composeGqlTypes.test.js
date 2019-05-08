// @flow
/* eslint-env jest */

import type { GeneralConfig, ThingConfig } from '../flowTypes';

const composeGqlTypes = require('./composeGqlTypes');

describe('composeGqlTypes', () => {
  test('should create things types for one thing', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      pagination: true,
      textFields: [
        {
          name: 'textField1',
          unique: true,
        },
        {
          name: 'textField2',
          default: 'default text',
          index: true,
        },
        {
          name: 'textField3',
          required: true,
          index: true,
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
      enumFields: [
        {
          name: 'day',
          enumName: 'Weekdays',
          index: true,
        },
        {
          name: 'cuisines',
          array: true,
          enumName: 'Cuisines',
          required: true,
          index: true,
        },
      ],

      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { thingConfigs, enums };
    const expectedResult = `scalar DateTime
enum WeekdaysEnumeration {
  a0
  a1
  a2
  a3
  a4
  a5
  a6
}
enum CuisinesEnumeration {
  ukrainian
  italian
  georgian
  japanese
  chinese
}
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]!
  position: GeospatialPoint
}
input ExampleCreateInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]
  textField5: [String!]!
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]!
  position: GeospatialPointInput
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
}
input ExampleUpdateInput {
  textField1: String
  textField2: String
  textField3: String
  textField4: [String!]
  textField5: [String!]
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]
  position: GeospatialPointInput
}
input ExampleWhereOneInput {
  id: ID
  textField1: ID
}
input ExampleWhereInput {
  textField2: String
  textField3: String
  day: WeekdaysEnumeration
  cuisines: CuisinesEnumeration
}
enum ExampleSortEnumeration {
  day_ASC
  day_DESC
  textField2_ASC
  textField2_DESC
  textField3_ASC
  textField3_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}
input ExamplePaginationInput {
  skip: Int
  first: Int
}
enum ExampleGeospatialFieldNamesEnumeration {
  position
}
input ExampleNearInput {
  geospatialField: ExampleGeospatialFieldNamesEnumeration
  coordinates: GeospatialPointInput
  maxDistance: Float
}
type Query {
  Example(where: ExampleWhereOneInput!): Example
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: ExamplePaginationInput, near: ExampleNearInput): [Example!]!
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
  updateExample(where: ExampleWhereOneInput! data: ExampleUpdateInput!): Example!
  deleteExample(where: ExampleWhereOneInput!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create things types for two things', () => {
    const thingConfig1: ThingConfig = {
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
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
        },
      ],
    };
    const thingConfig2: ThingConfig = {
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
      geospatialFields: [
        {
          name: 'area',
          type: 'Polygon',
        },
      ],
    };
    const thingConfigs = [thingConfig1, thingConfig2];
    const generalConfig: GeneralConfig = { thingConfigs, enums: [] };
    const expectedResult = `scalar DateTime
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}
type Example1 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  position: GeospatialPoint
}
type Example2 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: [String!]!
  textField2: [String!]!
  area: GeospatialPolygon
}
input Example1CreateInput {
  textField1: String
  textField2: String
  textField3: String!
  position: GeospatialPointInput
}
input Example1CreateChildInput {
  connect: ID
  create: Example1CreateInput
}
input Example1CreateChildrenInput {
  connect: [ID!]
  create: [Example1CreateInput!]
}
input Example1UpdateInput {
  textField1: String
  textField2: String
  textField3: String
  position: GeospatialPointInput
}
input Example2CreateInput {
  textField1: [String!]
  textField2: [String!]!
  area: GeospatialPolygonInput
}
input Example2CreateChildInput {
  connect: ID
  create: Example2CreateInput
}
input Example2CreateChildrenInput {
  connect: [ID!]
  create: [Example2CreateInput!]
}
input Example2UpdateInput {
  textField1: [String!]
  textField2: [String!]
  area: GeospatialPolygonInput
}
input Example1WhereOneInput {
  id: ID!
}
enum Example1GeospatialFieldNamesEnumeration {
  position
}
input Example1NearInput {
  geospatialField: Example1GeospatialFieldNamesEnumeration
  coordinates: GeospatialPointInput
  maxDistance: Float
}
input Example2WhereOneInput {
  id: ID!
}
type Query {
  Example1(where: Example1WhereOneInput!): Example1
  Example1S(near: Example1NearInput): [Example1!]!
  Example2(where: Example2WhereOneInput!): Example2
  Example2S: [Example2!]!
}
type Mutation {
  createExample1(data: Example1CreateInput!): Example1!
  updateExample1(where: Example1WhereOneInput! data: Example1UpdateInput!): Example1!
  deleteExample1(where: Example1WhereOneInput!): Example1
  createExample2(data: Example2CreateInput!): Example2!
  updateExample2(where: Example2WhereOneInput! data: Example2UpdateInput!): Example2!
  deleteExample2(where: Example2WhereOneInput!): Example2
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create things types for two related fields', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig: ThingConfig = {};
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
    const generalConfig: GeneralConfig = { thingConfigs, enums: [] };
    const expectedResult = `scalar DateTime
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
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
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: [ID!]
  enemies: [ID!]
  location: ID
  favoritePlace: ID
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
input PlaceUpdateInput {
  title: String
}
input PersonWhereOneInput {
  id: ID!
}
input PlaceWhereOneInput {
  id: ID!
}
type Query {
  Person(where: PersonWhereOneInput!): Person
  People: [Person!]!
  Place(where: PlaceWhereOneInput!): Place
  Places: [Place!]!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(where: PersonWhereOneInput! data: PersonUpdateInput!): Person!
  deletePerson(where: PersonWhereOneInput!): Person
  createPlace(data: PlaceCreateInput!): Place!
  updatePlace(where: PlaceWhereOneInput! data: PlaceUpdateInput!): Place!
  deletePlace(where: PlaceWhereOneInput!): Place
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for regular and embedded fields', () => {
    const addressConfig: ThingConfig = {
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
    const personConfig: ThingConfig = {
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
    const generalConfig: GeneralConfig = { thingConfigs, enums: [] };
    const expectedResult = `scalar DateTime
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
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
  places: [AddressCreateInput!]
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  location: AddressUpdateInput
  locations: [AddressUpdateInput!]
  place: AddressUpdateInput
  places: [AddressUpdateInput!]
}
input AddressCreateInput {
  country: String!
  province: String
}
input AddressUpdateInput {
  country: String
  province: String
}
input PersonWhereOneInput {
  id: ID!
}
type Query {
  Person(where: PersonWhereOneInput!): Person
  People: [Person!]!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(where: PersonWhereOneInput! data: PersonUpdateInput!): Person!
  deletePerson(where: PersonWhereOneInput!): Person
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for two duplex fields', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
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
    const generalConfig: GeneralConfig = { thingConfigs, enums: [] };
    const expectedResult = `scalar DateTime
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
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
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: [ID!]
  enemies: [ID!]
  location: ID
  favoritePlace: ID
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
input PlaceUpdateInput {
  name: String
  citizens: [ID!]
  visitors: [ID!]
}
input PersonWhereOneInput {
  id: ID!
}
input PlaceWhereOneInput {
  id: ID!
}
type Query {
  Person(where: PersonWhereOneInput!): Person
  People: [Person!]!
  Place(where: PlaceWhereOneInput!): Place
  Places: [Place!]!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(where: PersonWhereOneInput! data: PersonUpdateInput!): Person!
  deletePerson(where: PersonWhereOneInput!): Person
  createPlace(data: PlaceCreateInput!): Place!
  updatePlace(where: PlaceWhereOneInput! data: PlaceUpdateInput!): Place!
  deletePlace(where: PlaceWhereOneInput!): Place
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
