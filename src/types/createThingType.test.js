// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

import createThingType from './createThingType';

describe('createThingType', () => {
  test('should create thing type with Text fields', () => {
    const thingConfig: ThingConfig = {
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
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  textField4(slice: SliceInput): [String!]!
  textField5(slice: SliceInput): [String!]!
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with relational fields', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
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
    const expectedResult = `type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  location: Place!
  favoritePlace: Place
}`;

    const result = createThingType(personConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with embedded fields', () => {
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
    const expectedResult = `type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  location: Address!
  locations(slice: SliceInput): [Address!]!
  place: Address
  places(slice: SliceInput): [Address!]!
}`;

    const result = createThingType(personConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create embeded thing type with text fields', () => {
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
    const expectedResult = `type Address {
  id: ID!
  country: String!
  province: String
}`;

    const result = createThingType(addressConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with duplex fields', () => {
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
    const expectedResult = `type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  location: Place!
  favoritePlace: Place
}`;

    const result = createThingType(personConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
    const expectedResult = `type Example {
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

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with enum fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  field1: WeekdaysEnumeration
  field2(slice: SliceInput): [CuisinesEnumeration!]!
  field3: WeekdaysEnumeration!
  field4(slice: SliceInput): [CuisinesEnumeration!]!
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with int fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  intField1: Int
  intField2: Int
  intField3: Int!
  intField4(slice: SliceInput): [Int!]!
  intField5(slice: SliceInput): [Int!]!
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with float fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  floatField1: Float
  floatField2: Float
  floatField3: Float!
  floatField4(slice: SliceInput): [Float!]!
  floatField5(slice: SliceInput): [Float!]!
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with boolean fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  booleanField1: Boolean
  booleanField2: Boolean
  booleanField3: Boolean!
  booleanField4(slice: SliceInput): [Boolean!]!
  booleanField5(slice: SliceInput): [Boolean!]!
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with file fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
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

    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  logo: Image!
  hero: Image
  pictures(slice: SliceInput): [Image!]!
  photos(slice: SliceInput): [Image!]!
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create file thing type with text fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
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

    const expectedResult = `type Image {
  id: ID!
  fileId: String!
  address: String
}`;

    const result = createThingType(imageConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with Text fields and counter field', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      counter: true,
      textFields: [
        {
          name: 'textField1',
        },
      ],
    };
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  counter: Int!
  textField1: String
}`;

    const result = createThingType(thingConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
