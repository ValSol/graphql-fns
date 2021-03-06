// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

import getInputFieldNames from './getInputFieldNames';
import createPushIntoThingInputType from '../types/inputs/createPushIntoThingInputType';

describe('getInputFieldNames', () => {
  test('should create thing input type with text fields', () => {
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
        {
          name: 'textField6',
          default: ['default text'],
          required: true,
          array: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['textField4', 'textField5'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with only scalar text fields', () => {
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
          freeze: true,
        },
      ],
    };
    const expectedResult = [];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with only freeze array text fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
          array: true,
          freeze: true,
        },
        {
          name: 'textField2',
          required: true,
          array: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = [];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with relational fields', () => {
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
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
          array: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
        {
          name: 'location2',
          config: placeConfig,
          required: true,
          array: true,
          freeze: true,
        },
      ],
    });
    const expectedResult = ['friends', 'location'];

    const result = getInputFieldNames(personConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create embedded thing input type with text fields', () => {
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
        {
          name: 'tags',
          array: true,
        },
      ],
    };
    const expectedResult = [];

    const result = getInputFieldNames(addressConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with embedded fields', () => {
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
        {
          name: 'places2',
          array: true,
          config: addressConfig,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['locations', 'places'];

    const result = getInputFieldNames(personConfig, createPushIntoThingInputType);

    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with duplex fields', () => {
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
        {
          name: 'visitors2',
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
        {
          name: 'favoritePlace2',
          oppositeName: 'visitors2',
          config: placeConfig,
          freeze: true,
        },
      ],
    });
    const expectedResult = ['friends', 'enemies'];

    const result = getInputFieldNames(personConfig, createPushIntoThingInputType);

    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with geospatial fields', () => {
    const thingConfig = {
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
          name: 'favoritePositions2',
          array: true,
          geospatialType: 'Point',
          required: true,
          freeze: true,
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
    const expectedResult = ['favoritePositions', 'worstPositions', 'favoriteAreas', 'worstAreas'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with enum fields', () => {
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
        {
          name: 'field5',
          array: true,
          enumName: 'Cuisines',
          required: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['field2', 'field4'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
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
        {
          name: 'intField6',
          required: true,
          array: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['intField4', 'intField5'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
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
        {
          name: 'floatField5',
          required: true,
          array: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['floatField4', 'floatField5'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
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
        {
          name: 'booleanField6',
          required: true,
          array: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['booleanField4', 'booleanField5'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create file thing input type with text fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [
        {
          name: 'fileId',
          required: true,
        },
        {
          name: 'comment',
        },
      ],
    };
    const expectedResult = [];

    const result = getInputFieldNames(imageConfig, createPushIntoThingInputType);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with file fields', () => {
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
        {
          name: 'photos2',
          config: imageConfig,
          array: true,
          freeze: true,
        },
      ],
    });

    const expectedResult = ['pictures', 'photos'];

    const result = getInputFieldNames(thingConfig, createPushIntoThingInputType);

    expect(result).toEqual(expectedResult);
  });
});
