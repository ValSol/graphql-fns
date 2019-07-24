// @flow
/* eslint-env jest */
import type { ThingConfig, ListColumn } from '../../../flowTypes';

import arrangeListColumns from './arrangeListColumns';

describe('arrangeListColumns', () => {
  test('should arrange fields', () => {
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

    const expectedResult: Array<ListColumn> = [
      // textFields
      { name: 'textField', width: 200 },
      { name: 'textField2', width: 200 },
      // booleanFields
      { name: 'booleanField', width: 200 },
      { name: 'booleanField2', width: 200 },
      // enumFields
      { name: 'enumField', width: 200 },
      { name: 'enumField2', width: 200 },
      // dateTimeFields
      { name: 'dateTimeField', width: 144 },
      { name: 'dateTimeField2', width: 144 },
      // intFields
      { name: 'intField', width: 200 },
      { name: 'intField2', width: 200 },
      // floatFields
      { name: 'floatField', width: 200 },
      { name: 'floatField2', width: 200 },
      // geospatialFields
      { name: 'geospatialPoint', width: 200 },
      { name: 'geospatialPolygon', width: 200 },
      // duplexFields
      { name: 'parent', width: 200 },
      { name: 'children', width: 200 },
      // relationalFields
      { name: 'siblings', width: 200 },
      // default fields
      { name: 'createdAt', width: 144 },
      { name: 'updatedAt', width: 144 },
    ];

    const result = arrangeListColumns(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
