/* eslint-env jest */
import type { EntityConfig } from '../tsTypes';

import composeEmptyValues from './composeEmptyValues';

describe('composeEmptyValues', () => {
  test('should create the simplest initial values object', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    });

    const expectedResult = { textField: '' };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial default values object', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          default: 'textFieldDefaultValue',
        },
      ],
    });

    const expectedResult = { textField: '' };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with array field', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          array: true,
        },
      ],
    });

    const expectedResult = { textFields: [] };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with default array field', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          default: ['test'],
          array: true,
        },
      ],
    });

    const expectedResult = { textFields: [] };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with file field', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'desktop',
        },
        {
          name: 'mobile',
        },
      ],
    };
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
      ],
    });

    const expectedResult = { logo: { desktop: '', mobile: '' } };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with file array field', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'embedded',
      textFields: [
        {
          name: 'desktop',
        },
        {
          name: 'mobile',
        },
      ],
    };
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
      ],
    });

    const expectedResult = { photos: [] };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with embedded field', () => {
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
    });

    const expectedResult = { embeddedField: { textField: '' } };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with embedded array field', () => {
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const expectedResult = { embeddedFields: [] };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the empty fields with embedded array field with composeEmptyValues', () => {
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const expectedResult = { embeddedFields: [] };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the emebeded initial values with default composeEmptyValues', () => {
    const embedded3Config: EntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      textFields: [
        {
          name: 'textField3',
          required: true,
          default: 'default3',
        },
      ],
    };

    const embedded2Config: EntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
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

    const embedded1Config: EntityConfig = {
      name: 'Embedded1',
      type: 'embedded',
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

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial int & float values object', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial boolean values object', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'booleanField',
        },
      ],
    });

    const expectedResult = { booleanField: false };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial enum values object', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'SomeEnum',
        },
      ],
    });

    const expectedResult = { enumField: '' };

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial geospatial values object', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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

    const result = composeEmptyValues(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
