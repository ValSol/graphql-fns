// @flow
/* eslint-env jest */

import type {
  GeneralConfig,
  Inventory,
  ActionSignatureMethods,
  DerivativeAttributes,
  ObjectSignatureMethods,
  ThingConfig,
} from '../flowTypes';

import composeGqlTypes from './composeGqlTypes';

describe('composeGqlTypes', () => {
  test('should create things types for one thing', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
          required: true,
        },
        {
          name: 'address',
        },
      ],
    };

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

      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          required: true,
        },
        {
          name: 'hero',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          required: true,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
      ],

      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };
    const thingConfigs = { Example: thingConfig, Image: imageConfig };
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
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
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
  logo: Image!
  hero: Image
  pictures: [Image!]!
  photos: [Image!]!
  position: GeospatialPoint
}
type Image {
  id: ID!
  fileId: String!
  address: String
}
input ExampleCreateInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]
  textField5: [String!]!
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]!
  logo: ImageCreateInput!
  hero: ImageCreateInput
  pictures: [ImageCreateInput!]!
  photos: [ImageCreateInput!]
  position: GeospatialPointInput
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
}
input PushIntoExampleInput {
  textField4: [String!]
  textField5: [String!]
  cuisines: [CuisinesEnumeration!]
  pictures: [ImageCreateInput!]
  photos: [ImageCreateInput!]
}
input ExampleUpdateInput {
  textField1: String
  textField2: String
  textField3: String
  textField4: [String!]
  textField5: [String!]
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]
  logo: ImageUpdateInput
  hero: ImageUpdateInput
  pictures: [ImageUpdateInput!]
  photos: [ImageUpdateInput!]
  position: GeospatialPointInput
}
input ExampleUpdateChildInput {
  connect: ID
}
input ExampleUpdateChildrenInput {
  connect: [ID!]
}
enum ExampleFileNamesEnum {
  logo
  hero
  pictures
  photos
}
input FilesOfExampleOptionsInput {
  targets: [ExampleFileNamesEnum!]!
  counts: [Int!]!
  hashes: [String!]!
}
input UploadFilesToExampleInput {
  logo: ImageUpdateInput
  hero: ImageUpdateInput
  pictures: [ImageUpdateInput!]
  photos: [ImageUpdateInput!]
}
input ImageCreateInput {
  fileId: String!
  address: String
}
input ImageUpdateInput {
  fileId: String
  address: String
}
enum ExampleTextNamesEnum {
  textField1
  textField2
  textField3
  textField4
  textField5
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}
input ExampleWhereOneInput {
  id: ID
  textField1: ID
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  textField1_in: [String!]
  textField1_nin: [String!]
  textField1_ne: String
  textField2: String
  textField2_in: [String!]
  textField2_nin: [String!]
  textField2_ne: String
  textField3: String
  textField3_in: [String!]
  textField3_nin: [String!]
  textField3_ne: String
  day: WeekdaysEnumeration
  day_in: [WeekdaysEnumeration!]
  day_nin: [WeekdaysEnumeration!]
  day_ne: WeekdaysEnumeration
  cuisines: CuisinesEnumeration
  cuisines_in: [CuisinesEnumeration!]
  cuisines_nin: [CuisinesEnumeration!]
  cuisines_ne: CuisinesEnumeration
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
enum ExampleSortEnum {
  day_ASC
  day_DESC
  textField2_ASC
  textField2_DESC
  textField3_ASC
  textField3_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}
input ExamplePaginationInput {
  skip: Int
  first: Int
}
enum ExampleGeospatialFieldNamesEnum {
  position
}
input ExampleNearInput {
  geospatialField: ExampleGeospatialFieldNamesEnum
  coordinates: GeospatialPointInput
  maxDistance: Float
}
enum ExampleFieldNamesEnum {
  textField1
  textField2
  textField3
  textField4
  textField5
  logo
  hero
  pictures
  photos
  day
  cuisines
  position
}
type UpdatedExamplePayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnum!]
}
type Query {
  Example(whereOne: ExampleWhereOneInput!): Example
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: ExamplePaginationInput, near: ExampleNearInput): [Example!]!
  ExampleCount(where: ExampleWhereInput): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!
  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!
  pushIntoExample(whereOne: ExampleWhereOneInput!, data: PushIntoExampleInput!): Example!
  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!): Example!
  deleteExample(whereOne: ExampleWhereOneInput!): Example
  uploadFilesToExample(whereOne: ExampleWhereOneInput!, data: UploadFilesToExampleInput, files: [Upload!]!, options: FilesOfExampleOptionsInput!): Example!
}
type Subscription {
  createdExample(where: ExampleWhereInput): Example!
  updatedExample(where: ExampleWhereInput): UpdatedExamplePayload!
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
    const thingConfigs = { Example1: thingConfig1, Example2: thingConfig2 };
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `scalar DateTime
type GeospatialPoint {
  lng: Float!
  lat: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
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
input Example1CreateOrPushChildrenInput {
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
input Example2CreateOrPushChildrenInput {
  connect: [ID!]
  create: [Example2CreateInput!]
}
input PushIntoExample2Input {
  textField1: [String!]
  textField2: [String!]
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
enum Example1TextNamesEnum {
  textField1
  textField2
  textField3
}
input Example1DistinctValuesOptionsInput {
  target: Example1TextNamesEnum!
}
enum Example2TextNamesEnum {
  textField1
  textField2
}
input Example2DistinctValuesOptionsInput {
  target: Example2TextNamesEnum!
}
input Example1WhereOneInput {
  id: ID!
}
input Example1WhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
enum Example1GeospatialFieldNamesEnum {
  position
}
input Example1NearInput {
  geospatialField: Example1GeospatialFieldNamesEnum
  coordinates: GeospatialPointInput
  maxDistance: Float
}
input Example2WhereOneInput {
  id: ID!
}
input Example2WhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
enum Example1FieldNamesEnum {
  textField1
  textField2
  textField3
  position
}
type UpdatedExample1Payload {
  node: Example1
  previousNode: Example1
  updatedFields: [Example1FieldNamesEnum!]
}
enum Example2FieldNamesEnum {
  textField1
  textField2
  area
}
type UpdatedExample2Payload {
  node: Example2
  previousNode: Example2
  updatedFields: [Example2FieldNamesEnum!]
}
type Query {
  Example1(whereOne: Example1WhereOneInput!): Example1
  Example1s(where: Example1WhereInput, near: Example1NearInput): [Example1!]!
  Example1Count(where: Example1WhereInput): Int!
  Example1DistinctValues(where: Example1WhereInput, options: Example1DistinctValuesOptionsInput): [String!]!
  Example2(whereOne: Example2WhereOneInput!): Example2
  Example2s(where: Example2WhereInput): [Example2!]!
  Example2Count(where: Example2WhereInput): Int!
  Example2DistinctValues(where: Example2WhereInput, options: Example2DistinctValuesOptionsInput): [String!]!
}
type Mutation {
  createExample1(data: Example1CreateInput!): Example1!
  createManyExample1s(data: [Example1CreateInput!]!): [Example1!]!
  importExample1s(file: Upload!, options: ImportOptionsInput): [Example1!]!
  updateExample1(whereOne: Example1WhereOneInput!, data: Example1UpdateInput!): Example1!
  deleteExample1(whereOne: Example1WhereOneInput!): Example1
  createExample2(data: Example2CreateInput!): Example2!
  createManyExample2s(data: [Example2CreateInput!]!): [Example2!]!
  importExample2s(file: Upload!, options: ImportOptionsInput): [Example2!]!
  pushIntoExample2(whereOne: Example2WhereOneInput!, data: PushIntoExample2Input!): Example2!
  updateExample2(whereOne: Example2WhereOneInput!, data: Example2UpdateInput!): Example2!
  deleteExample2(whereOne: Example2WhereOneInput!): Example2
}
type Subscription {
  createdExample1(where: Example1WhereInput): Example1!
  updatedExample1(where: Example1WhereInput): UpdatedExample1Payload!
  deletedExample1(where: Example1WhereInput): Example1!
  createdExample2(where: Example2WhereInput): Example2!
  updatedExample2(where: Example2WhereInput): UpdatedExample2Payload!
  deletedExample2(where: Example2WhereInput): Example2!
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
    const thingConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `scalar DateTime
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
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
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}
input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: PersonUpdateChildrenInput
  enemies: PersonUpdateChildrenInput
  location: PlaceUpdateChildInput
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
input PlaceCreateOrPushChildrenInput {
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
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
enum PlaceTextNamesEnum {
  title
}
input PlaceDistinctValuesOptionsInput {
  target: PlaceTextNamesEnum!
}
input PersonWhereOneInput {
  id: ID!
}
input PersonWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
input PlaceWhereOneInput {
  id: ID!
}
input PlaceWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
enum PersonFieldNamesEnum {
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
  updatedFields: [PersonFieldNamesEnum!]
}
enum PlaceFieldNamesEnum {
  title
}
type UpdatedPlacePayload {
  node: Place
  previousNode: Place
  updatedFields: [PlaceFieldNamesEnum!]
}
type Query {
  Person(whereOne: PersonWhereOneInput!): Person
  People(where: PersonWhereInput): [Person!]!
  PersonCount(where: PersonWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
  Place(whereOne: PlaceWhereOneInput!): Place
  Places(where: PlaceWhereInput): [Place!]!
  PlaceCount(where: PlaceWhereInput): Int!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput): [String!]!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  createManyPeople(data: [PersonCreateInput!]!): [Person!]!
  importPeople(file: Upload!, options: ImportOptionsInput): [Person!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!): Person!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!
  deletePerson(whereOne: PersonWhereOneInput!): Person
  createPlace(data: PlaceCreateInput!): Place!
  createManyPlaces(data: [PlaceCreateInput!]!): [Place!]!
  importPlaces(file: Upload!, options: ImportOptionsInput): [Place!]!
  updatePlace(whereOne: PlaceWhereOneInput!, data: PlaceUpdateInput!): Place!
  deletePlace(whereOne: PlaceWhereOneInput!): Place
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
  createdPlace(where: PlaceWhereInput): Place!
  updatedPlace(where: PlaceWhereInput): UpdatedPlacePayload!
  deletedPlace(where: PlaceWhereInput): Place!
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
    const thingConfigs = { Person: personConfig, Address: addressConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `scalar DateTime
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
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
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}
input PushIntoPersonInput {
  locations: [AddressCreateInput!]
  places: [AddressCreateInput!]
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
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
input PersonWhereOneInput {
  id: ID!
}
input PersonWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
enum PersonFieldNamesEnum {
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
  updatedFields: [PersonFieldNamesEnum!]
}
type Query {
  Person(whereOne: PersonWhereOneInput!): Person
  People(where: PersonWhereInput): [Person!]!
  PersonCount(where: PersonWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  createManyPeople(data: [PersonCreateInput!]!): [Person!]!
  importPeople(file: Upload!, options: ImportOptionsInput): [Person!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!): Person!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!
  deletePerson(whereOne: PersonWhereOneInput!): Person
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
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
    const thingConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `scalar DateTime
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
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
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateThru_friends_FieldInput {
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateThru_location_FieldInput {
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}
input PersonCreateThru_friends_FieldChildInput {
  connect: ID
  create: PersonCreateThru_friends_FieldInput
}
input PersonCreateOrPushThru_friends_FieldChildrenInput {
  connect: [ID!]
  create: [PersonCreateThru_friends_FieldInput!]
}
input PersonCreateThru_location_FieldChildInput {
  connect: ID
  create: PersonCreateThru_location_FieldInput
}
input PersonCreateOrPushThru_location_FieldChildrenInput {
  connect: [ID!]
  create: [PersonCreateThru_location_FieldInput!]
}
input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: PersonUpdateChildrenInput
  enemies: PersonUpdateChildrenInput
  location: PlaceUpdateChildInput
  favoritePlace: PlaceUpdateChildInput
}
input PersonUpdateChildInput {
  connect: ID
}
input PersonUpdateChildrenInput {
  connect: [ID!]
}
input PlaceCreateInput {
  citizens: PersonCreateOrPushThru_location_FieldChildrenInput
  visitors: PersonCreateOrPushChildrenInput
  name: String
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
}
input PushIntoPlaceInput {
  citizens: PersonCreateOrPushChildrenInput
  visitors: PersonCreateOrPushChildrenInput
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
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
enum PlaceTextNamesEnum {
  name
}
input PlaceDistinctValuesOptionsInput {
  target: PlaceTextNamesEnum!
}
input PersonWhereOneInput {
  id: ID!
}
input PersonWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
input PlaceWhereOneInput {
  id: ID!
}
input PlaceWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
enum PersonFieldNamesEnum {
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
  updatedFields: [PersonFieldNamesEnum!]
}
enum PlaceFieldNamesEnum {
  name
  citizens
  visitors
}
type UpdatedPlacePayload {
  node: Place
  previousNode: Place
  updatedFields: [PlaceFieldNamesEnum!]
}
type Query {
  Person(whereOne: PersonWhereOneInput!): Person
  People(where: PersonWhereInput): [Person!]!
  PersonCount(where: PersonWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
  Place(whereOne: PlaceWhereOneInput!): Place
  Places(where: PlaceWhereInput): [Place!]!
  PlaceCount(where: PlaceWhereInput): Int!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput): [String!]!
}
type Mutation {
  createPerson(data: PersonCreateInput!): Person!
  createManyPeople(data: [PersonCreateInput!]!): [Person!]!
  importPeople(file: Upload!, options: ImportOptionsInput): [Person!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!): Person!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!
  deletePerson(whereOne: PersonWhereOneInput!): Person
  createPlace(data: PlaceCreateInput!): Place!
  createManyPlaces(data: [PlaceCreateInput!]!): [Place!]!
  importPlaces(file: Upload!, options: ImportOptionsInput): [Place!]!
  pushIntoPlace(whereOne: PlaceWhereOneInput!, data: PushIntoPlaceInput!): Place!
  updatePlace(whereOne: PlaceWhereOneInput!, data: PlaceUpdateInput!): Place!
  deletePlace(whereOne: PlaceWhereOneInput!): Place
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
  createdPlace(where: PlaceWhereInput): Place!
  updatedPlace(where: PlaceWhereInput): UpdatedPlacePayload!
  deletedPlace(where: PlaceWhereInput): Place!
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
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: true } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
enum ExampleTextNamesEnum {
  textField
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}
input ExampleWhereOneInput {
  id: ID!
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
type Query {
  Example(whereOne: ExampleWhereOneInput!): Example
  Examples(where: ExampleWhereInput): [Example!]!
  ExampleCount(where: ExampleWhereInput): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!
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
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: true } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
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
input ExampleCreateOrPushChildrenInput {
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
  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!
  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!
  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!): Example!
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
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { things: true } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
type Query {
  Examples(where: ExampleWhereInput): [Example!]!
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
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { things: ['Example'] } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
}
type Query {
  Examples(where: ExampleWhereInput): [Example!]!
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
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { createThing: true } } };
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
input ExampleCreateOrPushChildrenInput {
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
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only mutation cretateThing', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { createThing: ['Example'] } },
    };
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
input ExampleCreateOrPushChildrenInput {
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
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only one custom mutation loadThing', () => {
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadThing',
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      type: ({ name }) => name,
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadThing: true } } };
    const custom = { Mutation: { loadThing: signatureMethods } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
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
type Mutation {
  loadExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only one custom query getThing', () => {
    const getThing: ActionSignatureMethods = {
      name: 'getThing',
      specificName: ({ name }) => `get${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      type: ({ name }) => name,
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { getThing: true } } };
    const custom = { Query: { getThing } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Query {
  getExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with custom input and return objects', () => {
    const thingInTimeRangeInput: ObjectSignatureMethods = {
      name: 'thingTimeRangeInput',
      specificName: ({ name }) => `${name}TimeRangeInput`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const thingInTimeRangeDerivative: DerivativeAttributes = {
      allow: { Example: ['thing', 'things'] },
      suffix: 'InTimeRange',
      addFields: {
        Example: {
          dateTimeFields: [{ name: 'start', required: true }, { name: 'end' }],
        },
      },
    };

    const thingInTimeRangeQuery: ActionSignatureMethods = {
      name: 'thingInTimeRangeQuery',
      specificName: ({ name }) => `${name}InTimeRangeQuery`,
      argNames: () => ['range'],
      argTypes: ({ name }) => [`${name}TimeRangeInput!`],
      type: ({ name }) => `${name}InTimeRange`,
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Query: { thingInTimeRangeQuery: true } },
    };
    const custom = {
      Input: { thingInTimeRangeInput },
      Query: { thingInTimeRangeQuery },
    };
    const derivative = { InTimeRange: thingInTimeRangeDerivative };
    const generalConfig: GeneralConfig = { thingConfigs, custom, derivative, inventory };
    const expectedResult = `scalar DateTime
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleInTimeRange {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  start: DateTime!
  end: DateTime
}
input ExampleTimeRangeInput {
  start: DateTime!
  end: DateTime!
}
type Query {
  ExampleInTimeRangeQuery(range: ExampleTimeRangeInput!): ExampleInTimeRange
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
