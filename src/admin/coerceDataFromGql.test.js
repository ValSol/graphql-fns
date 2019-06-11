// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

import coerceDataFromGql from './coerceDataFromGql';

describe('coerceDataFromGql', () => {
  test('should coerce realational & duplex', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          array: true,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      relationalField: { id: '5cefb33f05d6be4b7b59842b' },
      relationalField2: [{ id: '5cefb33f05d6be4b7b598421' }, { id: '5cefb33f05d6be4b7b598422' }],
      duplexField: { id: '5cefb33f05d6be4b7b59842c' },
      __typename: 'Example',
    };

    const expectedResult = {
      relationalField: '5cefb33f05d6be4b7b59842b',
      relationalField2: ['5cefb33f05d6be4b7b598421', '5cefb33f05d6be4b7b598422'],
      duplexField: '5cefb33f05d6be4b7b59842c',
    };

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
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
      id: '5cefb33f05d6be4b7b59842a',
      textField: 'text field',
      embedded1: {
        relationalField: { id: '5cefb33f05d6be4b7b59842b' },
        duplexField: { id: '5cefb33f05d6be4b7b59842c' },
        __typename: 'Embedded',
      },
      embedded2: [
        {
          relationalField: { id: '5cefb33f05d6be4b7b59842e' },
          duplexField: { id: '5cefb33f05d6be4b7b59842f' },
          __typename: 'Embedded',
        },
        {
          relationalField: { id: '5cefb33f05d6be4b7b598421' },
          duplexField: { id: '5cefb33f05d6be4b7b598422' },
          __typename: 'Embedded',
        },
      ],
      __typename: 'Example',
    };

    const expectedResult = {
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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
