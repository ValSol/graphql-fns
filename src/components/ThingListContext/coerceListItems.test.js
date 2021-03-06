// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import coerceListItems from './coerceListItems';

describe('coerceListItems', () => {
  test('should coerce text fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
        {
          name: 'textFieldArray',
          array: true,
        },
      ],
    };

    const items = [
      {
        id: '123',
        createdAt: '2018-12-10T22:00:00.000Z',
        updatedAt: '2018-12-10T22:00:00.000Z',
        textField: 'text Field',
        textFieldArray: ['text Field-1, text Field-2'],
        __typename: 'Example',
      },
      {
        id: '456',
        createdAt: '2019-02-10T22:00:00.000Z',
        updatedAt: '2019-02-10T22:00:00.000Z',
        textField: undefined,
        textFieldArray: [],
        __typename: 'Example',
      },
    ];

    const expectedResult = [
      {
        id: '123',
        createdAt: '2018-12-10 22:00',
        updatedAt: '2018-12-10 22:00',
        textField: 'text Field',
        textFieldArray: 'text Field-1, text Field-2',
      },
      {
        id: '456',
        createdAt: '2019-02-10 22:00',
        updatedAt: '2019-02-10 22:00',
        textField: '',
        textFieldArray: '',
      },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce boolean fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField',
        },
        {
          name: 'booleanFieldArray',
          array: true,
        },
      ],
    };

    const items = [
      {
        booleanField: true,
        booleanFieldArray: [true, false],
      },
      {
        booleanField: undefined,
        booleanFieldArray: [],
      },
    ];

    const expectedResult = [
      { booleanField: 'true', booleanFieldArray: 'true, false' },
      { booleanField: '', booleanFieldArray: '' },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce integer fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
        {
          name: 'intFieldArray',
          array: true,
        },
      ],
    };

    const items = [
      {
        intField: 33,
        intFieldArray: [2, 1],
      },
      {
        intField: undefined,
        intFieldArray: [],
      },
    ];

    const expectedResult = [
      { intField: 33, intFieldArray: '2, 1' },
      { intField: '', intFieldArray: '' },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce float fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      floatFields: [
        {
          name: 'floatField',
        },
        {
          name: 'floatFieldArray',
          array: true,
        },
      ],
    };

    const items = [
      {
        floatField: 0.33,
        floatFieldArray: [0.2, 0.1],
      },
      {
        floatField: undefined,
        floatFieldArray: [],
      },
    ];

    const expectedResult = [
      { floatField: 0.33, floatFieldArray: '0.2, 0.1' },
      { floatField: '', floatFieldArray: '' },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce enum fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'weekDays',
        },
        {
          name: 'enumFieldArray',
          array: true,
          enumName: 'weekDays',
        },
      ],
    };

    const items = [
      {
        enumField: 'tuesday',
        enumFieldArray: ['sunday', 'monday'],
      },
      {
        enumField: undefined,
        enumFieldArray: [],
      },
    ];

    const expectedResult = [
      { enumField: 'tuesday', enumFieldArray: 'sunday, monday' },
      { enumField: '', enumFieldArray: '' },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce float fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'dateTimeField',
        },
        {
          name: 'dateTimeFieldArray',
          array: true,
        },
      ],
    };

    const items = [
      {
        dateTimeField: '1980-12-10T22:00:00.000Z',
        dateTimeFieldArray: ['1980-12-10T22:00:00.000Z', '1982-12-10T22:00:00.000Z'],
      },
      {
        dateTimeField: undefined,
        dateTimeFieldArray: [],
      },
    ];

    const expectedResult = [
      {
        dateTimeField: '1980-12-10 22:00',
        dateTimeFieldArray: '1980-12-10 22:00, 1982-12-10 22:00',
      },
      { dateTimeField: '', dateTimeFieldArray: '' },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'geospatialPoint',
          geospatialType: 'Point',
        },
        {
          name: 'geospatialPointArray',
          geospatialType: 'Point',
          array: true,
        },
        {
          name: 'geospatialPolygon',
          geospatialType: 'Polygon',
        },
        {
          name: 'geospatialPolygonArray',
          geospatialType: 'Polygon',
          array: true,
        },
      ],
    };

    const items = [
      {
        geospatialPoint: { lng: 40, lat: 5 },
        geospatialPointArray: [
          { lng: 40, lat: 5 },
          { lng: 41, lat: 6 },
        ],
        geospatialPolygon: {
          externalRing: {
            ring: [
              { lng: 0, lat: 0 },
              { lng: 3, lat: 6 },
              { lng: 6, lat: 1 },
              { lng: 0, lat: 0 },
            ],
          },
        },
        geospatialPolygonArray: [
          {
            externalRing: {
              ring: [
                { lng: 0, lat: 0 },
                { lng: 3, lat: 6 },
                { lng: 6, lat: 1 },
                { lng: 0, lat: 0 },
              ],
            },
          },
          {
            externalRing: {
              ring: [
                { lng: 0, lat: 0 },
                { lng: 3, lat: 6 },
                { lng: 6, lat: 1 },
                { lng: 0, lat: 0 },
              ],
            },
          },
        ],
      },
      {
        geospatialPoint: undefined,
        geospatialPointArray: [],
        geospatialPolygon: undefined,
        geospatialPolygonArray: [],
      },
    ];

    const expectedResult = [
      {
        geospatialPoint: '(5, 40)',
        geospatialPointArray: '(5, 40), (6, 41)',
        geospatialPolygon: 'polygon',
        geospatialPolygonArray: 'polygon, polygon',
      },
      {
        geospatialPoint: '',
        geospatialPointArray: '',
        geospatialPolygon: '',
        geospatialPolygonArray: '',
      },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce duplex and relatioanal fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
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
          name: 'sibling',
          config: thingConfig,
        },
        {
          name: 'siblings',
          array: true,
          config: thingConfig,
        },
      ],
    });

    const items = [
      {
        children: [{ id: '000001' }, { id: '000002' }],
        parent: { id: '12345' },
        sibling: { id: '54321' },
        siblings: [{ id: '000011' }, { id: '000012' }],
      },
      {
        children: [],
        parent: undefined,
        sibling: undefined,
        siblings: [],
      },
    ];

    const expectedResult = [
      { children: '000001, 000002', parent: '12345', sibling: '54321', siblings: '000011, 000012' },
      { children: '', parent: '', sibling: '', siblings: '' },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce embedded fields', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
        {
          name: 'embeddedFieldArray',
          array: true,
          config: embeddedConfig,
        },
      ],
    };

    const items = [
      {
        embeddedField: { textField: 'text Field' },
        embeddedFieldArray: [{ textField: 'text Field-1' }, { textField: 'text Field-2' }],
      },
      {
        embeddedField: undefined,
        embeddedFieldArray: [],
      },
    ];

    const expectedResult = [
      {
        embeddedField: 'embedded',
        embeddedFieldArray: 'embedded, embedded',
      },
      {
        embeddedField: '',
        embeddedFieldArray: '',
      },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should coerce file fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
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
    };

    const items = [
      {
        logo: { fileId: '000', address: '/images/logo' },
        pictures: [
          { fileId: '111', address: '/images/pic1' },
          { fileId: '222', address: '/images/pic2' },
        ],
      },
      {
        logo: undefined,
        pictures: [],
      },
    ];

    const expectedResult = [
      {
        logo: 'file',
        pictures: 'file, file',
      },
      {
        logo: '',
        pictures: '',
      },
    ];

    const result = coerceListItems(items, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
