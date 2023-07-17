/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import composeWhereFields from './index';

describe('composeWhereFields', () => {
  test('should return true if args correspond to payload', () => {
    const exampleConfig = {} as EntityConfig;
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'booleanFieldIndexed',
          index: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField',
          type: 'booleanFields',
        },
      ],
      enumFields: [
        {
          name: 'enumFieldIndexed',
          index: true,
          enumName: 'EnumsName',
          type: 'enumFields',
        },
        {
          name: 'enumField',
          enumName: 'EnumsName',
          type: 'enumFields',
        },
      ],
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
      ],
      textFields: [
        {
          name: 'textFieldIndexed',
          index: true,
          type: 'textFields',
        },
        {
          name: 'textField',
          type: 'textFields',
        },
        {
          name: 'textFieldUnique',
          unique: true,
          type: 'textFields',
        },
      ],
      dateTimeFields: [
        {
          name: 'dateTimeFieldIndexed',
          index: true,
          type: 'dateTimeFields',
        },
        {
          name: 'dateTimeField',
          type: 'dateTimeFields',
        },
        {
          name: 'dateTimeFieldUnique',
          unique: true,
          type: 'dateTimeFields',
        },
      ],
      intFields: [
        {
          name: 'intFieldIndexed',
          index: true,
          type: 'intFields',
        },
        {
          name: 'intField',
          type: 'intFields',
        },
        {
          name: 'intFieldUnique',
          unique: true,
          type: 'intFields',
        },
      ],
      floatFields: [
        {
          name: 'floatIndexed',
          index: true,
          type: 'floatFields',
        },
        {
          name: 'floatField',
          type: 'floatFields',
        },
        {
          name: 'floatFieldUnique',
          unique: true,
          type: 'floatFields',
        },
      ],
      relationalFields: [
        {
          name: 'relationalFieldIndexed',
          oppositeName: 'parentRelationalFieldIndexed',
          config: exampleConfig,
          index: true,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalFieldIndexed',
          oppositeName: 'relationalFieldIndexed',
          config: exampleConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
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
      ],
      duplexFields: [
        {
          name: 'duplexFieldIndexed',
          config: exampleConfig,
          oppositeName: 'duplexField',
          index: true,
          type: 'duplexFields',
        },
        {
          name: 'duplexField',
          config: exampleConfig,
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
    });

    const expectedResults = {
      id: 'idArray',
      booleanFieldIndexed: 'booleanFields',
      enumFieldIndexed: 'enumFields',
      textFieldIndexed: 'textFields',
      textFieldUnique: 'textFieldsArray',
      dateTimeFieldIndexed: 'dateTimeFields',
      dateTimeFieldUnique: 'dateTimeFieldsArray',
      intFieldIndexed: 'intFields',
      intFieldUnique: 'intFieldsArray',
      floatIndexed: 'floatFields',
      floatFieldUnique: 'floatFieldsArray',
      relationalFieldIndexed: 'relationalFields',
      duplexFieldIndexed: 'duplexFields',
    };

    const result = composeWhereFields(exampleConfig);

    expect(result).toEqual(expectedResults);
  });
});
