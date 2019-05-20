// @flow
/* eslint-env jest */
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

const composeFlatFormikFields = require('./composeFlatFormikFields');

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
      { fieldName: 'textField1' },
      { fieldName: 'textField2' },
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
      { arrayName: 'textFieldArray1' },
      { arrayName: 'textFieldArray2' },
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
      { fieldName: 'textField' },
      { fieldName: 'embedded1.textField1' },
      { fieldName: 'embedded1.embedded2.textField2' },
      { fieldName: 'embedded1.embedded2.embedded3.textField3' },
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
      { fieldName: 'textField' },
      {
        arrayName: 'embedded1',
        children: [
          { fieldName: 'textField1' },
          {
            arrayName: 'embedded2',
            children: [
              { fieldName: 'textField2' },
              { arrayName: 'embedded3', children: [{ fieldName: 'textField3' }] },
            ],
          },
        ],
      },
    ];

    const result = composeFlatFormikFields(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
