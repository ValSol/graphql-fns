// @flow
/* eslint-env jest */

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFilters from './composeFilters';

describe('composeFilters', () => {
  test('should coerce enum fields', () => {
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
        {
          name: 'booleanIndexedField',
          index: true,
        },
        {
          name: 'booleanIndexedFieldArray',
          array: true,
          index: true,
        },
      ],
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
        {
          name: 'enumIndexedField',
          enumName: 'weekDays',
          index: true,
        },
        {
          name: 'enumIndexedFieldArray',
          array: true,
          enumName: 'weekDays',
          index: true,
        },
        {
          name: 'enumRequiredField',
          enumName: 'weekDays',
          required: true,
        },
        {
          name: 'enumRequiredFieldArray',
          array: true,
          enumName: 'weekDays',
          required: true,
        },
        {
          name: 'enumRequiredIndexedField',
          enumName: 'weekDays',
          index: true,
          required: true,
        },
        {
          name: 'enumRequiredIndexedFieldArray',
          array: true,
          enumName: 'weekDays',
          index: true,
          required: true,
        },
      ],
    };
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const enums = [
      {
        name: 'weekDays',
        enum: weekDays,
      },
    ];

    const thingConfigs = [thingConfig];

    const generalConfig: GeneralConfig = { thingConfigs, enums };

    const expectedResult = {
      booleanIndexedField: { fieldVariant: 'booleanField', value: 'all' },
      enumIndexedField: {
        fieldVariant: 'enumField',
        value: 'all',
        enumeration: weekDays,
      },
      enumIndexedFieldArray: {
        fieldVariant: 'enumArrayField',
        value: 'all',
        enumeration: weekDays,
      },
      enumRequiredIndexedField: {
        fieldVariant: 'enumField',
        value: 'all',
        enumeration: weekDays,
      },
      enumRequiredIndexedFieldArray: {
        fieldVariant: 'enumArrayField',
        value: 'all',
        enumeration: weekDays,
      },
    };

    const result = composeFilters(thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
