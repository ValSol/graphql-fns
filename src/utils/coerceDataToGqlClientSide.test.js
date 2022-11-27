// @flow
/* eslint-env jest */

import type { EntityConfig } from '../flowTypes';

import coerceDataToGqlClientSide from './coerceDataToGqlClientSide';

describe('coerceDataToGqlClientSide', () => {
  describe('should coerce realational & duplex & enum fields', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField',
          config: entityConfig,
        },
        {
          name: 'relationalFields',
          array: true,
          config: entityConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: entityConfig,
          oppositeName: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          config: entityConfig,
          oppositeName: 'duplexField',
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const expectedResult = {};

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce duplex fields to create new connected entities', () => {
    const entityConfig: EntityConfig = {};

    const dupleConfig11: EntityConfig = {
      name: 'Duple11',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField11' }],
      duplexFields: [
        {
          name: 'oppositeDuplexField11',
          config: entityConfig,
          oppositeName: 'duplexField11',
        },
      ],
    };

    const dupleConfig12: EntityConfig = {
      name: 'Duple12',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField12' }],
      duplexFields: [
        {
          name: 'oppositeDuplexField12',
          config: entityConfig,
          oppositeName: 'duplexFields12',
        },
      ],
    };

    const dupleConfig21: EntityConfig = {
      name: 'Duple21',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField21' }],
      duplexFields: [
        {
          name: 'oppositeDuplexFields21',
          config: entityConfig,
          oppositeName: 'duplexField21',
          array: true,
        },
      ],
    };

    const dupleConfig22: EntityConfig = {
      name: 'Duple22',
      type: 'tangible',
      textFields: [{ name: 'duplexTextField22' }],
      duplexFields: [
        {
          name: 'oppositeDuplexFields22',
          config: entityConfig,
          oppositeName: 'duplexFields22',
          array: true,
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
        },
        {
          name: 'duplexFields12',
          config: dupleConfig12,
          oppositeName: 'oppositeDuplexField12',
          array: true,
        },
        {
          name: 'duplexField21',
          config: dupleConfig21,
          oppositeName: 'oppositeDuplexFields21',
        },
        {
          name: 'duplexFields22',
          config: dupleConfig22,
          oppositeName: 'oppositeDuplexFields22',
          array: true,
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce relational fields to create new connected entities', () => {
    const entityConfig: EntityConfig = {};

    const relationalConfig1: EntityConfig = {
      name: 'Relational1',
      type: 'tangible',
      textFields: [{ name: 'relationalTextField1' }],
    };

    const relationalConfig2: EntityConfig = {
      name: 'Relational2',
      type: 'tangible',
      textFields: [{ name: 'relationalTextField2' }],
    };

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField1',
          config: relationalConfig1,
        },
        {
          name: 'relationalField2',
          config: relationalConfig2,
          array: true,
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  test('should coerce realational & duplex fields in embedded fields', () => {
    const entityConfig: EntityConfig = {};
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      relationalFields: [
        {
          name: 'relationalField',
          config: entityConfig,
        },
      ],
    };
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField' }],
      duplexFields: [
        {
          name: 'duplexField',
          config: entityConfig,
          oppositeName: 'duplexField',
        },
      ],
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
      createdAt: '2019-06-07T22:00:00.000Z',
      updatedAt: '2019-06-08T22:00:00.000Z',
      textField: 'text field',
      duplexField: '5cefb33f05d6be4b7b59842c',
      embedded1: {
        relationalField: '5cefb33f05d6be4b7b59842b',
      },
      embedded2: [
        {
          relationalField: '5cefb33f05d6be4b7b59842e',
        },
        {
          relationalField: '5cefb33f05d6be4b7b598421',
        },
      ],
    };

    const prevData = null;

    const expectedResult = {
      id: '5cefb33f05d6be4b7b59842a',
      createdAt: '2019-06-07T22:00:00.000Z',
      updatedAt: '2019-06-08T22:00:00.000Z',
      textField: 'text field',
      duplexField: { connect: '5cefb33f05d6be4b7b59842c' },
      embedded1: {
        relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
      },
      embedded2: [
        {
          relationalField: { connect: '5cefb33f05d6be4b7b59842e' },
        },
        {
          relationalField: { connect: '5cefb33f05d6be4b7b598421' },
        },
      ],
    };

    const allFields = true;
    const result = coerceDataToGqlClientSide(data, prevData, entityConfig, allFields);
    expect(result).toEqual(expectedResult);
  });

  describe('should coerce embedded fields', () => {
    const entityConfig: EntityConfig = {};
    const embedded3Config: EntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: entityConfig,
        },
      ],
    };

    const embedded2Config: EntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          config: embedded3Config,
        },
        {
          name: 'embeddedField3a',
          array: true,
          config: embedded3Config,
        },
      ],
    };

    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          config: embedded2Config,
        },
        {
          name: 'embeddedField2a',
          array: true,
          config: embedded2Config,
        },
      ],
    };

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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
          name: 'embeddeda',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    test('filled in data & prevData = null', () => {
      const data = {
        textField: 'text field',
        embedded: {
          textField: 'embedded text field',
          embeddedField2: {
            textField: 'embedded2 text field',
            embeddedField3: {
              enumField: 'en0',
              relationalField: '5cefb33f05d6be4b7b59842b',
            },
            embeddedField3a: [
              {
                enumField: 'en1',
                relationalField: '5cefb33f05d6be4b7b598421',
              },
              {
                enumField: 'en2',
                relationalField: '5cefb33f05d6be4b7b598422',
              },
            ],
          },
          embeddedField2a: [
            {
              textField: 'embedded2 1 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: '5cefb33f05d6be4b7b59842c',
              },
              embeddedField3a: [
                {
                  enumField: 'en3',
                  relationalField: '5cefb33f05d6be4b7b59842d',
                },
                {
                  enumField: 'en4',
                  relationalField: '5cefb33f05d6be4b7b59842e',
                },
              ],
            },
          ],
        },
        embeddeda: [
          {
            textField: 'embedded text field',
            embeddedField2: {
              textField: 'embedded2 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: '5cefb33f05d6be4b7b59842b',
              },
              embeddedField3a: [
                {
                  enumField: 'en1',
                  relationalField: '5cefb33f05d6be4b7b598421',
                },
                {
                  enumField: 'en2',
                  relationalField: '5cefb33f05d6be4b7b598422',
                },
              ],
            },
            embeddedField2a: [
              {
                textField: 'embedded2 1 text field',
                embeddedField3: {
                  enumField: 'en0',
                  relationalField: '5cefb33f05d6be4b7b59842c',
                },
                embeddedField3a: [
                  {
                    enumField: 'en3',
                    relationalField: '5cefb33f05d6be4b7b59842d',
                  },
                  {
                    enumField: 'en4',
                    relationalField: '5cefb33f05d6be4b7b59842e',
                  },
                ],
              },
            ],
          },
        ],
      };

      const prevData = null;

      const expectedResult = {
        textField: 'text field',
        embedded: {
          textField: 'embedded text field',
          embeddedField2: {
            textField: 'embedded2 text field',
            embeddedField3: {
              enumField: 'en0',
              relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
            },
            embeddedField3a: [
              {
                enumField: 'en1',
                relationalField: { connect: '5cefb33f05d6be4b7b598421' },
              },
              {
                enumField: 'en2',
                relationalField: { connect: '5cefb33f05d6be4b7b598422' },
              },
            ],
          },
          embeddedField2a: [
            {
              textField: 'embedded2 1 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: { connect: '5cefb33f05d6be4b7b59842c' },
              },
              embeddedField3a: [
                {
                  enumField: 'en3',
                  relationalField: { connect: '5cefb33f05d6be4b7b59842d' },
                },
                {
                  enumField: 'en4',
                  relationalField: { connect: '5cefb33f05d6be4b7b59842e' },
                },
              ],
            },
          ],
        },
        embeddeda: [
          {
            textField: 'embedded text field',
            embeddedField2: {
              textField: 'embedded2 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
              },
              embeddedField3a: [
                {
                  enumField: 'en1',
                  relationalField: { connect: '5cefb33f05d6be4b7b598421' },
                },
                {
                  enumField: 'en2',
                  relationalField: { connect: '5cefb33f05d6be4b7b598422' },
                },
              ],
            },
            embeddedField2a: [
              {
                textField: 'embedded2 1 text field',
                embeddedField3: {
                  enumField: 'en0',
                  relationalField: { connect: '5cefb33f05d6be4b7b59842c' },
                },
                embeddedField3a: [
                  {
                    enumField: 'en3',
                    relationalField: { connect: '5cefb33f05d6be4b7b59842d' },
                  },
                  {
                    enumField: 'en4',
                    relationalField: { connect: '5cefb33f05d6be4b7b59842e' },
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('empty data & prevData = null', () => {
      const data = {
        textField: '',
        embedded: {
          textField: '',
          embeddedField2: {
            textField: '',
            embeddedField3: {
              enumField: '',
              relationalField: '',
            },
            embeddedField3a: [
              {
                enumField: '',
                relationalField: '',
              },
            ],
          },
          embeddedField2a: [
            {
              textField: '',
              embeddedField3: {
                enumField: '',
                relationalField: '',
              },
              embeddedField3a: [],
            },
          ],
        },
        embeddeda: [
          {
            textField: '',
            embeddedField2: {
              textField: '',
              embeddedField3: {
                enumField: '',
                relationalField: '',
              },
              embeddedField3a: [],
            },
            embeddedField2a: [],
          },
        ],
      };

      const prevData = null;

      const expectedResult = {
        textField: '',
        embedded: {
          textField: '',
          embeddedField2: {
            textField: '',
            embeddedField3: {
              enumField: null,
              relationalField: { connect: null },
            },
            embeddedField3a: [
              {
                enumField: null,
                relationalField: { connect: null },
              },
            ],
          },
          embeddedField2a: [
            {
              textField: '',
              embeddedField3: {
                enumField: null,
                relationalField: { connect: null },
              },
              embeddedField3a: [],
            },
          ],
        },
        embeddeda: [
          {
            textField: '',
            embeddedField2: {
              textField: '',
              embeddedField3: {
                enumField: null,
                relationalField: { connect: null },
              },
              embeddedField3a: [],
            },
            embeddedField2a: [],
          },
        ],
      };

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('filled in data & prevData with same array and text field', () => {
      const data = {
        textField: 'text field',
        embedded: {
          textField: 'embedded text field',
          embeddedField2: {
            textField: 'embedded2 text field',
            embeddedField3: {
              enumField: 'en0',
              relationalField: '5cefb33f05d6be4b7b59842b',
            },
            embeddedField3a: [
              {
                enumField: 'en1',
                relationalField: '5cefb33f05d6be4b7b598421',
              },
              {
                enumField: 'en2',
                relationalField: '5cefb33f05d6be4b7b598422',
              },
            ],
          },
          embeddedField2a: [
            {
              textField: 'embedded2 1 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: '5cefb33f05d6be4b7b59842c',
              },
              embeddedField3a: [
                {
                  enumField: 'en3',
                  relationalField: '5cefb33f05d6be4b7b59842d',
                },
                {
                  enumField: 'en4',
                  relationalField: '5cefb33f05d6be4b7b59842e',
                },
              ],
            },
          ],
        },
        embeddeda: [
          {
            textField: 'embedded text field',
            embeddedField2: {
              textField: 'embedded2 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: '5cefb33f05d6be4b7b59842b',
              },
              embeddedField3a: [
                {
                  enumField: 'en1',
                  relationalField: '5cefb33f05d6be4b7b598421',
                },
                {
                  enumField: 'en2',
                  relationalField: '5cefb33f05d6be4b7b598422',
                },
              ],
            },
            embeddedField2a: [
              {
                textField: 'embedded2 1 text field',
                embeddedField3: {
                  enumField: 'en0',
                  relationalField: '5cefb33f05d6be4b7b59842c',
                },
                embeddedField3a: [
                  {
                    enumField: 'en3',
                    relationalField: '5cefb33f05d6be4b7b59842d',
                  },
                  {
                    enumField: 'en4',
                    relationalField: '5cefb33f05d6be4b7b59842e',
                  },
                ],
              },
            ],
          },
        ],
      };

      const prevData = {
        textField: 'text field',
        embedded: {
          textField: 'embedded text field',
          embeddedField2: {
            textField: 'embedded2 text field',
            embeddedField3: {
              enumField: 'en0',
              relationalField: '5cefb33f05d6be4b7b59842b',
            },
            embeddedField3a: [
              {
                enumField: 'en1',
                relationalField: '5cefb33f05d6be4b7b598421',
              },
              {
                enumField: 'en2',
                relationalField: '5cefb33f05d6be4b7b598423',
              },
            ],
          },
          embeddedField2a: [
            {
              textField: 'embedded2 1 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: '5cefb33f05d6be4b7b59842c',
              },
              embeddedField3a: [
                {
                  enumField: 'en3',
                  relationalField: '5cefb33f05d6be4b7b59842d',
                },
                {
                  enumField: 'en4',
                  relationalField: '5cefb33f05d6be4b7b59842e',
                },
              ],
            },
          ],
        },
        embeddeda: [
          {
            textField: 'embedded text field',
            embeddedField2: {
              textField: 'embedded2 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: '5cefb33f05d6be4b7b59842b',
              },
              embeddedField3a: [
                {
                  enumField: 'en1',
                  relationalField: '5cefb33f05d6be4b7b598421',
                },
                {
                  enumField: 'en2',
                  relationalField: '5cefb33f05d6be4b7b598422',
                },
              ],
            },
            embeddedField2a: [
              {
                textField: 'embedded2 1 text field',
                embeddedField3: {
                  enumField: 'en0',
                  relationalField: '5cefb33f05d6be4b7b59842c',
                },
                embeddedField3a: [
                  {
                    enumField: 'en3',
                    relationalField: '5cefb33f05d6be4b7b59842d',
                  },
                  {
                    enumField: 'en4',
                    relationalField: '5cefb33f05d6be4b7b59842e',
                  },
                ],
              },
            ],
          },
        ],
      };

      const expectedResult = {
        embedded: {
          textField: 'embedded text field',
          embeddedField2: {
            textField: 'embedded2 text field',
            embeddedField3: {
              enumField: 'en0',
              relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
            },
            embeddedField3a: [
              {
                enumField: 'en1',
                relationalField: { connect: '5cefb33f05d6be4b7b598421' },
              },
              {
                enumField: 'en2',
                relationalField: { connect: '5cefb33f05d6be4b7b598422' },
              },
            ],
          },
          embeddedField2a: [
            {
              textField: 'embedded2 1 text field',
              embeddedField3: {
                enumField: 'en0',
                relationalField: { connect: '5cefb33f05d6be4b7b59842c' },
              },
              embeddedField3a: [
                {
                  enumField: 'en3',
                  relationalField: { connect: '5cefb33f05d6be4b7b59842d' },
                },
                {
                  enumField: 'en4',
                  relationalField: { connect: '5cefb33f05d6be4b7b59842e' },
                },
              ],
            },
          ],
        },
      };

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce file fields', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce geospatial fields', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'geospatialFieldPoint',
          geospatialType: 'Point',
        },
        {
          name: 'geospatialFieldPolygon',
          geospatialType: 'Polygon',
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

      const result = coerceDataToGqlClientSide(
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const expectedResult = {};

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce geospatial fields', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce dateTime fields', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'dateTimeField',
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

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        dateTimeField: '2019-06-01T01:00',
      };

      const expectedResult = {};

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('should coerce int & float fields', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField',
        },
        {
          name: 'intFields',
          array: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
        {
          name: 'floatFields',
          array: true,
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
      const prevData = {};

      const expectedResult = {
        intField: 1,
        intFields: [2],
        floatField: 0.3,
        floatFields: [0.4],
      };

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });

    test('some not changed prev data', () => {
      const prevData = {
        intField: 1,
        intFields: [2],
        floatField: 0.3,
        floatFields: [0.4],
      };

      const expectedResult = {};

      const result = coerceDataToGqlClientSide(data, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data2, prevData, entityConfig);
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

      const result = coerceDataToGqlClientSide(data2, prevData, entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });
});
