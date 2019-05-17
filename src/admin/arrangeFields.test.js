// @flow
/* eslint-env jest */
import type { ThingConfig, FormField } from '../flowTypes';

const arrangeFields = require('./arrangeFields');

describe('arrangeFields', () => {
  const embedded3Config: ThingConfig = {
    name: 'Embedded3',
    embedded: true,
    textFields: [
      {
        name: 'textField3',
      },
    ],
  };

  const embedded2Config: ThingConfig = {
    name: 'Embedded2',
    embedded: true,
    textFields: [
      {
        name: 'textField2',
      },
    ],
    embeddedFields: [
      {
        name: 'embeddedField3',
        config: embedded3Config,
      },
    ],
  };

  const embedded1Config: ThingConfig = {
    name: 'Embedded1',
    embedded: true,
    textFields: [
      {
        name: 'textField1',
      },
    ],
    embeddedFields: [
      {
        name: 'embeddedField2',
        config: embedded2Config,
      },
    ],
  };

  const thingConfig: ThingConfig = {};
  Object.assign(thingConfig, {
    name: 'Example',
    // ---
    textFields: [
      {
        name: 'textField',
      },
    ],
    // ---
    dateTimeFields: [
      {
        name: 'dateTimeField',
      },
    ],
    // ---
    intFields: [
      {
        name: 'intField',
      },
    ],
    // ---
    floatFields: [
      {
        name: 'floatField',
      },
    ],
    // ---
    booleanFields: [
      {
        name: 'booleanField',
      },
    ],
    // ---
    enumFields: [
      {
        name: 'enumField',
        enumName: 'enumeration',
      },
    ],
    // ---
    geospatialFields: [
      {
        name: 'geospatialPoint',
        geospatialType: 'Point',
      },
      {
        name: 'geospatialPolygon',
        geospatialType: 'Polygon',
      },
    ],
    embeddedFields: [
      {
        name: 'embeddedField1',
        config: embedded1Config,
      },
      {
        name: 'embeddedField2',
        config: embedded2Config,
      },
      {
        name: 'embeddedField3',
        config: embedded3Config,
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: thingConfig,
        oppositeName: 'children',
      },
      {
        name: 'children',
        array: true,
        config: thingConfig,
        oppositeName: 'parent',
      },
    ],
    relationalFields: [
      {
        name: 'siblings',
        array: true,
        config: thingConfig,
      },
    ],
  });

  test('should arrange fields', () => {
    const expectedResult: Array<FormField> = [
      // default fields
      { name: 'id', formFieldType: 'hidden' },
      { name: 'createdAt', formFieldType: 'disabled' },
      { name: 'updatedAt', formFieldType: 'disabled' },
      // booleanFields
      { name: 'booleanField' },
      // dateTimeFields
      { name: 'dateTimeField' },
      // textFields
      { name: 'textField' },
      // intFields
      { name: 'intField' },
      // floatFields
      { name: 'floatField' },
      // geospatialFields
      { name: 'geospatialPoint' },
      { name: 'geospatialPolygon' },
      // embeddedFields
      { name: 'embeddedField1' },
      { name: 'embeddedField2' },
      { name: 'embeddedField3' },
      // duplexFields
      { name: 'parent' },
      { name: 'children' },
      // relationalFields
      { name: 'siblings' },
    ];

    const result = arrangeFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
