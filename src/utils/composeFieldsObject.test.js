// @flow
/* eslint-env jest */
import type { ThingConfig, ThingConfigObject } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';

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
      fileFields: [
        {
          name: 'fileField',
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
      fileFields: [
        {
          name: 'fileField',
        },
      ],
    });

    const expectedResult: ThingConfigObject = {
      booleanField: {
        kind: 'booleanFields',
        attributes: {
          name: 'booleanField',
        },
      },
      dateTimeField: {
        kind: 'dateTimeFields',
        attributes: {
          name: 'dateTimeField',
        },
      },
      duplexField: {
        kind: 'duplexFields',
        attributes: {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      },
      embeddedField: {
        kind: 'embeddedFields',
        attributes: {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      },
      enumField: {
        kind: 'enumFields',
        attributes: {
          name: 'enumField',
          enumName: 'enumeration',
        },
      },
      floatField: {
        kind: 'floatFields',
        attributes: {
          name: 'floatField',
        },
      },
      geospatialField: {
        kind: 'geospatialFields',
        attributes: {
          name: 'geospatialField',
          geospatialType: 'Point',
        },
      },
      intField: {
        kind: 'intFields',
        attributes: {
          name: 'intField',
        },
      },
      relationalField: {
        kind: 'relationalFields',
        attributes: {
          name: 'relationalField',
          config: thingConfig,
        },
      },
      textField: {
        kind: 'textFields',
        attributes: {
          name: 'textField',
        },
      },
      fileField: {
        kind: 'fileFields',
        attributes: {
          name: 'fileField',
        },
      },
    };

    const result = composeFieldsObject(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
