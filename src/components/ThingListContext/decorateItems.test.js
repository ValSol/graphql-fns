// @flow
/* eslint-env jest */

import { createBitwiseArray } from 'bitwise-array';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFilters from './composeFilters';
import decorateItems from './decorateItems';

describe('decorateItems', () => {
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
          name: 'booleanIndexedFalseField',
          index: true,
        },
        {
          name: 'booleanIndexedTrueField',
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
          name: 'enumIndexedEmpytField',
          enumName: 'weekDays',
          index: true,
        },
        {
          name: 'enumIndexedEmptyFieldArray',
          array: true,
          enumName: 'weekDays',
          index: true,
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

    const thingConfigs = { Example: thingConfig };

    const generalConfig: GeneralConfig = { thingConfigs, enums };

    const filters = composeFilters(thingConfig, generalConfig);

    const items = [
      {
        id: '1',
        booleanIndexedField: '',
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: '',
        enumIndexedFieldArray: ['Monday', 'Tuesday'],
        enumIndexedEmpytField: '',
        enumIndexedEmptyFieldArray: [],
        enumRequiredIndexedField: 'Sunday',
        enumRequiredIndexedFieldArray: ['Monday', 'Tuesday'],
      },
      {
        id: '2',
        booleanIndexedField: true,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: 'Wednesday',
        enumIndexedFieldArray: [],
        enumIndexedEmpytField: '',
        enumIndexedEmptyFieldArray: [],
        enumRequiredIndexedField: 'Monday',
        enumRequiredIndexedFieldArray: ['Wednesday', 'Thursday'],
      },
      {
        id: '3',
        booleanIndexedField: false,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: 'Tuesday',
        enumIndexedFieldArray: [],
        enumIndexedEmpytField: '',
        enumIndexedEmptyFieldArray: [],
        enumRequiredIndexedField: 'Tuesday',
        enumRequiredIndexedFieldArray: ['Wednesday', 'Friday'],
      },
    ];

    const decorated = [
      {
        id: '1',
        booleanIndexedField: false,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: createBitwiseArray(weekDays.length),
        enumIndexedFieldArray: createBitwiseArray(weekDays, ['Monday', 'Tuesday']),
        enumIndexedEmpytField: createBitwiseArray(weekDays.length),
        enumIndexedEmptyFieldArray: createBitwiseArray(weekDays, []),
        enumRequiredIndexedField: createBitwiseArray(weekDays, ['Sunday']),
        enumRequiredIndexedFieldArray: createBitwiseArray(weekDays, ['Monday', 'Tuesday']),
      },
      {
        id: '2',
        booleanIndexedField: true,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: createBitwiseArray(weekDays, ['Wednesday']),
        enumIndexedFieldArray: createBitwiseArray(weekDays.length),
        enumIndexedEmpytField: createBitwiseArray(weekDays.length),
        enumIndexedEmptyFieldArray: createBitwiseArray(weekDays.length),
        enumRequiredIndexedField: createBitwiseArray(weekDays, ['Monday']),
        enumRequiredIndexedFieldArray: createBitwiseArray(weekDays, ['Wednesday', 'Thursday']),
      },
      {
        id: '3',
        booleanIndexedField: false,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: createBitwiseArray(weekDays, ['Tuesday']),
        enumIndexedFieldArray: createBitwiseArray(weekDays.length),
        enumIndexedEmpytField: createBitwiseArray(weekDays.length),
        enumIndexedEmptyFieldArray: createBitwiseArray(weekDays.length),
        enumRequiredIndexedField: createBitwiseArray(weekDays, ['Tuesday']),
        enumRequiredIndexedFieldArray: createBitwiseArray(weekDays, ['Wednesday', 'Friday']),
      },
    ];

    const booleanEnum = ['false', 'true'];
    const expandedWeekDays = ['', ...weekDays];
    const masks = {
      booleanIndexedField: createBitwiseArray(booleanEnum, ['false', 'true']),
      booleanIndexedFalseField: createBitwiseArray(booleanEnum, ['false']),
      booleanIndexedTrueField: createBitwiseArray(booleanEnum, ['true']),
      enumIndexedField: createBitwiseArray(expandedWeekDays, ['', 'Wednesday', 'Tuesday']),
      enumIndexedFieldArray: createBitwiseArray(expandedWeekDays, ['Monday', 'Tuesday', '']),
      enumIndexedEmpytField: createBitwiseArray(expandedWeekDays, ['']),
      enumIndexedEmptyFieldArray: createBitwiseArray(expandedWeekDays, ['']),
      enumRequiredIndexedField: createBitwiseArray(expandedWeekDays, [
        'Sunday',
        'Monday',
        'Tuesday',
      ]),
      enumRequiredIndexedFieldArray: createBitwiseArray(expandedWeekDays, [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ]),
    };
    const expectedResult = { decorated, masks };

    const result = decorateItems(items, filters);
    expect(result).toEqual(expectedResult);
  });
});
