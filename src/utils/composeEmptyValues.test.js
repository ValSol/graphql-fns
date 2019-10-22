// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

import composeEmptyValues from './composeEmptyValues';

describe('composeEmptyValues', () => {
  test('should create the simplest initial values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    });

    const expectedResult = { textField: '' };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial default values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          default: 'textFieldDefaultValue',
        },
      ],
    });

    const expectedResult = { textField: '' };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the valcomposeFlatFormikFieldsation schema with array field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textFields',
          array: true,
        },
      ],
    });

    const expectedResult = { textFields: [] };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the valcomposeFlatFormikFieldsation schema with default array field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textFields',
          default: ['test'],
          array: true,
        },
      ],
    });

    const expectedResult = { textFields: [] };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the valcomposeFlatFormikFieldsation schema with embedded field', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
    });

    const expectedResult = { embeddedField: { textField: '' } };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the valcomposeFlatFormikFieldsation schema with embedded array field', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const expectedResult = { embeddedFields: [] };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the valcomposeFlatFormikFieldsation schema with embedded array field with composeEmptyValues', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const expectedResult = { embeddedFields: [] };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the emebeded initial values with default composeEmptyValues', () => {
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
          required: true,
          default: 'default3',
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
          required: true,
          default: 'default2',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
        },
      ],
    };

    const embedded1Config: ThingConfig = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
          required: true,
          default: 'default1',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded2',
          config: embedded2Config,
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          required: true,
          default: 'default',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
        },
      ],
    };

    const expectedResult = {
      textField: '',
      embedded1: {
        textField1: '',
        embedded2: {
          textField2: '',
          embedded3: { textField3: '' },
        },
      },
    };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial int & float values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    });

    const expectedResult = { intField: '', floatField: '' };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial boolean values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField',
        },
      ],
    });

    const expectedResult = { booleanField: false };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial enum values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'SomeEnum',
        },
      ],
    });

    const expectedResult = { enumField: '' };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial geospatial values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      geospatialFields: [
        {
          name: 'geospatialFieldPoint',
          geospatialType: 'Point',
        },
        {
          name: 'geospatialFieldPolygon',
          geospatialType: 'Polygon',
        },
      ],
    });

    const expectedResult = {
      geospatialFieldPoint: {
        lng: '',
        lat: '',
      },
      geospatialFieldPolygon: {
        externalRing: {
          ring: [],
        },
        internalRings: [],
      },
    };

    const result = composeEmptyValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
