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

    const thingConfigs = [thingConfig];

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
        enumIndexedFieldArray: createBitwiseArray(['Monday', 'Tuesday'], weekDays),
        enumIndexedEmpytField: createBitwiseArray(weekDays.length),
        enumIndexedEmptyFieldArray: createBitwiseArray([], weekDays),
        enumRequiredIndexedField: createBitwiseArray(['Sunday'], weekDays),
        enumRequiredIndexedFieldArray: createBitwiseArray(['Monday', 'Tuesday'], weekDays),
      },
      {
        id: '2',
        booleanIndexedField: true,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: createBitwiseArray(['Wednesday'], weekDays),
        enumIndexedFieldArray: createBitwiseArray(weekDays.length),
        enumIndexedEmpytField: createBitwiseArray(weekDays.length),
        enumIndexedEmptyFieldArray: createBitwiseArray(weekDays.length),
        enumRequiredIndexedField: createBitwiseArray(['Monday'], weekDays),
        enumRequiredIndexedFieldArray: createBitwiseArray(['Wednesday', 'Thursday'], weekDays),
      },
      {
        id: '3',
        booleanIndexedField: false,
        booleanIndexedFalseField: false,
        booleanIndexedTrueField: true,
        enumIndexedField: createBitwiseArray(['Tuesday'], weekDays),
        enumIndexedFieldArray: createBitwiseArray(weekDays.length),
        enumIndexedEmpytField: createBitwiseArray(weekDays.length),
        enumIndexedEmptyFieldArray: createBitwiseArray(weekDays.length),
        enumRequiredIndexedField: createBitwiseArray(['Tuesday'], weekDays),
        enumRequiredIndexedFieldArray: createBitwiseArray(['Wednesday', 'Friday'], weekDays),
      },
    ];

    const booleanEnum = ['false', 'true'];
    const expandedWeekDays = ['', ...weekDays];
    const masks = {
      booleanIndexedField: createBitwiseArray(['false', 'true'], booleanEnum),
      booleanIndexedFalseField: createBitwiseArray(['false'], booleanEnum),
      booleanIndexedTrueField: createBitwiseArray(['true'], booleanEnum),
      enumIndexedField: createBitwiseArray(['', 'Wednesday', 'Tuesday'], expandedWeekDays),
      enumIndexedFieldArray: createBitwiseArray(['Monday', 'Tuesday', ''], expandedWeekDays),
      enumIndexedEmpytField: createBitwiseArray([''], expandedWeekDays),
      enumIndexedEmptyFieldArray: createBitwiseArray([''], expandedWeekDays),
      enumRequiredIndexedField: createBitwiseArray(
        ['Sunday', 'Monday', 'Tuesday'],
        expandedWeekDays,
      ),
      enumRequiredIndexedFieldArray: createBitwiseArray(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        expandedWeekDays,
      ),
    };
    const expectedResult = { decorated, masks };

    const result = decorateItems(items, filters);
    expect(result).toEqual(expectedResult);
  });
});
