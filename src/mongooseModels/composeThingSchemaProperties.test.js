// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

const { Schema } = mongoose;

describe('composeThingSchemaProperties', () => {
  test('should compose schema properties with text fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
          index: true,
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
          unique: true,
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
    const expectedResult = {
      textField1: {
        type: String,
        default: '',
        index: true,
      },
      textField2: {
        type: String,
        default: 'default text',
      },
      textField3: {
        type: String,
        required: true,
        default: '',
        unique: true,
      },
      textField4: {
        type: [String],
        default: [],
      },
      textField5: {
        type: [String],
        required: true,
        default: ['default text'],
      },
    };

    const result = composeThingSchemaProperties(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text and relational fields', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
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
          array: true,
          config: personConfig,
          index: true,
          required: true,
        },
        {
          name: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          config: placeConfig,
          index: true,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
      ],
    });
    const expectedResult = {
      firstName: {
        type: String,
        required: true,
        default: '',
      },
      lastName: {
        type: String,
        required: true,
        default: '',
      },
      friends: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          index: true,
        },
      ],
      enemies: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          required: false,
        },
      ],
      location: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        index: true,
      },
      favoritePlace: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: false,
      },
    };

    const result = composeThingSchemaProperties(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text and duplex fields', () => {
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
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
          index: true,
          required: false,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          index: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          required: false,
        },
      ],
    });
    const expectedResult = {
      firstName: {
        type: String,
        required: true,
        default: '',
      },
      lastName: {
        type: String,
        required: true,
        default: '',
      },
      friends: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          required: false,
        },
      ],
      enemies: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          index: true,
          required: false,
        },
      ],
      location: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        index: true,
        required: false,
      },
      favoritePlace: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: false,
      },
    };

    const result = composeThingSchemaProperties(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text and embeded fields', () => {
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

    const expectedResult = {
      firstName: {
        type: String,
        required: true,
        default: '',
      },
      lastName: {
        type: String,
        required: true,
        default: '',
      },
      location: {
        country: {
          type: String,
          required: true,
          default: 'Ukraine',
        },
        province: {
          type: String,
          default: '',
        },
      },
      locations: [
        {
          country: {
            type: String,
            required: true,
            default: 'Ukraine',
          },
          province: {
            type: String,
            default: '',
          },
        },
      ],
      place: {
        country: {
          type: String,
          required: true,
          default: 'Ukraine',
        },
        province: {
          type: String,
          default: '',
        },
      },
      places: [
        {
          country: {
            type: String,
            required: true,
            default: 'Ukraine',
          },
          province: {
            type: String,
            default: '',
          },
        },
      ],
    };
    const result = composeThingSchemaProperties(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'pointField1',
          type: 'Point',
        },
        {
          name: 'pointField2',
          default: { longitude: 50, latitude: 30 },
          required: true,
          type: 'Point',
        },
        {
          name: 'pointField3',
          array: true,
          type: 'Point',
        },
        {
          name: 'pointField4',
          array: true,
          default: [{ longitude: 50, latitude: 30 }, { longitude: 60, latitude: 20 }],
          required: true,
          type: 'Point',
        },
        {
          name: 'polygonField1',
          type: 'Polygon',
        },
        {
          name: 'polygonField2',
          default: {
            externalRing: {
              ring: [
                { longitude: 0, latitude: 0 },
                { longitude: 3, latitude: 6 },
                { longitude: 6, latitude: 1 },
                { longitude: 0, latitude: 0 },
              ],
            },
          },
          required: true,
          type: 'Polygon',
        },
        {
          name: 'polygonField3',
          array: true,
          type: 'Polygon',
        },
        {
          name: 'polygonField4',
          array: true,
          default: [
            {
              externalRing: {
                ring: [
                  { longitude: 0, latitude: 0 },
                  { longitude: 3, latitude: 6 },
                  { longitude: 6, latitude: 1 },
                  { longitude: 0, latitude: 0 },
                ],
              },
            },
          ],
          required: true,
          type: 'Polygon',
        },
      ],
    };
    const expectedResult = {
      pointField1: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
        default: undefined,
      },
      pointField2: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
        required: true,
        default: { type: 'Point', coordinates: [50, 30] },
      },
      pointField3: [
        {
          type: {
            type: String,
            enum: ['Point'],
          },
          coordinates: {
            type: [Number],
          },
          default: undefined,
        },
      ],
      pointField4: [
        {
          type: {
            type: String,
            enum: ['Point'],
          },
          coordinates: {
            type: [Number],
          },
          default: [
            { type: 'Point', coordinates: [50, 30] },
            { type: 'Point', coordinates: [60, 20] },
          ],
          required: true,
        },
      ],
      polygonField1: {
        type: {
          type: String,
          enum: ['Polygon'],
        },
        coordinates: {
          type: [[[Number]]],
        },
        default: undefined,
      },
      polygonField2: {
        type: {
          type: String,
          enum: ['Polygon'],
        },
        coordinates: {
          type: [[[Number]]],
        },
        default: {
          type: 'Polygon',
          coordinates: [[[0, 0], [3, 6], [6, 1], [0, 0]]],
        },
        required: true,
      },
      polygonField3: [
        {
          type: {
            type: String,
            enum: ['Polygon'],
            // required: true,
          },
          coordinates: {
            type: [[[Number]]],
            // required: true,
          },
          default: undefined,
        },
      ],
      polygonField4: [
        {
          type: {
            type: String,
            enum: ['Polygon'],
            // required: true,
          },
          coordinates: {
            type: [[[Number]]],
            // required: true,
          },
          default: [
            {
              type: 'Polygon',
              coordinates: [[[0, 0], [3, 6], [6, 1], [0, 0]]],
            },
          ],
          required: true,
        },
      ],
    };

    const result = composeThingSchemaProperties(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
