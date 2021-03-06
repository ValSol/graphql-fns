// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

import coerceDataFromGql from './coerceDataFromGql';

describe('coerceDataFromGql', () => {
  test('should coerce realational & duplex fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          array: true,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce realational & duplex fields in embedded fields', () => {
    const thingConfig: ThingConfig = {};
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    };
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [{ name: 'textField' }],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embeddedConfig,
        },
        {
          name: 'embedded2',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      textField: 'text field',
      embedded1: {
        relationalField: { id: '5cefb33f05d6be4b7b59842b' },
        duplexField: { id: '5cefb33f05d6be4b7b59842c' },
        __typename: 'Embedded',
      },
      embedded2: [
        {
          relationalField: { id: '5cefb33f05d6be4b7b59842e' },
          duplexField: { id: '5cefb33f05d6be4b7b59842f' },
          __typename: 'Embedded',
        },
        {
          relationalField: { id: '5cefb33f05d6be4b7b598421' },
          duplexField: { id: '5cefb33f05d6be4b7b598422' },
          __typename: 'Embedded',
        },
      ],
      __typename: 'Example',
    };

    const expectedResult = {
      textField: 'text field',
      embedded1: {
        relationalField: '5cefb33f05d6be4b7b59842b',
        duplexField: '5cefb33f05d6be4b7b59842c',
      },
      embedded2: [
        {
          relationalField: '5cefb33f05d6be4b7b59842e',
          duplexField: '5cefb33f05d6be4b7b59842f',
        },
        {
          relationalField: '5cefb33f05d6be4b7b598421',
          duplexField: '5cefb33f05d6be4b7b598422',
        },
      ],
    };

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce embedded null fields', () => {
    const thingConfig: ThingConfig = {};
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'embeddedTextField',
        },
      ],
    };
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [{ name: 'textField' }],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embeddedConfig,
        },
        {
          name: 'embedded2',
          config: embeddedConfig,
        },
        {
          name: 'embedded3',
          config: embeddedConfig,
          array: true,
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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce file fields', () => {
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
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      textField: 'text field',
      logo: {
        fileId: '5cefb33f05d6be4b7b59842b',
        address: '/images/logo',
        __typename: 'Image',
      },
      pictures: [
        {
          fileId: '5cefb33f05d6be4b7b59842b',
          address: '/images/pic1',
          __typename: 'Image',
        },
        {
          fileId: '5cefb33f05d6be4b7b59842b',
          address: '/images/pic2',
          __typename: 'Image',
        },
      ],
      __typename: 'Example',
    };

    const expectedResult = {
      textField: 'text field',
      logo: {
        fileId: '5cefb33f05d6be4b7b59842b',
        address: '/images/logo',
      },
      pictures: [
        {
          fileId: '5cefb33f05d6be4b7b59842b',
          address: '/images/pic1',
        },
        {
          fileId: '5cefb33f05d6be4b7b59842b',
          address: '/images/pic2',
        },
      ],
    };

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce file null fields', () => {
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
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      textField: null,
      logo: null,
      pictures: [],
      __typename: 'Example',
    };

    const expectedResult = {
      textField: '',
      logo: {
        fileId: '',
        address: '',
      },
      pictures: [],
    };

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce file null fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          array: true,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const data = {
      id: '5cefb33f05d6be4b7b59842a',
      relationalField: { id: null },
      relationalField2: [{ id: '5cefb33f05d6be4b7b598421' }, { id: null }],
      duplexField: { id: null },
      __typename: 'Example',
    };

    const expectedResult = {
      relationalField: '',
      relationalField2: ['5cefb33f05d6be4b7b598421', ''],
      duplexField: '',
    };

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce realational & duplex null fields 2', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          array: true,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce dateTime fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'dateTimeField',
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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce empty dateTime fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'dateTimeField',
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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce geospatial fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      geospatialFields: [
        {
          name: 'geospatialField1',
          geospatialType: 'Point',
        },
        {
          name: 'geospatialField2',
          geospatialType: 'Point',
        },
        {
          name: 'geospatialField3',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'geospatialField4',
          geospatialType: 'Polygon',
        },
        {
          name: 'geospatialField5',
          geospatialType: 'Polygon',
        },
        {
          name: 'geospatialField6',
          array: true,
          geospatialType: 'Polygon',
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

    const result = coerceDataFromGql(data, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce dateTime fields and save id, createdAt, updatedAt fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'dateTimeField',
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

    const result = coerceDataFromGql(data, thingConfig, true);
    expect(result).toEqual(expectedResult);
  });
});
