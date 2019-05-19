// @flow
/* eslint-env jest */
import type { ThingConfig, ThingConfigObject } from '../flowTypes';

const composeFieldsObject = require('./composeFieldsObject');

describe('composeFieldsObject', () => {
  test('should compose Oject of fields', () => {
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
      booleanFields: [
        {
          name: 'booleanField',
        },
      ],
      dateTimeFields: [
        {
          name: 'dateTimeField',
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'enumeration',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
        },
      ],
      intFields: [
        {
          name: 'intField',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
      textFields: [
        {
          name: 'textField',
        },
      ],
    });

    const expectedResult: ThingConfigObject = {
      booleanField: {
        name: 'booleanField',
        kind: 'booleanFields',
      },
      dateTimeField: {
        name: 'dateTimeField',
        kind: 'dateTimeFields',
      },
      duplexField: {
        name: 'duplexField',
        config: thingConfig,
        oppositeName: 'duplexField',
        kind: 'duplexFields',
      },
      embeddedField: {
        name: 'embeddedField',
        config: embeddedConfig,
        kind: 'embeddedFields',
      },
      enumField: {
        name: 'enumField',
        enumName: 'enumeration',
        kind: 'enumFields',
      },
      floatField: {
        name: 'floatField',
        kind: 'floatFields',
      },
      geospatialField: {
        name: 'geospatialField',
        geospatialType: 'Point',
        kind: 'geospatialFields',
      },
      intField: {
        name: 'intField',
        kind: 'intFields',
      },
      relationalField: {
        name: 'relationalField',
        config: thingConfig,
        kind: 'relationalFields',
      },
      textField: {
        name: 'textField',
        kind: 'textFields',
      },
    };

    const result = composeFieldsObject(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
