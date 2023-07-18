/* eslint-env jest */
import mongoose from 'mongoose';

import type {
  Enums,
  EmbeddedEntityConfig,
  FileEntityConfig,
  TangibleEntityConfig,
} from '../tsTypes';

import composeThingSchemaProperties from './composeThingSchemaProperties';

const { Schema } = mongoose;

describe('composeThingSchemaProperties', () => {
  test('should compose schema properties with text fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          index: true,
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
          unique: true,
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
          name: 'textField6',
          unique: true,
          type: 'textFields',
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
      textField6: {
        type: String,
        sparse: true,
        unique: true,
      },
    };

    const result = composeThingSchemaProperties(entityConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text and relational fields', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [
        {
          name: 'citisens',
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
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          array: true,
          config: personConfig,
          index: true,
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
          array: true,
          config: personConfig,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          array: true,
          parent: true,
          config: personConfig,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citisens',
          config: placeConfig,
          index: true,
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
          type: 'ObjectId',
          ref: 'Person',
          index: true,
        },
      ],
      enemies: [
        {
          type: 'ObjectId',
          ref: 'Person',
          required: false,
          index: true,
        },
      ],
      location: {
        type: 'ObjectId',
        ref: 'Place',
        index: true,
      },
      favoritePlace: {
        type: 'ObjectId',
        ref: 'Place',
        required: false,
        index: true,
      },
    };

    const result = composeThingSchemaProperties(personConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text and duplex fields', () => {
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
          type: 'duplexFields',
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
          index: true,
          required: false,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          index: true,
          type: 'duplexFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          required: false,
          type: 'duplexFields',
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
          type: 'ObjectId',
          ref: 'Person',
          required: false,
        },
      ],
      enemies: [
        {
          type: 'ObjectId',
          ref: 'Person',
          index: true,
          required: false,
        },
      ],
      location: {
        type: 'ObjectId',
        ref: 'Place',
        index: true,
        required: false,
      },
      favoritePlace: {
        type: 'ObjectId',
        ref: 'Place',
        required: false,
      },
    };

    const result = composeThingSchemaProperties(personConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text and embeded fields', () => {
    const addressConfig: EmbeddedEntityConfig = {
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
    const personConfig: TangibleEntityConfig = {
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
        },
      ],
    };

    const expectedResult: any = {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      location: {
        type: new Schema({
          country: {
            type: String,
            required: true,
            default: 'Ukraine',
          },
          province: {
            type: String,
          },
        }),
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
        type: new Schema({
          country: {
            type: String,
            required: true,
            default: 'Ukraine',
          },
          province: {
            type: String,
          },
        }),
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
    const result = composeThingSchemaProperties(personConfig, {});
    // to correct differences in $id service field generated by Schema
    result.location.type.$id = null;
    expectedResult.location.type.$id = null;
    result.place.type.$id = null;
    expectedResult.place.type.$id = null;
    expect(JSON.parse(JSON.stringify(result))).toEqual(JSON.parse(JSON.stringify(expectedResult)));
  });

  test('should compose schema properties with text and file fields', () => {
    const imageConfig: FileEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'desktop',
          required: true,
          type: 'textFields',
        },
        {
          name: 'mobile',
          required: true,
          type: 'textFields',
        },
        {
          name: 'tablet',
          required: true,
          type: 'textFields',
        },
        {
          name: 'title',
          type: 'textFields',
        },
      ],
    };

    const exampleConfig: TangibleEntityConfig = {
      name: 'Example',
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
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'photos',
          array: true,
          config: imageConfig,
          type: 'fileFields',
        },
      ],
    };

    const expectedResult: any = {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      logo: {
        type: new Schema({
          desktop: {
            required: true,
            type: String,
          },
          mobile: {
            required: true,
            type: String,
          },
          tablet: {
            required: true,
            type: String,
          },
          title: {
            type: String,
          },
        }),
      },
      photos: [
        {
          desktop: {
            required: true,
            type: String,
          },
          mobile: {
            required: true,
            type: String,
          },
          tablet: {
            required: true,
            type: String,
          },
          title: {
            type: String,
          },
        },
      ],
    };

    const result = composeThingSchemaProperties(exampleConfig, {});
    // to correct differences in $id service field generated by Schema
    result.logo.type.$id = null;
    expectedResult.logo.type.$id = null;
    expect(JSON.parse(JSON.stringify(result))).toEqual(JSON.parse(JSON.stringify(expectedResult)));
  });

  test('should compose schema properties with geospatial fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'pointField1',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointField2',
          required: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointField3',
          array: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointField4',
          array: true,
          required: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField1',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField2',
          required: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField3',
          array: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField4',
          array: true,
          required: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
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

    const result = composeThingSchemaProperties(entityConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with enum fields', () => {
    const enumeration1 = ['key1-1', 'key1-2', 'key1-3'];
    const enumeration2 = ['key2-1', 'key2-2', 'key2-3', 'key2-4'];
    const enums: Enums = { enumeration1, enumeration2 };
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      enumFields: [
        {
          name: 'enumField1',
          index: true,
          enumName: 'enumeration1',
          type: 'enumFields',
        },
        {
          name: 'enumField2',
          default: 'key2-2',
          enumName: 'enumeration2',
          type: 'enumFields',
        },
        {
          name: 'enumField3',
          array: true,
          enumName: 'enumeration2',
          type: 'enumFields',
        },
        {
          name: 'enumField4',
          default: ['key1-1', 'key1-3'],
          required: true,
          array: true,
          index: true,
          enumName: 'enumeration1',
          type: 'enumFields',
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

    const result = composeThingSchemaProperties(entityConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with dateTime fields', () => {
    const enums: Enums = {};
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'birthday',
          index: true,
          type: 'dateTimeFields',
        },
        {
          name: 'startDate',
          default: new Date(1993, 6, 28, 14, 39, 7),
          type: 'dateTimeFields',
        },
        {
          name: 'holidays',
          array: true,
          type: 'dateTimeFields',
        },
        {
          name: 'windays',
          default: [new Date('1991-08-24'), new Date('1991-12-01')],
          required: true,
          array: true,
          index: true,
          type: 'dateTimeFields',
        },
        {
          name: 'uniqueTime',
          unique: true,
          type: 'dateTimeFields',
        },
        {
          name: 'uniqueRequiredTime',
          unique: true,
          required: true,
          type: 'dateTimeFields',
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
      uniqueTime: {
        type: Date,
        unique: true,
        sparse: true,
      },
      uniqueRequiredTime: {
        type: Date,
        unique: true,
        required: true,
      },
    };

    const result = composeThingSchemaProperties(entityConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with int fields', () => {
    const enums: Enums = {};
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField_1',
          unique: true,
          required: true,
          type: 'intFields',
        },
        {
          name: 'intField_2',
          default: 0,
          index: true,
          type: 'intFields',
        },
        {
          name: 'intField_3',
          array: true,
          type: 'intFields',
        },
        {
          name: 'intField_4',
          default: [10, 20, 30],
          required: true,
          array: true,
          index: true,
          type: 'intFields',
        },
        {
          name: 'intField_5',
          unique: true,
          type: 'intFields',
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
      intField_5: {
        type: Number,
        unique: true,
        sparse: true,
      },
    };

    const result = composeThingSchemaProperties(entityConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with float fields', () => {
    const enums: Enums = {};
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'floatField_1',
          unique: true,
          required: true,
          type: 'floatFields',
        },
        {
          name: 'floatField_2',
          default: 0.0,
          index: true,
          type: 'floatFields',
        },
        {
          name: 'floatField_3',
          array: true,
          type: 'floatFields',
        },
        {
          name: 'floatField_4',
          default: [0.1, 0.2, 0.3],
          required: true,
          array: true,
          index: true,
          type: 'floatFields',
        },
        {
          name: 'floatField_5',
          unique: true,
          type: 'floatFields',
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
      floatField_5: {
        type: Number,
        unique: true,
        sparse: true,
      },
    };

    const result = composeThingSchemaProperties(entityConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with boolean fields', () => {
    const enums: Enums = {};
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'booleanField_1',
          required: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField_2',
          index: true,
          default: false,
          type: 'booleanFields',
        },
        {
          name: 'booleanField_3',
          array: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField_4',
          default: [true, false, true],
          required: true,
          array: true,
          index: true,
          type: 'booleanFields',
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

    const result = composeThingSchemaProperties(entityConfig, enums);
    expect(result).toEqual(expectedResult);
  });

  test('should compose schema properties with text fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };
    const expectedResult = {
      counter: {
        required: true,
        type: Number,
        unique: true,
      },
      textField: {
        type: String,
      },
    };

    const result = composeThingSchemaProperties(entityConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
