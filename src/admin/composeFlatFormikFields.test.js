// @flow
/* eslint-env jest */
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

import composeFlatFormikFields from './composeFlatFormikFields';

describe('composeFlatFormikFields', () => {
  test('should compose the flat fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
    };

    const expectedResult: FlatFormikFields = [
      { name: 'textField1', kind: 'textFields' },
      { name: 'textField2', kind: 'textFields' },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the flat array fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textFieldArray1',
          array: true,
        },
        {
          name: 'textFieldArray2',
          array: true,
        },
      ],
    };

    const expectedResult: FlatFormikFields = [
      {
        name: 'textFieldArray1',
        array: true,
        kind: 'textFields',
      },
      {
        name: 'textFieldArray2',
        array: true,
        kind: 'textFields',
      },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the flat embedded fields', () => {
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
          name: 'embedded3',
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
          name: 'embedded2',
          config: embedded2Config,
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
        },
      ],
    };

    const expectedResult: FlatFormikFields = [
      { name: 'textField', kind: 'textFields' },
      {
        name: 'embedded1',
        kind: 'embeddedFields',
        child: [
          { name: 'textField1', kind: 'textFields' },
          {
            name: 'embedded2',
            kind: 'embeddedFields',
            child: [
              { name: 'textField2', kind: 'textFields' },
              {
                name: 'embedded3',
                kind: 'embeddedFields',
                child: [{ name: 'textField3', kind: 'textFields' }],
              },
            ],
          },
        ],
      },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the flat array embedded fields', () => {
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
          name: 'embedded3',
          config: embedded3Config,
          array: true,
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
          name: 'embedded2',
          config: embedded2Config,
          array: true,
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
          array: true,
        },
      ],
    };

    const expectedResult: FlatFormikFields = [
      { name: 'textField', kind: 'textFields' },
      {
        name: 'embedded1',
        kind: 'embeddedFields',
        array: true,
        config: embedded1Config,
        child: [
          { name: 'textField1', kind: 'textFields' },
          {
            name: 'embedded2',
            kind: 'embeddedFields',
            array: true,
            config: embedded2Config,
            child: [
              { name: 'textField2', kind: 'textFields' },
              {
                name: 'embedded3',
                kind: 'embeddedFields',
                array: true,
                config: embedded3Config,
                child: [{ name: 'textField3', kind: 'textFields' }],
              },
            ],
          },
        ],
      },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the int & float flat fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    };

    const expectedResult: FlatFormikFields = [
      { name: 'intField', kind: 'intFields' },
      { name: 'floatField', kind: 'floatFields' },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the boolean & dateTime & enum flat fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField',
        },
      ],
      dateTimeFields: [
        {
          name: 'dateTimeField',
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'enumName',
        },
      ],
    };

    const expectedResult: FlatFormikFields = [
      { name: 'booleanField', kind: 'booleanFields' },
      { name: 'enumField', kind: 'enumFields' },
      { name: 'dateTimeField', kind: 'dateTimeFields' },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the relational & duplex flat fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
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
    });

    const expectedResult: FlatFormikFields = [
      { name: 'duplexField', kind: 'duplexFields' },
      { name: 'relationalField', kind: 'relationalFields' },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
