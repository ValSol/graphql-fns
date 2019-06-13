// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

import coerceDataToGql from './coerceDataToGql';

describe('coerceDataToGql', () => {
  describe('should coerce realational & duplex & enum fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
        },
      ],
    });
    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      relationalField: '5cefb33f05d6be4b7b59842b',
      duplexField: '5cefb33f05d6be4b7b59842c',
      enumField: '',
    };

    test('empty prev data', () => {
      const prevData = { enumField: '' };

      const expectedResult = {
        relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
        duplexField: { connect: '5cefb33f05d6be4b7b59842c' },
      };

      const result = coerceDataToGql(data, prevData, thingConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        relationalField: '5cefb33f05d6be4b7b59842b',
        duplexField: '5cefb33f05d6be4b7b59842c',
        enumField: '',
      };

      const expectedResult = {};

      const result = coerceDataToGql(data, prevData, thingConfig);
      expect(result).toEqual(expectedResult);
    });

    test('removed prev data', () => {
      const data2 = {
        relationalField: '',
        duplexField: '',
        enumField: '',
      };

      const prevData = {
        relationalField: '5cefb33f05d6be4b7b59842b',
        duplexField: '5cefb33f05d6be4b7b59842c',
        enumField: 'Enum1',
      };

      const expectedResult = {
        relationalField: { connect: null },
        duplexField: { connect: null },
        enumField: null,
      };

      const result = coerceDataToGql(data2, prevData, thingConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  test('should coerce realational & duplex fields in embedded fields', () => {
    const thingConfig: ThingConfig = {};
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    };
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [{ name: 'textField' }],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embeddedConfig,
        },
        {
          name: 'embedded2',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const data = {
      textField: 'text field',
      embedded1: {
        relationalField: '5cefb33f05d6be4b7b59842b',
        duplexField: '5cefb33f05d6be4b7b59842c',
      },
      embedded2: [
        {
          relationalField: '5cefb33f05d6be4b7b59842e',
          duplexField: '5cefb33f05d6be4b7b59842f',
        },
        {
          relationalField: '5cefb33f05d6be4b7b598421',
          duplexField: '5cefb33f05d6be4b7b598422',
        },
      ],
    };

    const prevData = null;

    const expectedResult = {
      textField: 'text field',
      embedded1: {
        relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
        duplexField: { connect: '5cefb33f05d6be4b7b59842c' },
      },
      embedded2: [
        {
          relationalField: { connect: '5cefb33f05d6be4b7b59842e' },
          duplexField: { connect: '5cefb33f05d6be4b7b59842f' },
        },
        {
          relationalField: { connect: '5cefb33f05d6be4b7b598421' },
          duplexField: { connect: '5cefb33f05d6be4b7b598422' },
        },
      ],
    };

    const result = coerceDataToGql(data, prevData, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
