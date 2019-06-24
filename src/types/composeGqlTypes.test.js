// @flow
/* eslint-env jest */

import type { GeneralConfig, Inventory, ThingConfig } from '../flowTypes';

import composeGqlTypes from './composeGqlTypes';

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
          geospatialType: 'Point',
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
input ExampleUpdateChildInput {
  connect: ID
}
input ExampleUpdateChildrenInput {
  connect: [ID!]
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
enum ExampleFieldNamesEnumeration {
  textField1
  textField2
  textField3
  textField4
  textField5
  day
  cuisines
  position
}
type UpdatedExamplePayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnumeration!]
}
type Query {
  Example(whereOne: ExampleWhereOneInput!): Example
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: ExamplePaginationInput, near: ExampleNearInput): [Example!]!
  ExampleCount(where: ExampleWhereInput): Int!
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
  updateExample(whereOne: ExampleWhereOneInput! data: ExampleUpdateInput!): Example!
  deleteExample(whereOne: ExampleWhereOneInput!): Example
}
type Subscription {
  newExample(where: ExampleWhereInput): Example!
  updatedExample(whereOne: ExampleWhereOneInput, where: ExampleWhereInput): UpdatedExamplePayload!
  deletedExample(where: ExampleWhereInput): Example!
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
          geospatialType: 'Point',
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
          geospatialType: 'Polygon',
        },
      ],
    };
    const thingConfigs = [thingConfig1, thingConfig2];
    const generalConfig: GeneralConfig = { thingConfigs };
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
input Example1UpdateChildInput {
  connect: ID
}
input Example1UpdateChildrenInput {
  connect: [ID!]
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
input Example2UpdateChildInput {
  connect: ID
}
input Example2UpdateChildrenInput {
  connect: [ID!]
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
enum Example1FieldNamesEnumeration {
  textField1
  textField2
  textField3
  position
}
type UpdatedExample1Payload {
  node: Example1
  previousNode: Example1
  updatedFields: [Example1FieldNamesEnumeration!]
}
enum Example2FieldNamesEnumeration {
  textField1
  textField2
  area
}
type UpdatedExample2Payload {
  node: Example2
  previousNode: Example2
  updatedFields: [Example2FieldNamesEnumeration!]
}
type Query {
  Example1(whereOne: Example1WhereOneInput!): Example1
  Example1S(near: Example1NearInput): [Example1!]!
  Example1Count: Int!
  Example2(whereOne: Example2WhereOneInput!): Example2
  Example2S: [Example2!]!
  Example2Count: Int!
}
type Mutation {
  createExample1(data: Example1CreateInput!): Example1!
  updateExample1(whereOne: Example1WhereOneInput! data: Example1UpdateInput!): Example1!
  deleteExample1(whereOne: Example1WhereOneInput!): Example1
  createExample2(data: Example2CreateInput!): Example2!
  updateExample2(whereOne: Example2WhereOneInput! data: Example2UpdateInput!): Example2!
  deleteExample2(whereOne: Example2WhereOneInput!): Example2
}
type Subscription {
  newExample1: Example1!
  updatedExample1(whereOne: Example1WhereOneInput): UpdatedExample1Payload!
  deletedExample1: Example1!
  newExample2: Example2!
  updatedExample2(whereOne: Example2WhereOneInput): UpdatedExample2Payload!
  deletedExample2: Example2!
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
    const generalConfig: GeneralConfig = { thingConfigs };
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
  friends: PersonUpdateChildrenInput!
  enemies: PersonUpdateChildrenInput
  location: PlaceUpdateChildInput!
  favoritePlace: PlaceUpdateChildInput
}
input PersonUpdateChildInput {
  connect: ID
}
input PersonUpdateChildrenInput {
  connect: [ID!]
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
input PlaceUpdateChildInput {
  connect: ID
}
input PlaceUpdateChildrenInput {
  connect: [ID!]
}
input PersonWhereOneInput {
  id: ID!
}
input PlaceWhereOneInput {
  id: ID!
}
enum PersonFieldNamesEnumeration {
  firstName
  lastName
  friends
  enemies
  location
  favoritePlace
}
type UpdatedPersonPayload {
  node: Person
  previousNode: Person
  updatedFields: [PersonFieldNamesEnumeration!]
}
enum PlaceFieldNamesEnumeration {
  title
}
type UpdatedPlacePayload {
  node: Place
  previousNode: Place
  updatedFields: [PlaceFieldNamesEnumeration!]
}
type Query {
  Person(whereOne: PersonWhereOneInput!): Person
  People: [Person!]!
  PersonCount: Int!
  Place(whereOne: PlaceWhereOneInput!): Place
  Places: [Place!]!
  PlaceCount: Int!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(whereOne: PersonWhereOneInput! data: PersonUpdateInput!): Person!
  deletePerson(whereOne: PersonWhereOneInput!): Person
  createPlace(data: PlaceCreateInput!): Place!
  updatePlace(whereOne: PlaceWhereOneInput! data: PlaceUpdateInput!): Place!
  deletePlace(whereOne: PlaceWhereOneInput!): Place
}
type Subscription {
  newPerson: Person!
  updatedPerson(whereOne: PersonWhereOneInput): UpdatedPersonPayload!
  deletedPerson: Person!
  newPlace: Place!
  updatedPlace(whereOne: PlaceWhereOneInput): UpdatedPlacePayload!
  deletedPlace: Place!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for regular and embedded fields', () => {
    const addressConfig: ThingConfig = {
      name: 'Address',
      embedded: true,
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
    const generalConfig: GeneralConfig = { thingConfigs };
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
input PersonUpdateChildInput {
  connect: ID
}
input PersonUpdateChildrenInput {
  connect: [ID!]
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
enum PersonFieldNamesEnumeration {
  firstName
  lastName
  location
  locations
  place
  places
}
type UpdatedPersonPayload {
  node: Person
  previousNode: Person
  updatedFields: [PersonFieldNamesEnumeration!]
}
type Query {
  Person(whereOne: PersonWhereOneInput!): Person
  People: [Person!]!
  PersonCount: Int!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(whereOne: PersonWhereOneInput! data: PersonUpdateInput!): Person!
  deletePerson(whereOne: PersonWhereOneInput!): Person
}
type Subscription {
  newPerson: Person!
  updatedPerson(whereOne: PersonWhereOneInput): UpdatedPersonPayload!
  deletedPerson: Person!
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
    const generalConfig: GeneralConfig = { thingConfigs };
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
  friends: PersonUpdateChildrenInput!
  enemies: PersonUpdateChildrenInput
  location: PlaceUpdateChildInput!
  favoritePlace: PlaceUpdateChildInput
}
input PersonUpdateChildInput {
  connect: ID
}
input PersonUpdateChildrenInput {
  connect: [ID!]
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
  citizens: PersonUpdateChildrenInput
  visitors: PersonUpdateChildrenInput
}
input PlaceUpdateChildInput {
  connect: ID
}
input PlaceUpdateChildrenInput {
  connect: [ID!]
}
input PersonWhereOneInput {
  id: ID!
}
input PlaceWhereOneInput {
  id: ID!
}
enum PersonFieldNamesEnumeration {
  firstName
  lastName
  friends
  enemies
  location
  favoritePlace
}
type UpdatedPersonPayload {
  node: Person
  previousNode: Person
  updatedFields: [PersonFieldNamesEnumeration!]
}
enum PlaceFieldNamesEnumeration {
  name
  citizens
  visitors
}
type UpdatedPlacePayload {
  node: Place
  previousNode: Place
  updatedFields: [PlaceFieldNamesEnumeration!]
}
type Query {
  Person(whereOne: PersonWhereOneInput!): Person
  People: [Person!]!
  PersonCount: Int!
  Place(whereOne: PlaceWhereOneInput!): Place
  Places: [Place!]!
  PlaceCount: Int!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(whereOne: PersonWhereOneInput! data: PersonUpdateInput!): Person!
  deletePerson(whereOne: PersonWhereOneInput!): Person
  createPlace(data: PlaceCreateInput!): Place!
  updatePlace(whereOne: PlaceWhereOneInput! data: PlaceUpdateInput!): Place!
  deletePlace(whereOne: PlaceWhereOneInput!): Place
}
type Subscription {
  newPerson: Person!
  updatedPerson(whereOne: PersonWhereOneInput): UpdatedPersonPayload!
  deletedPerson: Person!
  newPlace: Place!
  updatedPlace(whereOne: PlaceWhereOneInput): UpdatedPlacePayload!
  deletedPlace: Place!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only queries', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Query: null } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleWhereOneInput {
  id: ID!
}
type Query {
  Example(whereOne: ExampleWhereOneInput!): Example
  Examples: [Example!]!
  ExampleCount: Int!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Mutation: null } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleCreateInput {
  textField: String
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
  textField: String
}
input ExampleUpdateChildInput {
  connect: ID
}
input ExampleUpdateChildrenInput {
  connect: [ID!]
}
input ExampleWhereOneInput {
  id: ID!
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
  updateExample(whereOne: ExampleWhereOneInput! data: ExampleUpdateInput!): Example!
  deleteExample(whereOne: ExampleWhereOneInput!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only things query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Query: { things: null } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Query {
  Examples: [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only things query for Example config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Query: { things: ['Example'] } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Query {
  Examples: [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only create mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Mutation: { createThing: null } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleCreateInput {
  textField: String
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Mutation: { createThing: ['Example'] } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleCreateInput {
  textField: String
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
