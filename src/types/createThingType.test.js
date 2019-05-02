// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

const createThingType = require('./createThingType');

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
  textField4: [String!]!
  textField5: [String!]!
}`;

    const result = createThingType(thingConfig);
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
  friends: [Person!]!
  enemies: [Person!]!
  location: Place!
  favoritePlace: Place
}`;

    const result = createThingType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with embedded fields', () => {
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
    const expectedResult = `type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  location: Address!
  locations: [Address!]!
  place: Address
  places: [Address!]!
}`;

    const result = createThingType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create embeded thing type with text fields', () => {
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
    const expectedResult = `type Address {
  id: ID!
  country: String!
  province: String
}`;

    const result = createThingType(addressConfig);
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
  friends: [Person!]!
  enemies: [Person!]!
  location: Place!
  favoritePlace: Place
}`;

    const result = createThingType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
          required: true,
        },
        {
          name: 'precedingPosition',
          type: 'Point',
        },
        {
          name: 'favoritePositions',
          array: true,
          type: 'Point',
          required: true,
        },
        {
          name: 'worstPositions',
          array: true,
          type: 'Point',
        },
        {
          name: 'area',
          type: 'Polygon',
          required: true,
        },
        {
          name: 'precedingArea',
          type: 'Polygon',
        },
        {
          name: 'favoriteAreas',
          array: true,
          type: 'Polygon',
          required: true,
        },
        {
          name: 'worstAreas',
          array: true,
          type: 'Polygon',
        },
      ],
    };
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  position: GeospatialPoint!
  precedingPosition: GeospatialPoint
  favoritePositions: [GeospatialPoint!]!
  worstPositions: [GeospatialPoint!]!
  area: GeospatialPolygon!
  precedingArea: GeospatialPolygon
  favoriteAreas: [GeospatialPolygon!]!
  worstAreas: [GeospatialPolygon!]!
}`;

    const result = createThingType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
