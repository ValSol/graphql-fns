/* eslint-env jest */
import type { FileEntityConfig, TangibleEntityConfig } from '../tsTypes';

import coerceDataToGqlServerSide from './coerceDataToGqlServerSide';

describe('coerceDataToGqlServerSide', () => {
  describe('should coerce realational & duplex & enum fields', () => {
    const entityConfig = {} as TangibleEntityConfig;
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
          name: 'relationalFields',
          oppositeName: 'parentRelationalFields',
          array: true,
          config: entityConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalFields',
          oppositeName: 'relationalFields',
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
          oppositeName: 'duplexFields',
          type: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          config: entityConfig,
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
          type: 'enumFields',
        },
      ],
    });
    const data = {
      relationalField: '5cefb33f05d6be4b7b59842b',
      relationalFields: ['5cefb33f05d6be4b7b59842a', '5cefb33f05d6be4b7b59842b'],
      duplexField: '5cefb33f05d6be4b7b59842c',
      duplexFields: ['5cefb33f05d6be4b7b59842d', '5cefb33f05d6be4b7b59842e'],
      enumField: '',
    };

    test('empty prev data', () => {
      const prevData = { enumField: '' };

      const expectedResult = {
        relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
        relationalFields: { connect: ['5cefb33f05d6be4b7b59842a', '5cefb33f05d6be4b7b59842b'] },
        duplexField: { connect: '5cefb33f05d6be4b7b59842c' },
        duplexFields: { connect: ['5cefb33f05d6be4b7b59842d', '5cefb33f05d6be4b7b59842e'] },
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        relationalField: '5cefb33f05d6be4b7b59842b',
        relationalFields: ['5cefb33f05d6be4b7b59842a', '5cefb33f05d6be4b7b59842b'],
        duplexField: '5cefb33f05d6be4b7b59842c',
        duplexFields: ['5cefb33f05d6be4b7b59842d', '5cefb33f05d6be4b7b59842e'],
        enumField: '',
      };

      const expectedResult: Record<string, any> = {};

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('removed prev data', () => {
      const data2 = {
        relationalField: '',
        relationalFields: [],
        duplexField: '',
        duplexFields: [],
        enumField: '',
      };

      const prevData = {
        relationalField: '5cefb33f05d6be4b7b59842b',
        relationalFields: ['5cefb33f05d6be4b7b59842a'],
        duplexField: '5cefb33f05d6be4b7b59842c',
        duplexFields: ['5cefb33f05d6be4b7b59842d'],
        enumField: 'Enum1',
      };

      const expectedResult = {
        relationalField: { connect: null },
        relationalFields: { connect: [] },
        duplexField: { connect: null },
        duplexFields: { connect: [] },
        enumField: null,
      };

      const result = coerceDataToGqlServerSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce duplex fields to create new connected entities', () => {
    const entityConfig = {} as TangibleEntityConfig;

    const dupleConfig11: TangibleEntityConfig = {
      name: 'Duple11',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField11', type: 'textFields' }],
      duplexFields: [
        {
          name: 'oppositeDuplexField11',
          config: entityConfig,
          oppositeName: 'duplexField11',
          type: 'duplexFields',
        },
      ],
    };

    const dupleConfig12: TangibleEntityConfig = {
      name: 'Duple12',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField12', type: 'textFields' }],
      duplexFields: [
        {
          name: 'oppositeDuplexField12',
          config: entityConfig,
          oppositeName: 'duplexFields12',
          type: 'duplexFields',
        },
      ],
    };

    const dupleConfig21: TangibleEntityConfig = {
      name: 'Duple21',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField21', type: 'textFields' }],
      duplexFields: [
        {
          name: 'oppositeDuplexFields21',
          config: entityConfig,
          oppositeName: 'duplexField21',
          array: true,
          type: 'duplexFields',
        },
      ],
    };

    const dupleConfig22: TangibleEntityConfig = {
      name: 'Duple22',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField22', type: 'textFields' }],
      duplexFields: [
        {
          name: 'oppositeDuplexFields22',
          config: entityConfig,
          oppositeName: 'duplexFields22',
          array: true,
          type: 'duplexFields',
        },
      ],
    };

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField11',
          config: dupleConfig11,
          oppositeName: 'oppositeDuplexField11',
          type: 'duplexFields',
        },
        {
          name: 'duplexFields12',
          config: dupleConfig12,
          oppositeName: 'oppositeDuplexField12',
          array: true,
          type: 'duplexFields',
        },
        {
          name: 'duplexField21',
          config: dupleConfig21,
          oppositeName: 'oppositeDuplexFields21',
          type: 'duplexFields',
        },
        {
          name: 'duplexFields22',
          config: dupleConfig22,
          oppositeName: 'oppositeDuplexFields22',
          array: true,
          type: 'duplexFields',
        },
      ],
    });
    const data = {
      duplexField11: { duplexTextField11: 'duplexTextField11 TEXT' },
      duplexFields12: [{ duplexTextField12: 'duplexTextField12 TEXT' }, '5cefb33f05d6be4b7b59842a'],
      duplexField21: { duplexTextField21: 'duplexTextField21 TEXT' },
      duplexFields22: [{ duplexTextField22: 'duplexTextField22 TEXT' }, '5cefb33f05d6be4b7b59842b'],
    };

    test('null prev data', () => {
      const prevData = null;

      const expectedResult = {
        duplexField11: { create: { duplexTextField11: 'duplexTextField11 TEXT' } },
        duplexFields12: {
          create: [{ duplexTextField12: 'duplexTextField12 TEXT' }],
          connect: ['5cefb33f05d6be4b7b59842a'],
        },
        duplexField21: { create: { duplexTextField21: 'duplexTextField21 TEXT' } },
        duplexFields22: {
          create: [{ duplexTextField22: 'duplexTextField22 TEXT' }],
          connect: ['5cefb33f05d6be4b7b59842b'],
        },
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce relational fields to create new connected entities', () => {
    const entityConfig = {} as TangibleEntityConfig;

    const relationalConfig1: TangibleEntityConfig = {
      name: 'Relational1',
      type: 'tangible',
      textFields: [{ name: 'relationalTextField1', type: 'textFields' }],
    };

    const relationalConfig2: TangibleEntityConfig = {
      name: 'Relational2',
      type: 'tangible',
      textFields: [{ name: 'relationalTextField2', type: 'textFields' }],
    };

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField1',
          oppositeName: 'parentRelationalField1',
          config: relationalConfig1,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalField1',
          oppositeName: 'relationalField1',
          config: relationalConfig1,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'relationalField2',
          oppositeName: 'parentRelationalField2',
          config: relationalConfig2,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalField2',
          oppositeName: 'relationalField2',
          config: relationalConfig2,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });
    const data = {
      relationalField1: { relationalTextField1: 'relationalTextField1 TEXT' },
      relationalField2: [
        { relationalTextField2: 'relationalTextField2 TEXT' },
        '5cefb33f05d6be4b7b59842a',
      ],
    };

    test('null prev data', () => {
      const prevData = null;

      const expectedResult = {
        relationalField1: { create: { relationalTextField1: 'relationalTextField1 TEXT' } },
        relationalField2: {
          create: [{ relationalTextField2: 'relationalTextField2 TEXT' }],
          connect: ['5cefb33f05d6be4b7b59842a'],
        },
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce file fields', () => {
    const imageConfig: FileEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'address',
          type: 'textFields',
        },
      ],
    };

    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          type: 'fileFields',
        },
      ],
    });

    test('filled in data & prevData = null', () => {
      const data = {
        textField: 'text field',
        logo: {
          fileId: '1234567890',
          address: '/images/logo',
        },
        pictures: [
          {
            fileId: '1234567891',
            address: '/images/pic1',
          },
          {
            fileId: '1234567892',
            address: '/images/pic1',
          },
        ],
      };

      const prevData = null;

      const expectedResult = {
        textField: 'text field',
        logo: {
          fileId: '1234567890',
          address: '/images/logo',
        },
        pictures: [
          {
            fileId: '1234567891',
            address: '/images/pic1',
          },
          {
            fileId: '1234567892',
            address: '/images/pic1',
          },
        ],
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('empty data & prevData = null', () => {
      const data = {
        textField: '',
        logo: {
          fileId: '',
          address: '',
        },
        pictures: [],
      };

      const prevData = null;

      const expectedResult = {
        textField: '',
        logo: {
          fileId: '',
          address: '',
        },
        pictures: [],
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('filled in data & prevData with same array and scalar file field', () => {
      const data = {
        textField: 'text field',
        logo: {
          fileId: '1234567890',
          address: '/images/logo',
        },
        pictures: [
          {
            fileId: '1234567891',
            address: '/images/pic1',
          },
          {
            fileId: '1234567892',
            address: '/images/pic1',
          },
        ],
      };

      const prevData = {
        textField: 'text field prev',
        logo: {
          fileId: '1234567890',
          address: '/images/logo',
        },
        pictures: [
          {
            fileId: '1234567891',
            address: '/images/pic1',
          },
          {
            fileId: '1234567892',
            address: '/images/pic1',
          },
        ],
      };

      const expectedResult = {
        textField: 'text field',
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce geospatial fields', () => {
    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'geospatialFieldPoint',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'geospatialFieldPolygon',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    });
    const data = {
      geospatialFieldPoint: {
        lng: 50.426982,
        lat: 30.615328,
      },
      geospatialFieldPolygon: {
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
    };

    test('prev data null', () => {
      const prevData = null;

      const data2 = {
        geospatialFieldPoint: {
          __typename: 'GeospatialPoint',
          lng: 50.426982,
          lat: 30.615328,
        },
        geospatialFieldPolygon: {
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
      };

      const expectedResult = {
        geospatialFieldPoint: {
          lng: 50.426982,
          lat: 30.615328,
        },
        geospatialFieldPolygon: {
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
      };

      const result = coerceDataToGqlServerSide(
        data2,
        prevData,
        entityConfig,
        false, // allFields,
        true, // skipUnusedFields
      );
      expect(result).toEqual(expectedResult);
    });

    test('prev data null', () => {
      const prevData = null;

      const expectedResult = {
        geospatialFieldPoint: {
          lng: 50.426982,
          lat: 30.615328,
        },
        geospatialFieldPolygon: {
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
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        geospatialFieldPoint: {
          lng: 50.426982,
          lat: 30.615328,
        },
        geospatialFieldPolygon: {
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
      };

      const expectedResult: Record<string, any> = {};

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('removed prev data', () => {
      const data2 = {
        geospatialFieldPoint: {
          lng: '',
          lat: '',
        },
        // not correct filled polygon
        geospatialFieldPolygon: {
          externalRing: {
            ring: [
              { lng: 0, lat: 0 },
              { lng: 3, lat: 6 },
              { lng: 6, lat: 1 },
            ],
          },
          internalRings: [
            {
              ring: [
                { lng: 2, lat: 2 },
                { lng: 3, lat: 3 },
                { lng: 4, lat: 2 },
              ],
            },
          ],
        },
      };

      const prevData = {
        geospatialFieldPoint: {
          lng: 50.426982,
          lat: 30.615328,
        },
        geospatialFieldPolygon: {
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
      };

      const expectedResult = {
        geospatialFieldPoint: null,
        geospatialFieldPolygon: null,
      };

      const result = coerceDataToGqlServerSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce geospatial fields', () => {
    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
      ],
    });
    const prevData = {
      geospatialField: {
        lng: 50.426982,
        lat: 30.615328,
      },
    };

    test('prev data with empty lng', () => {
      const data = {
        geospatialField: {
          lng: '',
          lat: 30.615328,
        },
      };
      const expectedResult = {
        geospatialField: null,
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('prev data with empty lng', () => {
      const data = {
        geospatialField: {
          lng: 50.426982,
          lat: '',
        },
      };
      const expectedResult = {
        geospatialField: null,
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce dateTime fields', () => {
    const entityConfig = {} as TangibleEntityConfig;
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
      dateTimeField: '2019-06-01T01:00',
    };

    test('prev data null', () => {
      const prevData = null;

      const expectedResult = {
        dateTimeField: '2019-06-01T01:00',
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        dateTimeField: '2019-06-01T01:00',
      };

      const expectedResult: Record<string, any> = {};

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('removed prev data', () => {
      const data2 = {
        dateTimeField: '',
      };

      const prevData = {
        dateTimeField: '2019-06-01T01:00',
      };

      const expectedResult = {
        dateTimeField: null,
      };

      const result = coerceDataToGqlServerSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce int & float fields', () => {
    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField',
          type: 'intFields',
        },
        {
          name: 'intFields',
          array: true,
          type: 'intFields',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
          type: 'floatFields',
        },
        {
          name: 'floatFields',
          array: true,
          type: 'floatFields',
        },
      ],
    });
    const data = {
      intField: 1,
      intFields: [2],
      floatField: 0.3,
      floatFields: [0.4],
    };

    test('empty prev data', () => {
      const prevData: Record<string, any> = {};

      const expectedResult = {
        intField: 1,
        intFields: [2],
        floatField: 0.3,
        floatFields: [0.4],
      };

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        intField: 1,
        intFields: [2],
        floatField: 0.3,
        floatFields: [0.4],
      };

      const expectedResult: Record<string, any> = {};

      const result = coerceDataToGqlServerSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('removed prev data', () => {
      const data2 = {
        intField: '',
        intFields: [''],
        floatField: '',
        floatFields: [''],
      };

      const prevData = {
        intField: 1,
        intFields: [2],
        floatField: 0.3,
        floatFields: [0.4],
      };

      const expectedResult = {
        intField: null,
        intFields: [],
        floatField: null,
        floatFields: [],
      };

      const result = coerceDataToGqlServerSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('data have 0s', () => {
      const data2 = {
        intField: 0,
        intFields: [0],
        floatField: 0,
        floatFields: [0],
      };

      const prevData = {
        intField: 1,
        intFields: [2],
        floatField: 0.3,
        floatFields: [0.4],
      };

      const expectedResult = {
        intField: 0,
        intFields: [0],
        floatField: 0,
        floatFields: [0],
      };

      const result = coerceDataToGqlServerSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });
});
