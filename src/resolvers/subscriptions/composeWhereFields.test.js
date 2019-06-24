// @flow
/* eslint-env jest */

import composeWhereFields from './composeWhereFields';

import type { ThingConfig } from '../../flowTypes';

describe('composeWhereFields', () => {
  test('should return true if args correspond to payload', () => {
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanFieldIndexed',
          index: true,
        },
        {
          name: 'booleanField',
        },
      ],
      enumFields: [
        {
          name: 'enumFieldIndexed',
          index: true,
          enumName: 'EnumsName',
        },
        {
          name: 'enumField',
          enumName: 'EnumsName',
        },
      ],
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
        },
      ],
      textFields: [
        {
          name: 'textFieldIndexed',
          index: true,
        },
        {
          name: 'textField',
        },
        {
          name: 'textFieldUnique',
          unique: true,
        },
      ],
      dateTimeFields: [
        {
          name: 'dateTimeFieldIndexed',
          index: true,
        },
        {
          name: 'dateTimeField',
        },
        {
          name: 'dateTimeFieldUnique',
          unique: true,
        },
      ],
      intFields: [
        {
          name: 'intFieldIndexed',
          index: true,
        },
        {
          name: 'intField',
        },
        {
          name: 'intFieldUnique',
          unique: true,
        },
      ],
      floatFields: [
        {
          name: 'floatIndexed',
          index: true,
        },
        {
          name: 'floatField',
        },
        {
          name: 'floatFieldUnique',
          unique: true,
        },
      ],
      relationalFields: [
        {
          name: 'relationalFieldIndexed',
          config: exampleConfig,
          index: true,
        },
        {
          name: 'relationalField',
          config: exampleConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexFieldIndexed',
          config: exampleConfig,
          oppositeName: 'duplexField',
          index: true,
        },
        {
          name: 'duplexField',
          config: exampleConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const expectedResults = {
      booleanFieldIndexed: 'booleanFields',
      enumFieldIndexed: 'enumFields',
      textFieldIndexed: 'textFields',
      dateTimeFieldIndexed: 'dateTimeFields',
      intFieldIndexed: 'intFields',
      floatIndexed: 'floatFields',
      relationalFieldIndexed: 'relationalFields',
      duplexFieldIndexed: 'duplexFields',
    };

    const result = composeWhereFields(exampleConfig);

    expect(result).toEqual(expectedResults);
  });
});
