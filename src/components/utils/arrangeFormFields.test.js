// @flow
/* eslint-env jest */
import type { ThingConfig, FormField } from '../../flowTypes';

import arrangeFormFields from './arrangeFormFields';

describe('arrangeFormFields', () => {
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

  const imageConfig: ThingConfig = {
    name: 'Image',
    file: true,
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };

  const thingConfig: ThingConfig = {};
  Object.assign(thingConfig, {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
      {
        name: 'textField2',
        default: 'textField default value',
      },
    ],

    dateTimeFields: [
      {
        name: 'dateTimeField',
      },
      {
        name: 'dateTimeField2',
        default: new Date('1991-08-24'),
      },
    ],

    intFields: [
      {
        name: 'intField',
      },
      {
        name: 'intField2',
        default: 10,
      },
    ],

    floatFields: [
      {
        name: 'floatField',
      },
      {
        name: 'floatField2',
        default: 0.5,
      },
    ],

    booleanFields: [
      {
        name: 'booleanField',
      },
      {
        name: 'booleanField2',
        default: false,
      },
    ],

    enumFields: [
      {
        name: 'enumField',
        enumName: 'enumeration',
      },
      {
        name: 'enumField2',
        enumName: 'enumeration',
        default: 'u1',
      },
    ],

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

    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
      },
      {
        name: 'pictures',
        array: true,
        config: imageConfig,
      },
    ],
  });

  test('should arrange fields', () => {
    const expectedResult: Array<FormField> = [
      // booleanFields
      { name: 'booleanField' },
      { name: 'booleanField2' },
      // enumFields
      { name: 'enumField' },
      { name: 'enumField2' },
      // dateTimeFields
      { name: 'dateTimeField' },
      { name: 'dateTimeField2' },
      // textFields
      { name: 'textField' },
      { name: 'textField2' },
      // intFields
      { name: 'intField' },
      { name: 'intField2' },
      // floatFields
      { name: 'floatField' },
      { name: 'floatField2' },
      // geospatialFields
      { name: 'geospatialPoint' },
      { name: 'geospatialPolygon' },
      // embeddedFields
      { name: 'embeddedField1' },
      { name: 'embeddedField2' },
      { name: 'embeddedField3' },
      // fileFields
      { name: 'logo' },
      { name: 'pictures' },
      // duplexFields
      { name: 'parent' },
      { name: 'children' },
      // relationalFields
      { name: 'siblings' },
    ];

    const result = arrangeFormFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
