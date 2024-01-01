/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import fromMongoToGqlDataArg from '.';

describe('fromMongoToGqlDataArg', () => {
  test('shoud process data', () => {
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'embeddedTextField',
          type: 'textFields',
        },
      ],
    };

    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded',
          config: embeddedConfig,
          type: 'embeddedFields',
          variants: ['plain'],
        },
        {
          name: 'embeddedArray',
          config: embeddedConfig,
          array: true,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          oppositeName: 'parentRelationalField',
          config: entityConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalField',
          oppositeName: 'relationalField',
          config: entityConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'relationalArrayField',
          oppositeName: 'parentRelationalArrayField',
          config: entityConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalArrayField',
          oppositeName: 'relationalArrayField',
          config: entityConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: entityConfig,
          oppositeName: 'duplexArrayField',
          type: 'duplexFields',
        },
        {
          name: 'duplexArrayField',
          config: entityConfig,
          oppositeName: 'duplexField',
          array: true,
          type: 'duplexFields',
        },
      ],
      geospatialFields: [
        {
          name: 'pointField',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointArrayFields',
          geospatialType: 'Point',
          array: true,
          type: 'geospatialFields',
        },
        {
          name: 'polygonField',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
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

    const result = fromMongoToGqlDataArg(data, entityConfig);
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

  test('shoud process filter fields', () => {
    const example2Config = {} as TangibleEntityConfig;

    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      filterFields: [
        {
          name: 'filterFieldScalar',
          type: 'filterFields',
          config: example2Config,
          variants: ['plain'],
        },
        {
          name: 'filterFieldScalar2',
          type: 'filterFields',
          config: example2Config,
          variants: ['plain'],
        },
        {
          name: 'filterFieldArray',
          array: true,
          type: 'filterFields',
          config: example2Config,
          variants: ['plain'],
        },
        {
          name: 'filterFieldArray2',
          array: true,
          type: 'filterFields',
          config: example2Config,
          variants: ['plain'],
        },
      ],
    };

    Object.assign(example2Config, {
      name: 'Example2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
          unique: true,
        },
      ],
    });

    const data = {
      filterFieldScalar: null,
      filterFieldScalar2: '{"textField":"abc"}',
      filterFieldArray: null,
      filterFieldArray2: '{}',
    };

    const result = fromMongoToGqlDataArg(data, exampleConfig);

    const expectedResult = {
      filterFieldScalar: null,
      filterFieldScalar2: { textField: 'abc' },
      filterFieldArray: null,
      filterFieldArray2: {},
    };
    expect(result).toEqual(expectedResult);
  });
});
