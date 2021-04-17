// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

import fromMongoToGqlDataArg from './index';

describe('fromMongoToGqlDataArg', () => {
  test('shoud process data', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'embeddedTextField',
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
      ],
      embeddedFields: [
        {
          name: 'embedded',
          config: embeddedConfig,
        },
        {
          name: 'embeddedArray',
          config: embeddedConfig,
          array: true,
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
        {
          name: 'relationalArrayField',
          config: thingConfig,
          array: true,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexArrayField',
        },
        {
          name: 'duplexArrayField',
          config: thingConfig,
          oppositeName: 'duplexField',
          array: true,
        },
      ],
      geospatialFields: [
        {
          name: 'pointField',
          geospatialType: 'Point',
        },
        {
          name: 'pointArrayFields',
          geospatialType: 'Point',
          array: true,
        },
        {
          name: 'polygonField',
          geospatialType: 'Polygon',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b598420',
      textField: 'textField text',
      embedded: {
        id: '5cefb33f05d6be4b7b598424',
        embeddedTextField: 'embeddedTextField text',
      },
      embeddedArray: [
        {
          id: '5cefb33f05d6be4b7b598425',
          embeddedTextField: 'embeddedArrayTextField text',
        },
      ],
      relationalField: '5cefb33f05d6be4b7b598421',
      relationalArrayField: ['5cefb33f05d6be4b7b598422', '5cefb33f05d6be4b7b598423'],
      duplexField: '5cefb33f05d6be4b7b598426',
      duplexArrayField: ['5cefb33f05d6be4b7b598427', '5cefb33f05d6be4b7b598428'],
      pointField: { type: 'Point', coordinates: [40, 5] },
      pointArrayFields: [{ type: 'Point', coordinates: [41, 6] }],
      polygonField: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [3, 6],
            [6, 1],
            [0, 0],
          ],
        ],
      },
    };

    const result = fromMongoToGqlDataArg(data, thingConfig);
    const expectedResult = {
      textField: 'textField text',
      embedded: {
        embeddedTextField: 'embeddedTextField text',
      },
      embeddedArray: [
        {
          embeddedTextField: 'embeddedArrayTextField text',
        },
      ],
      relationalField: { connect: '5cefb33f05d6be4b7b598421' },
      relationalArrayField: { connect: ['5cefb33f05d6be4b7b598422', '5cefb33f05d6be4b7b598423'] },
      duplexField: { connect: '5cefb33f05d6be4b7b598426' },
      duplexArrayField: { connect: ['5cefb33f05d6be4b7b598427', '5cefb33f05d6be4b7b598428'] },
      pointField: { lng: 40, lat: 5 },
      pointArrayFields: [{ lng: 41, lat: 6 }],
      polygonField: {
        externalRing: {
          ring: [
            { lng: 0, lat: 0 },
            { lng: 3, lat: 6 },
            { lng: 6, lat: 1 },
            { lng: 0, lat: 0 },
          ],
        },
      },
    };
    expect(result).toEqual(expectedResult);
  });
});
