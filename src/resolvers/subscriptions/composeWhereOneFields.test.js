// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeWhereOneFields from './composeWhereOneFields';

describe('composeWhereOneFields', () => {
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
      fileFields: [
        {
          name: 'fileFieldIndexed',
          index: true,
        },
        {
          name: 'fileField',
        },
        {
          name: 'fileFieldUnique',
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
      textFieldUnique: 'textFields',
      dateTimeFieldUnique: 'dateTimeFields',
      intFieldUnique: 'intFields',
      fileFieldUnique: 'fileFields',
      floatFieldUnique: 'floatFields',
      id: null,
    };

    const result = composeWhereOneFields(exampleConfig);

    expect(result).toEqual(expectedResults);
  });
});
