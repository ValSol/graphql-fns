// @flow
/* eslint-env jest */

import { createBitwiseArray } from 'bitwise-array';

import type {
  BoleanVariant,
  EnumArrayVariant,
  EnumVariant,
  GeneralConfig,
  ThingConfig,
} from '../../flowTypes';

import composeFilters from './composeFilters';
import decorateItems from './decorateItems';
import filterItems from './filterItems';

describe('filterItems', () => {
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
      enumRequiredIndexedFieldArray: ['Wednesday', 'Tuesday'],
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

  const { decorated } = decorateItems(items, filters);

  test('should return items where booleanIndexedField = false', () => {
    // $FlowFixMe flow dosn't understand that this is BoleanVariant type
    const booleanIndexedField: BoleanVariant = filters.booleanIndexedField; // eslint-disable-line prefer-destructuring

    const expectedResult = [items[0], items[2]];

    const filters2 = {
      ...filters,
      booleanIndexedField: {
        ...booleanIndexedField,
        value: false,
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where booleanIndexedField = false', () => {
    // $FlowFixMe flow dosn't understand that this is BoleanVariant type
    const booleanIndexedField: BoleanVariant = filters.booleanIndexedField; // eslint-disable-line prefer-destructuring

    const expectedResult = [items[1]];

    const filters2 = {
      ...filters,
      booleanIndexedField: {
        ...booleanIndexedField,
        value: true,
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where booleanIndexedFalseField = true', () => {
    // $FlowFixMe flow dosn't understand that this is BoleanVariant type
    const booleanIndexedFalseField: BoleanVariant = filters.booleanIndexedFalseField; // eslint-disable-line prefer-destructuring

    const expectedResult = [];

    const filters2 = {
      ...filters,
      booleanIndexedFalseField: {
        ...booleanIndexedFalseField,
        value: true,
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where booleanIndexedFalseField = false', () => {
    // $FlowFixMe flow dosn't understand that this is BoleanVariant type
    const booleanIndexedFalseField: BoleanVariant = filters.booleanIndexedFalseField; // eslint-disable-line prefer-destructuring

    const expectedResult = items;

    const filters2 = {
      ...filters,
      booleanIndexedFalseField: {
        ...booleanIndexedFalseField,
        value: false,
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where enumIndexedField is empty', () => {
    // $FlowFixMe flow dosn't understand that this is EnumField type
    const enumIndexedField: EnumVariant = filters.enumIndexedField; // eslint-disable-line prefer-destructuring

    const expectedResult = [items[0]];
    const filters2 = {
      ...filters,
      enumIndexedField: {
        ...enumIndexedField,
        value: createBitwiseArray(weekDays.length),
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where enumIndexedFieldArray is empty', () => {
    // $FlowFixMe flow dosn't understand that this is enumArrayField type
    const enumIndexedFieldArray: EnumArrayVariant = filters.enumIndexedFieldArray; // eslint-disable-line prefer-destructuring

    const expectedResult = [items[1], items[2]];
    const filters2 = {
      ...filters,
      enumIndexedFieldArray: {
        ...enumIndexedFieldArray,
        value: createBitwiseArray(weekDays.length),
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where enumIndexedField is "Wednesday" or "Tuesday"', () => {
    // $FlowFixMe flow dosn't understand that this is enumArrayField type
    const enumIndexedField: EnumField = filters.enumIndexedField; // eslint-disable-line prefer-destructuring

    const expectedResult = [items[1], items[2]];
    const filters2 = {
      ...filters,
      enumIndexedField: {
        ...enumIndexedField,
        value: createBitwiseArray(weekDays, ['Wednesday', 'Tuesday']),
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });

  test('should return items where enumIndexedFieldArray is "Wednesday" or "Tuesday"', () => {
    // $FlowFixMe flow dosn't understand that this is enumArrayField type
    const enumIndexedFieldArray: EnumArrayVariant = filters.enumIndexedFieldArray; // eslint-disable-line prefer-destructuring

    const expectedResult = [items[0]];
    const filters2 = {
      ...filters,
      enumIndexedFieldArray: {
        ...enumIndexedFieldArray,
        value: createBitwiseArray(weekDays, ['Wednesday', 'Tuesday']),
      },
    };

    const result = filterItems(items, decorated, filters2);
    expect(result).toEqual(expectedResult);
  });
});
