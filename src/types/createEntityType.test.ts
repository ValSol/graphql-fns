/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../tsTypes';

import pageInfoConfig from '../utils/composeAllEntityConfigs/pageInfoConfig';
import createEntityType from './createEntityType';

describe('createEntityType', () => {
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
        {
          name: 'textFieldNullable',
          array: true,
          nullable: true,
          type: 'textFields',
        },
      ],

      calculatedFields: [
        {
          name: 'textField1AndTextField2',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['textField1', 'textField2'],
          func: ({ textField1, textField2 }: any) => `${textField1} ${textField2}` as string,
          required: true,
        },

        {
          name: 'allTextFields',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['textField1', 'textField2', 'textField3'],
          func: ({ textField1, textField2, textField3 }: any) =>
            [textField1, textField2, textField3] as string[],
          array: true,
          required: true,
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node & ExampleInterface {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  textField4(slice: SliceInput): [String!]!
  textField5(slice: SliceInput): [String!]!
  textFieldNullable(slice: SliceInput): [String!]
  textField1AndTextField2: String!
  allTextFields(slice: SliceInput): [String!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with relational fields', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favoritePlace',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
        },
      ],

      filterFields: [
        {
          name: 'selectedPlaces',
          config: placeConfig,
          array: true,
          variants: ['plain'],
          type: 'filterFields',
        },
        {
          name: 'selectedPlace',
          config: placeConfig,
          variants: ['plain', 'stringified'],
          type: 'filterFields',
        },
      ],

      calculatedFields: [
        {
          name: 'selectedPlacesCalculated',
          array: true,
          calculatedType: 'filterFields',
          config: placeConfig,
          fieldsToUseNames: ['selectedPlaces'],
          func: ({ selectedPlaces }) => selectedPlaces,
        },
      ],
    });

    const generalConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig },
    };

    const expectedResult = `type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  friendsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  friendsCount(where: PersonWhereInput): Int!
  friendsDistinctValues(where: PersonWhereInput): [String!]!
  fellows(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  fellowsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  fellowsCount(where: PersonWhereInput): Int!
  fellowsDistinctValues(where: PersonWhereInput): [String!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  enemiesCount(where: PersonWhereInput): Int!
  enemiesDistinctValues(where: PersonWhereInput): [String!]!
  opponents(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  opponentsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  opponentsCount(where: PersonWhereInput): Int!
  opponentsDistinctValues(where: PersonWhereInput): [String!]!
  location: Place!
  favoritePlace: Place
  selectedPlaces(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput): [Place!]!
  selectedPlacesThroughConnection(where: PlaceWhereInput, sort: PlaceSortInput, after: String, before: String, first: Int, last: Int): PlaceConnection!
  selectedPlacesCount(where: PlaceWhereInput): Int!
  selectedPlacesDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput!): [String!]!
  selectedPlace: Place
  selectedPlacesCalculated(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput): [Place!]!
  selectedPlacesCalculatedThroughConnection(where: PlaceWhereInput, sort: PlaceSortInput, after: String, before: String, first: Int, last: Int): PlaceConnection!
  selectedPlacesCalculatedCount(where: PlaceWhereInput): Int!
  selectedPlacesCalculatedDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput!): [String!]!
  selectedPlaceStringified: String
}`;

    const result = createEntityType(personConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with embedded fields', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          type: 'textFields',
        },
        {
          name: 'province',
          type: 'textFields',
        },
      ],
    };
    const personConfig: EntityConfig = {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
          variants: ['plain', 'connection', 'count'],
        },
        {
          name: 'place',
          config: addressConfig,
          type: 'embeddedFields',
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
          type: 'embeddedFields',
          variants: ['plain', 'connection', 'count'],
        },
      ],

      calculatedFields: [
        {
          name: 'place2',
          calculatedType: 'embeddedFields',
          config: addressConfig,
          type: 'calculatedFields',
          fieldsToUseNames: ['place'],
          func: ({ place }: any) => place,
          required: true,
        },

        {
          name: 'places2',
          calculatedType: 'embeddedFields',
          config: addressConfig,
          type: 'calculatedFields',
          fieldsToUseNames: ['places'],
          func: ({ places }: any) => places,
          array: true,
        },
      ],
    };

    const generalConfig = {
      allEntityConfigs: { Person: personConfig, Address: addressConfig },
    };

    const expectedResult = `type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  location: Address!
  locations(slice: SliceInput): [Address!]!
  locationsThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
  locationsCount: Int!
  place: Address
  places(slice: SliceInput): [Address!]!
  placesThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
  placesCount: Int!
  place2: Address!
  places2(slice: SliceInput): [Address!]!
}`;

    const result = createEntityType(personConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create embeded entity type with text fields', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          type: 'textFields',
        },
        {
          name: 'province',
          type: 'textFields',
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Address: addressConfig } };

    const expectedResult = `type Address {
  id: ID!
  country: String!
  province: String
}`;

    const result = createEntityType(addressConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with duplex fields', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          type: 'duplexFields',
        },
      ],
    });

    const generalConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig },
    };

    const expectedResult = `type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  friendsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  friendsCount(where: PersonWhereInput): Int!
  friendsDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  enemiesCount(where: PersonWhereInput): Int!
  enemiesDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  location: Place!
  favoritePlace: Place
}`;

    const result = createEntityType(personConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with geospatial fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'precedingPosition',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'favoritePositions',
          array: true,
          geospatialType: 'Point',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'worstPositions',
          array: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'precedingArea',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'favoriteAreas',
          array: true,
          geospatialType: 'Polygon',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'worstAreas',
          array: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],

      calculatedFields: [
        {
          name: 'position2',
          calculatedType: 'geospatialFields',
          geospatialType: 'Point',
          type: 'calculatedFields',
          fieldsToUseNames: ['position'],
          func: ({ position }: any) => position,
          required: true,
        },

        {
          name: 'favoritePositions2',
          calculatedType: 'geospatialFields',
          geospatialType: 'Point',
          type: 'calculatedFields',
          fieldsToUseNames: ['favoritePositions'],
          func: ({ favoritePositions }: any) => favoritePositions,
          array: true,
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  position: GeospatialPoint!
  precedingPosition: GeospatialPoint
  favoritePositions(slice: SliceInput): [GeospatialPoint!]!
  worstPositions(slice: SliceInput): [GeospatialPoint!]!
  area: GeospatialPolygon!
  precedingArea: GeospatialPolygon
  favoriteAreas(slice: SliceInput): [GeospatialPolygon!]!
  worstAreas(slice: SliceInput): [GeospatialPolygon!]!
  position2: GeospatialPoint!
  favoritePositions2(slice: SliceInput): [GeospatialPoint!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with enum fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      enumFields: [
        {
          name: 'field1',
          enumName: 'Weekdays',
          type: 'enumFields',
        },
        {
          name: 'field2',
          array: true,
          enumName: 'Cuisines',
          type: 'enumFields',
        },
        {
          name: 'field3',
          enumName: 'Weekdays',
          required: true,
          type: 'enumFields',
        },
        {
          name: 'field4',
          array: true,
          enumName: 'Cuisines',
          required: true,
          type: 'enumFields',
        },
      ],

      calculatedFields: [
        {
          name: 'weekday',
          calculatedType: 'enumFields',
          enumName: 'Weekdays',
          type: 'calculatedFields',
          fieldsToUseNames: ['field1'],
          func: ({ field1 }: any) => field1,
          required: true,
        },

        {
          name: 'weekdays',
          calculatedType: 'enumFields',
          enumName: 'Weekdays',
          type: 'calculatedFields',
          fieldsToUseNames: ['field2'],
          func: ({ field2 }: any) => field2,
          array: true,
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  field1: WeekdaysEnumeration
  field2(slice: SliceInput): [CuisinesEnumeration!]!
  field3: WeekdaysEnumeration!
  field4(slice: SliceInput): [CuisinesEnumeration!]!
  weekday: WeekdaysEnumeration!
  weekdays(slice: SliceInput): [WeekdaysEnumeration!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with int fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField1',
          type: 'intFields',
        },
        {
          name: 'intField2',
          default: 0,
          type: 'intFields',
        },
        {
          name: 'intField3',
          required: true,
          type: 'intFields',
        },
        {
          name: 'intField4',
          array: true,
          type: 'intFields',
        },
        {
          name: 'intField5',
          default: [55],
          required: true,
          array: true,
          type: 'intFields',
        },
      ],

      calculatedFields: [
        {
          name: 'sum',
          calculatedType: 'intFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['intField1', 'intField2', 'intField3'],
          func: ({ intField1, intField2, intField3 }: any) => intField1 + intField2 + intField3,
          required: true,
        },

        {
          name: 'ints',
          calculatedType: 'intFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['intField1', 'intField2', 'intField3'],
          func: ({ intField1, intField2, intField3 }: any) => [intField1, intField2, intField3],
          array: true,
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  intField1: Int
  intField2: Int
  intField3: Int!
  intField4(slice: SliceInput): [Int!]!
  intField5(slice: SliceInput): [Int!]!
  sum: Int!
  ints(slice: SliceInput): [Int!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with float fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'floatField1',
          type: 'floatFields',
        },
        {
          name: 'floatField2',
          default: 0,
          type: 'floatFields',
        },
        {
          name: 'floatField3',
          required: true,
          type: 'floatFields',
        },
        {
          name: 'floatField4',
          array: true,
          type: 'floatFields',
        },
        {
          name: 'floatField5',
          default: [5.5],
          required: true,
          array: true,
          type: 'floatFields',
        },
      ],

      calculatedFields: [
        {
          name: 'sum',
          calculatedType: 'floatFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['floatField1', 'floatField2', 'floatField3'],
          func: ({ floatField1, floatField2, floatField3 }: any) =>
            floatField1 + floatField2 + floatField3,
          required: true,
        },

        {
          name: 'floats',
          calculatedType: 'floatFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['floatField1', 'floatField2', 'floatField3'],
          func: ({ floatField1, floatField2, floatField3 }: any) => [
            floatField1,
            floatField2,
            floatField3,
          ],
          array: true,
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  floatField1: Float
  floatField2: Float
  floatField3: Float!
  floatField4(slice: SliceInput): [Float!]!
  floatField5(slice: SliceInput): [Float!]!
  sum: Float!
  floats(slice: SliceInput): [Float!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with boolean fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'booleanField1',
          type: 'booleanFields',
        },
        {
          name: 'booleanField2',
          default: false,
          type: 'booleanFields',
        },
        {
          name: 'booleanField3',
          required: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField4',
          array: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField5',
          default: [true, true],
          required: true,
          array: true,
          type: 'booleanFields',
        },
      ],

      calculatedFields: [
        {
          name: 'is',
          calculatedType: 'booleanFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['booleanField1', 'booleanField2', 'booleanField3'],
          func: ({ booleanField1, booleanField2, booleanField3 }: any) =>
            booleanField1 + booleanField2 + booleanField3,
          required: true,
        },

        {
          name: 'are',
          calculatedType: 'booleanFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['booleanField1', 'booleanField2', 'booleanField3'],
          func: ({ booleanField1, booleanField2, booleanField3 }: any) => [
            booleanField1,
            booleanField2,
            booleanField3,
          ],
          array: true,
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  booleanField1: Boolean
  booleanField2: Boolean
  booleanField3: Boolean!
  booleanField4(slice: SliceInput): [Boolean!]!
  booleanField5(slice: SliceInput): [Boolean!]!
  is: Boolean!
  are(slice: SliceInput): [Boolean!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with Text fields and counter field', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  counter: Int!
  textField1: String
}`;
    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with Text fields and counter field', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
      ],
    };

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  counter: Int!
  textField1: String
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type for ExampleEdge', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'virtual',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
      ],
    };

    const exampleEdgeConfig: EntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const generalConfig = {
      allEntityConfigs: {
        Exmaple: entityConfig,
        ExampleEdge: exampleEdgeConfig,
      },
    };

    const expectedResult = `type ExampleEdge {
  cursor: String!
  node: Example
}`;

    const result = createEntityType(exampleEdgeConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type for ExampleConnection', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
      ],
    };

    const exampleEdgeConfig: EntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig: EntityConfig = {
      name: 'ExampleConnection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: pageInfoConfig, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const generalConfig = {
      allEntityConfigs: {
        Exmaple: entityConfig,
        ExampleEdge: exampleEdgeConfig,
        ExampleConnection: exampleConnectionConfig,
      },
    };

    const expectedResult = `type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]!
}`;

    const result = createEntityType(exampleConnectionConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with embedded fields', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          type: 'textFields',
        },
        {
          name: 'province',
          type: 'textFields',
        },
      ],
    };
    const personConfig: EntityConfig = {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
          variants: ['plain', 'connection', 'count'],
        },
        {
          name: 'place',
          config: addressConfig,
          type: 'embeddedFields',
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
          type: 'embeddedFields',
          variants: ['plain', 'connection', 'count'],
        },
      ],
    };

    const generalConfig = {
      allEntityConfigs: { Person: personConfig, Address: addressConfig },
    };

    const expectedResult = `type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  location: Address!
  locations(slice: SliceInput): [Address!]!
  locationsThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
  locationsCount: Int!
  place: Address
  places(slice: SliceInput): [Address!]!
  placesThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
  placesCount: Int!
}`;

    const result = createEntityType(personConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });
});
