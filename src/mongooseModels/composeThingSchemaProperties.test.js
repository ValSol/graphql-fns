// @flow
/* eslint-env jest */
import mongoose from 'mongoose';

import type { Enums, ThingConfig } from '../flowTypes';

import composeThingSchemaProperties from './composeThingSchemaProperties';

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
        index: true,
      },
      textField2: {
        type: String,
        default: 'default text',
      },
      textField3: {
        type: String,
        required: true,
        unique: true,
      },
      textField4: {
        type: [String],
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

  test('should compose schema properties with file fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'fileField1',
          index: true,
        },
        {
          name: 'fileField2',
          default: 'default/file',
        },
        {
          name: 'fileField3',
          required: true,
          unique: true,
        },
        {
          name: 'fileField4',
          array: true,
        },
        {
          name: 'fileField5',
          default: ['default/file'],
          required: true,
          array: true,
        },
      ],
    };
    const expectedResult = {
      fileField1: {
        type: String,
        index: true,
      },
      fileField2: {
        type: String,
        default: 'default/file',
      },
      fileField3: {
        type: String,
        required: true,
        unique: true,
      },
      fileField4: {
        type: [String],
      },
      fileField5: {
        type: [String],
        required: true,
        default: ['default/file'],
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
      },
      lastName: {
        type: String,
        required: true,
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
      },
      lastName: {
        type: String,
        required: true,
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

    const expectedResult = {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      location: {
        country: {
          type: String,
          required: true,
          default: 'Ukraine',
        },
        province: {
          type: String,
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
          geospatialType: 'Point',
        },
        {
          name: 'pointField2',
          required: true,
          geospatialType: 'Point',
        },
        {
          name: 'pointField3',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'pointField4',
          array: true,
          required: true,
          geospatialType: 'Point',
        },
        {
          name: 'polygonField1',
          geospatialType: 'Polygon',
        },
        {
          name: 'polygonField2',
          required: true,
          geospatialType: 'Polygon',
        },
        {
          name: 'polygonField3',
          array: true,
          geospatialType: 'Polygon',
        },
        {
          name: 'polygonField4',
          array: true,
          required: true,
          geospatialType: 'Polygon',
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
          required: true,
        },
        coordinates: {
          type: [Number],
          index: '2dsphere',
        },
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
            required: true,
          },
          coordinates: {
            type: [Number],
            index: '2dsphere',
          },
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
          required: true,
        },
        coordinates: {
          type: [[[Number]]],
        },
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
            required: true,
          },
          coordinates: {
            type: [[[Number]]],
          },
        },
      ],
    };

    const result = composeThingSchemaProperties(thingConfig, []);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with enum fields', () => {
    const enumeration1 = ['key1-1', 'key1-2', 'key1-3'];
    const enumeration2 = ['key2-1', 'key2-2', 'key2-3', 'key2-4'];
    const enums: Enums = [
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

  test('should compose schema properties with dateTime fields', () => {
    const enums: Enums = [];
    const thingConfig: ThingConfig = {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'birthday',
          index: true,
        },
        {
          name: 'startDate',
          default: new Date(1993, 6, 28, 14, 39, 7),
        },
        {
          name: 'holidays',
          array: true,
        },
        {
          name: 'windays',
          default: [new Date('1991-08-24'), new Date('1991-12-01')],
          required: true,
          array: true,
          index: true,
        },
      ],
    };
    const expectedResult = {
      birthday: {
        type: Date,
        index: true,
      },
      startDate: {
        type: Date,
        default: new Date(1993, 6, 28, 14, 39, 7),
      },
      holidays: {
        type: [Date],
      },
      windays: {
        type: [Date],
        required: true,
        default: [new Date('1991-08-24'), new Date('1991-12-01')],
        index: true,
      },
    };

    const result = composeThingSchemaProperties(thingConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with int fields', () => {
    const enums: Enums = [];
    const thingConfig: ThingConfig = {
      name: 'Example',
      intFields: [
        {
          name: 'intField_1',
          unique: true,
          required: true,
        },
        {
          name: 'intField_2',
          default: 0,
          index: true,
        },
        {
          name: 'intField_3',
          array: true,
        },
        {
          name: 'intField_4',
          default: [10, 20, 30],
          required: true,
          array: true,
          index: true,
        },
      ],
    };
    const expectedResult = {
      intField_1: {
        type: Number,
        unique: true,
        required: true,
      },
      intField_2: {
        type: Number,
        index: true,
        default: 0,
      },
      intField_3: {
        type: [Number],
      },
      intField_4: {
        type: [Number],
        required: true,
        default: [10, 20, 30],
        index: true,
      },
    };

    const result = composeThingSchemaProperties(thingConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with float fields', () => {
    const enums: Enums = [];
    const thingConfig: ThingConfig = {
      name: 'Example',
      floatFields: [
        {
          name: 'floatField_1',
          unique: true,
          required: true,
        },
        {
          name: 'floatField_2',
          default: 0.0,
          index: true,
        },
        {
          name: 'floatField_3',
          array: true,
        },
        {
          name: 'floatField_4',
          default: [0.1, 0.2, 0.3],
          required: true,
          array: true,
          index: true,
        },
      ],
    };
    const expectedResult = {
      floatField_1: {
        type: Number,
        unique: true,
        required: true,
      },
      floatField_2: {
        type: Number,
        index: true,
        default: 0,
      },
      floatField_3: {
        type: [Number],
      },
      floatField_4: {
        type: [Number],
        required: true,
        default: [0.1, 0.2, 0.3],
        index: true,
      },
    };

    const result = composeThingSchemaProperties(thingConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with boolean fields', () => {
    const enums: Enums = [];
    const thingConfig: ThingConfig = {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField_1',
          required: true,
        },
        {
          name: 'booleanField_2',
          index: true,
          default: false,
        },
        {
          name: 'booleanField_3',
          array: true,
        },
        {
          name: 'booleanField_4',
          default: [true, false, true],
          required: true,
          array: true,
          index: true,
        },
      ],
    };
    const expectedResult = {
      booleanField_1: {
        type: Boolean,
        required: true,
      },
      booleanField_2: {
        type: Boolean,
        index: true,
        default: false,
      },
      booleanField_3: {
        type: [Boolean],
      },
      booleanField_4: {
        type: [Boolean],
        required: true,
        default: [true, false, true],
        index: true,
      },
    };

    const result = composeThingSchemaProperties(thingConfig, enums);
    expect(result).toEqual(expectedResult);
  });
});
