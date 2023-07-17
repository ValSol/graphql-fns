/* eslint-env jest */
import type { EntityConfig } from '../../../tsTypes';

import allocateFieldsForCSV from './allocateFieldsForCSV';

describe('allocateFieldsForCSV', () => {
  test('should return right allacation fields for text fields', () => {
    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
        {
          name: 'textArrayField',
          array: true,
          type: 'textFields',
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

  test('should return right allacation fields for datetime fields', () => {
    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'dateTimeField',
          type: 'dateTimeFields',
        },
        {
          name: 'dateTimeArrayField',
          array: true,
          type: 'dateTimeFields',
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
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField',
          oppositeName: 'parentRelationalField',
          config: exampleConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalField',
          oppositeName: 'relationalField',
          config: exampleConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'relationalArrayField',
          oppositeName: 'parentRelationalArrayField',
          config: exampleConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalArrayField',
          oppositeName: 'relationalArrayField',
          config: exampleConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['relationalField', 'relationalArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for duplex fields', () => {
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField',
          oppositeName: 'duplexArrayField',
          config: exampleConfig,
          type: 'duplexFields',
        },
        {
          name: 'duplexArrayField',
          oppositeName: 'duplexField',
          array: true,
          config: exampleConfig,
          type: 'duplexFields',
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['duplexField', 'duplexArrayField'],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return right allacation fields for int fields', () => {
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField',
          type: 'intFields',
        },
        {
          name: 'intArrayField',
          array: true,
          type: 'intFields',
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
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'floatField',
          type: 'floatFields',
        },
        {
          name: 'floatArrayField',
          array: true,
          type: 'floatFields',
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
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'booleanField',
          type: 'booleanFields',
        },
        {
          name: 'booleanArrayField',
          array: true,
          type: 'booleanFields',
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
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'enumeration',
          type: 'enumFields',
        },
        {
          name: 'enumArrayField',
          enumName: 'enumeration',
          array: true,
          type: 'enumFields',
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
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialArrayField',
          geospatialType: 'Point',
          type: 'geospatialFields',
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

  test('should return right allacation fields for embedded fields', () => {
    const embeddedConfig: EntityConfig = {
      name: 'EmbeddedExample',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
          type: 'embeddedFields',
        },
        {
          name: 'embeddedArrayField',
          config: embeddedConfig,
          array: true,
          type: 'embeddedFields',
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

  test('should return right allacation fields for file fields', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'address',
          type: 'textFields',
        },
      ],
    };
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          type: 'fileFields',
        },
      ],
    });

    const result = allocateFieldsForCSV(exampleConfig);

    const expectedResult = {
      boolean: [],
      float: [],
      int: [],
      object: ['logo', 'pictures'],
    };

    expect(result).toEqual(expectedResult);
  });
});
