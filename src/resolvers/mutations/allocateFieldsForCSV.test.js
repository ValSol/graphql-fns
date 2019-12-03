// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import allocateFieldsForCSV from './allocateFieldsForCSV';

describe('allocateFieldsForCSV', () => {
  test('should return right allacation fields for text fields', () => {
    const exampleConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
        {
          name: 'textArrayField',
          array: true,
        },
      ],
    };

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['textArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for file fields', () => {
    const exampleConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'fileField',
        },
        {
          name: 'fileArrayField',
          array: true,
        },
      ],
    };

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['fileArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for datetime fields', () => {
    const exampleConfig: ThingConfig = {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'dateTimeField',
        },
        {
          name: 'dateTimeArrayField',
          array: true,
        },
      ],
    };

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['dateTimeArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for relational fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: exampleConfig,
        },
        {
          name: 'relationalArrayField',
          array: true,
          config: exampleConfig,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['relationalArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for duplex fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      duplexFields: [
        {
          name: 'duplexField',
          oppositeName: 'duplexArrayField',
          config: exampleConfig,
        },
        {
          name: 'duplexArrayField',
          oppositeName: 'duplexField',
          array: true,
          config: exampleConfig,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['duplexArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for int fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
        {
          name: 'intArrayField',
          array: true,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: ['intField'],
      object: ['intArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for float fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      floatFields: [
        {
          name: 'floatField',
        },
        {
          name: 'floatArrayField',
          array: true,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: ['floatField'],
      int: [],
      object: ['floatArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for boolean fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField',
        },
        {
          name: 'booleanArrayField',
          array: true,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: ['booleanField'],
      float: [],
      int: [],
      object: ['booleanArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for enum fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'enumeration',
        },
        {
          name: 'enumArrayField',
          enumName: 'enumeration',
          array: true,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['enumArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for geospatial fields', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
        },
        {
          name: 'geospatialArrayField',
          geospatialType: 'Point',
          array: true,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['geospatialField', 'geospatialArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for geospatial fields', () => {
    const embeddedConfig: ThingConfig = {
      name: 'EmbeddedExample',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
        {
          name: 'embeddedArrayField',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['embeddedField', 'embeddedArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });
});
