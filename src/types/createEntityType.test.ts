/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../tsTypes';

import pageInfoConfig from '../utils/composeAllEntityConfigs/pageInfoConfig';
import createEntityType from './createEntityType';

describe('createEntityType', () => {
  test('should create entity type with Text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const generalConfig = { allEntityConfigs: { Exmaple: entityConfig } };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  textField4(slice: SliceInput): [String!]!
  textField5(slice: SliceInput): [String!]!
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with relational fields', () => {
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
    };
    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
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

    const generalConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig },
    };

    const expectedResult = `type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  friendsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
  location: Place!
  favoritePlace: Place
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
        },
        {
          name: 'province',
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
  locationsThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection
  place: Address
  places(slice: SliceInput): [Address!]!
  placesThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection
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
        },
        {
          name: 'province',
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
      type: 'tangible',
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
  friendsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
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
        },
        {
          name: 'precedingPosition',
          geospatialType: 'Point',
        },
        {
          name: 'favoritePositions',
          array: true,
          geospatialType: 'Point',
          required: true,
        },
        {
          name: 'worstPositions',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          required: true,
        },
        {
          name: 'precedingArea',
          geospatialType: 'Polygon',
        },
        {
          name: 'favoriteAreas',
          array: true,
          geospatialType: 'Polygon',
          required: true,
        },
        {
          name: 'worstAreas',
          array: true,
          geospatialType: 'Polygon',
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
        },
        {
          name: 'field2',
          array: true,
          enumName: 'Cuisines',
        },
        {
          name: 'field3',
          enumName: 'Weekdays',
          required: true,
        },
        {
          name: 'field4',
          array: true,
          enumName: 'Cuisines',
          required: true,
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
        },
        {
          name: 'intField2',
          default: 0,
        },
        {
          name: 'intField3',
          required: true,
        },
        {
          name: 'intField4',
          array: true,
        },
        {
          name: 'intField5',
          default: [55],
          required: true,
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
        },
        {
          name: 'floatField2',
          default: 0,
        },
        {
          name: 'floatField3',
          required: true,
        },
        {
          name: 'floatField4',
          array: true,
        },
        {
          name: 'floatField5',
          default: [5.5],
          required: true,
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
        },
        {
          name: 'booleanField2',
          default: false,
        },
        {
          name: 'booleanField3',
          required: true,
        },
        {
          name: 'booleanField4',
          array: true,
        },
        {
          name: 'booleanField5',
          default: [true, true],
          required: true,
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
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with file fields', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
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
    });

    const generalConfig = {
      allEntityConfigs: { Image: imageConfig, Example: entityConfig },
    };

    const expectedResult = `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  logo: Image!
  hero: Image
  pictures(slice: SliceInput): [Image!]!
  picturesThroughConnection(after: String, before: String, first: Int, last: Int): ImageConnection
  photos(slice: SliceInput): [Image!]!
  photosThroughConnection(after: String, before: String, first: Int, last: Int): ImageConnection
}`;

    const result = createEntityType(entityConfig, generalConfig, {}, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create file entity type with text fields', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
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

    const generalConfig = { allEntityConfigs: { Image: imageConfig } };

    const expectedResult = `type Image {
  id: ID!
  fileId: String!
  address: String
}`;
    const result = createEntityType(imageConfig, generalConfig, {}, {});
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
        },
      ],
    };

    const exampleEdgeConfig: EntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
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
        },
      ],
    };

    const exampleEdgeConfig: EntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig: EntityConfig = {
      name: 'ExampleConnection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: pageInfoConfig, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
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
});
