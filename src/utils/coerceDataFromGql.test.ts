/* eslint-env jest */
import type { EntityConfig } from '../tsTypes';

import coerceDataFromGql from './coerceDataFromGql';

describe('coerceDataFromGql', () => {
  describe('should coerce realational & duplex fields', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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
          name: 'relationalField2',
          oppositeName: 'parentRelationalField2',
          config: entityConfig,
          type: 'relationalFields',
          array: true,
        },
        {
          name: 'parentRelationalField2',
          oppositeName: 'relationalField2',
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
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
    });

    test('with defined fields', () => {
      const data = {
        id: '5cefb33f05d6be4b7b59842a',
        relationalField: { id: '5cefb33f05d6be4b7b59842b' },
        relationalField2: [{ id: '5cefb33f05d6be4b7b598421' }, { id: '5cefb33f05d6be4b7b598422' }],
        duplexField: { id: '5cefb33f05d6be4b7b59842c' },
        __typename: 'Example',
      };

      const expectedResult = {
        relationalField: '5cefb33f05d6be4b7b59842b',
        relationalField2: ['5cefb33f05d6be4b7b598421', '5cefb33f05d6be4b7b598422'],
        duplexField: '5cefb33f05d6be4b7b59842c',
      };

      const result = coerceDataFromGql(data, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('with undefined fields', () => {
      const data = {
        id: '5cefb33f05d6be4b7b59842a',
        relationalField: null,
        relationalField2: [{ id: '5cefb33f05d6be4b7b598421' }, { id: '5cefb33f05d6be4b7b598422' }],
        duplexField: null,
        __typename: 'Example',
      };

      const expectedResult = {
        relationalField: '',
        relationalField2: ['5cefb33f05d6be4b7b598421', '5cefb33f05d6be4b7b598422'],
        duplexField: '',
      };

      const result = coerceDataFromGql(data, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  test('should coerce embedded null fields', () => {
    const entityConfig = {} as EntityConfig;
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
    Object.assign(entityConfig, {
      name: 'Example',
      textFields: [{ name: 'textField', type: 'textFields' }],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embeddedConfig,
          type: 'embeddedFields',
          variants: ['plain'],
        },
        {
          name: 'embedded2',
          config: embeddedConfig,
          type: 'embeddedFields',
          variants: ['plain'],
        },
        {
          name: 'embedded3',
          config: embeddedConfig,
          array: true,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      textField: null,
      embedded1: null,
      embedded2: {
        embeddedTextField: null,
        __typename: 'Embedded',
      },
      embedded3: [
        {
          embeddedTextField: null,
          __typename: 'Embedded',
        },
      ],
      __typename: 'Example',
    };

    const expectedResult = {
      textField: '',
      embedded1: {
        embeddedTextField: '',
      },
      embedded2: {
        embeddedTextField: '',
      },

      embedded3: [
        {
          embeddedTextField: '',
        },
      ],
    };

    const result = coerceDataFromGql(data, entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce realational & duplex null fields 2', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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
          name: 'relationalField2',
          oppositeName: 'parentRelationalField2',
          config: entityConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalField2',
          oppositeName: 'relationalField2',
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
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      relationalField: null,
      relationalField2: [{ id: '5cefb33f05d6be4b7b598421' }, null],
      duplexField: null,
      __typename: 'Example',
    };

    const expectedResult = {
      relationalField: '',
      relationalField2: ['5cefb33f05d6be4b7b598421', ''],
      duplexField: '',
    };

    const result = coerceDataFromGql(data, entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce dateTime fields', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'dateTimeField',
          type: 'dateTimeFields',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      dateTimeField: '2019-06-09T22:00:00.000Z',
      __typename: 'Example',
    };

    const expectedResult = {
      dateTimeField: '2019-06-09T22:00:00.000Z',
    };

    const result = coerceDataFromGql(data, entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce empty dateTime fields', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'dateTimeField',
          type: 'dateTimeFields',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      dateTimeField: null,
      __typename: 'Example',
    };

    const expectedResult = {
      dateTimeField: null,
    };

    const result = coerceDataFromGql(data, entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce geospatial fields', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'geospatialField1',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialField2',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialField3',
          array: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialField4',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialField5',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialField6',
          array: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      geospatialField1: {
        lng: 50.426982,
        lat: 30.615328,
        __typename: 'GeospatialPoint',
      },
      geospatialField2: null,
      geospatialField3: [
        {
          lng: 50.426983,
          lat: 30.615329,
          __typename: 'GeospatialPoint',
        },
        null,
      ],
      geospatialField4: {
        externalRing: {
          ring: [
            { lng: 0, lat: 0 },
            { lng: 3, lat: 6 },
            { lng: 6, lat: 1 },
            { lng: 0, lat: 0 },
          ],
        },
        internalRings: [
          {
            ring: [
              { lng: 2, lat: 2 },
              { lng: 3, lat: 3 },
              { lng: 4, lat: 2 },
              { lng: 2, lat: 2 },
            ],
          },
        ],
      },
      geospatialField5: null,

      __typename: 'Example',
    };

    const expectedResult = {
      geospatialField1: {
        lng: 50.426982,
        lat: 30.615328,
      },
      geospatialField2: {
        lng: '',
        lat: '',
      },
      geospatialField3: [
        {
          lng: 50.426983,
          lat: 30.615329,
        },
        {
          lng: '',
          lat: '',
        },
      ],
      geospatialField4: {
        externalRing: {
          ring: [
            { lng: 0, lat: 0 },
            { lng: 3, lat: 6 },
            { lng: 6, lat: 1 },
            { lng: 0, lat: 0 },
          ],
        },
        internalRings: [
          {
            ring: [
              { lng: 2, lat: 2 },
              { lng: 3, lat: 3 },
              { lng: 4, lat: 2 },
              { lng: 2, lat: 2 },
            ],
          },
        ],
      },
      geospatialField5: {
        externalRing: {
          ring: [],
        },
        internalRings: [],
      },
    };

    const result = coerceDataFromGql(data, entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce dateTime fields and save id, createdAt, updatedAt fields', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'dateTimeField',
          type: 'dateTimeFields',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      createdAt: '2019-06-07T22:00:00.000Z',
      updatedAt: '2019-06-08T22:00:00.000Z',
      dateTimeField: '2019-06-09T22:00:00.000Z',
      __typename: 'Example',
    };

    const expectedResult = {
      id: '5cefb33f05d6be4b7b59842a',
      createdAt: '2019-06-07T22:00:00.000Z',
      updatedAt: '2019-06-08T22:00:00.000Z',
      dateTimeField: '2019-06-09T22:00:00.000Z',
    };

    const result = coerceDataFromGql(data, entityConfig, true);
    expect(result).toEqual(expectedResult);
  });
});
