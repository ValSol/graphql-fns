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

    const result = composeThingSchemaProperties(thingConfig, []);
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

    const result = composeThingSchemaProperties(personConfig, []);
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

    const result = composeThingSchemaProperties(personConfig, []);
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
    const result = composeThingSchemaProperties(personConfig, []);
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
          required: true,
          type: 'Point',
        },
        {
          name: 'polygonField1',
          type: 'Polygon',
        },
        {
          name: 'polygonField2',
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
          index: '2dsphere',
        },
      },
      pointField2: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
          index: '2dsphere',
        },
        required: true,
      },
      pointField3: [
        {
          type: {
            type: String,
            enum: ['Point'],
          },
          coordinates: {
            type: [Number],
            index: '2dsphere',
          },
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
            index: '2dsphere',
          },
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
      },
      polygonField2: {
        type: {
          type: String,
          enum: ['Polygon'],
        },
        coordinates: {
          type: [[[Number]]],
        },
        required: true,
      },
      polygonField3: [
        {
          type: {
            type: String,
            enum: ['Polygon'],
          },
          coordinates: {
            type: [[[Number]]],
          },
        },
      ],
      polygonField4: [
        {
          type: {
            type: String,
            enum: ['Polygon'],
          },
          coordinates: {
            type: [[[Number]]],
          },
          required: true,
        },
      ],
    };

    const result = composeThingSchemaProperties(thingConfig, []);
    expect(result).toEqual(expectedResult);
  });
  test('should compose schema properties with enum fields', () => {
    const enumeration1 = ['key1-1', 'key1-2', 'key1-3'];
    const enumeration2 = ['key2-1', 'key2-2', 'key2-3', 'key2-4'];
    const enums = [
      { name: 'enumeration1', enum: enumeration1 },
      { name: 'enumeration2', enum: enumeration2 },
    ];
    const thingConfig: ThingConfig = {
      name: 'Example',
      enumFields: [
        {
          name: 'enumField1',
          index: true,
          enumName: 'enumeration1',
        },
        {
          name: 'enumField2',
          default: 'key2-2',
          enumName: 'enumeration2',
        },
        {
          name: 'enumField3',
          array: true,
          enumName: 'enumeration2',
        },
        {
          name: 'enumField4',
          default: ['key1-1', 'key1-3'],
          required: true,
          array: true,
          index: true,
          enumName: 'enumeration1',
        },
      ],
    };
    const expectedResult = {
      enumField1: {
        type: String,
        enum: enumeration1,
        index: true,
      },
      enumField2: {
        type: String,
        enum: enumeration2,
        default: 'key2-2',
      },
      enumField3: {
        type: [String],
        enum: enumeration2,
      },
      enumField4: {
        type: [String],
        enum: enumeration1,
        required: true,
        default: ['key1-1', 'key1-3'],
        index: true,
      },
    };

    const result = composeThingSchemaProperties(thingConfig, enums);
    expect(result).toEqual(expectedResult);
  });
});
