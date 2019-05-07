// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const createThingUpdateInputType = require('./createThingUpdateInputType');

describe('createThingUpdateInputType', () => {
  test('should create thing update input type with text fields', () => {
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
    const expectedResult = `input ExampleUpdateInput {
  textField1: String
  textField2: String
  textField3: String
  textField4: [String!]
  textField5: [String!]
}`;

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with relational fields', () => {
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
    const expectedResult = `input PersonUpdateInput {
  friends: [ID!]
  enemies: [ID!]
  location: ID
  favoritePlace: ID
}`;

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with duplex fields', () => {
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
    const expectedResult = `input PersonUpdateInput {
  friends: [ID!]
  enemies: [ID!]
  location: ID
  favoritePlace: ID
}`;

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with embedded fields', () => {
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
    const expectedResult = `input PersonUpdateInput {
  firstName: String
  lastName: String
  location: AddressUpdateInput
  locations: [AddressUpdateInput!]
  place: AddressUpdateInput
  places: [AddressUpdateInput!]
}`;

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with text fields', () => {
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
    const expectedResult = `input ExampleUpdateInput {
  position: GeospatialPointInput
  precedingPosition: GeospatialPointInput
  favoritePositions: [GeospatialPointInput!]
  worstPositions: [GeospatialPointInput!]
  area: GeospatialPolygonInput
  precedingArea: GeospatialPolygonInput
  favoriteAreas: [GeospatialPolygonInput!]
  worstAreas: [GeospatialPolygonInput!]
}`;
    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with enum fields', () => {
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

    const expectedResult = `input ExampleUpdateInput {
  field1: WeekdaysEnumeration
  field2: [CuisinesEnumeration!]
  field3: WeekdaysEnumeration
  field4: [CuisinesEnumeration!]
}`;

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
