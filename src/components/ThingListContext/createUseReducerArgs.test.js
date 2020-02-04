// @flow
/* eslint-env jest */

import { createBitwiseArray } from 'bitwise-array';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import coerceListItems from './coerceListItems';
import composeFilters from './composeFilters';
import createUseReducerArgs from './createUseReducerArgs';
import decorateItems from './decorateItems';
import filterItems from './filterItems';

describe('createUseReducerArgs util', () => {
  const config: ThingConfig = {
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

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const enums = [
    {
      name: 'weekDays',
      enum: weekDays,
    },
  ];

  const generalConfig: GeneralConfig = { thingConfigs: [config], enums };

  const filters = composeFilters(config, generalConfig);

  test('should return correct initialState', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const expectedInitialState = {
      error: '',
      items: [],
      listItems: [],
      decorated: [],
      masks: {},
      filtered: [],
      loading: false,
      outdated: false,
      config: null,
      filters: {},
    };
    expect(initialState).toEqual(expectedInitialState);
    expect(typeof reducer).toBe('function');
  });

  test('should update state for "LOAD" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const action = { type: 'LOAD', config };

    const state = reducer(initialState, action);
    const expectedState = {
      error: '',
      items: [],
      listItems: [],
      decorated: [],
      masks: {},
      filtered: [],
      loading: true,
      outdated: false,
      config,
      filters,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "OUTDATE" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const action = { type: 'OUTDATE' };

    const state = reducer(initialState, action);
    const expectedState = {
      error: '',
      items: [],
      listItems: [],
      decorated: [],
      masks: {},
      filtered: [],
      loading: false,
      outdated: true,
      config: null,
      filters: {},
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "ERROR" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config };
    const secondState = reducer(initialState, firstAction);
    const action = { type: 'ERROR', value: 'Test Error!' };
    const state = reducer(secondState, action);

    const expectedState = {
      error: 'Test Error!',
      items: [],
      listItems: [],
      decorated: [],
      masks: {},
      filtered: [],
      loading: false,
      outdated: false,
      config,
      filters,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "SUCCESS" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config };
    const secondState = reducer(initialState, firstAction);
    const action = { type: 'SUCCESS', value: items };
    const state = reducer(secondState, action);
    const { decorated, masks } = decorateItems(items, filters);
    const listItems = coerceListItems(items, config);
    const expectedState = {
      error: '',
      items,
      listItems,
      decorated,
      masks,
      filtered: listItems,
      loading: false,
      outdated: false,
      config,
      filters,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "ADD" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config };
    const secondState = reducer(initialState, firstAction);
    const secondAction = { type: 'SUCCESS', value: items };
    const thirdState = reducer(secondState, secondAction);
    const action = { type: 'ADD', value: items[0] };
    const state = reducer(thirdState, action);
    const { decorated, masks } = decorateItems([...items, items[0]], filters);
    const listItems = coerceListItems([...items, items[0]], config);

    const expectedState = {
      error: '',
      items: [...items, items[0]],
      listItems,
      decorated,
      masks,
      filtered: listItems,
      loading: false,
      outdated: false,
      config,
      filters,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "FILTER" type of action for when "loading"', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const action = { type: 'FILTER', value: { booleanIndexedField: true } };
    const state = reducer(secondState, action);

    const expectedState = {
      error: '',
      items: [],
      listItems: [],
      decorated: [],
      masks: {},
      filtered: [],
      loading: true,
      outdated: false,
      config,
      filters: {
        ...filters,
        booleanIndexedField: {
          ...filters.booleanIndexedField,
          value: true,
        },
      },
    };

    expect(state).toEqual(expectedState);
  });

  test('should update state for "FILTER" type of action when "loading" 2', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const action = {
      type: 'FILTER',
      value: { enumIndexedField: createBitwiseArray(weekDays, ['Tuesday']) },
    };
    const state = reducer(secondState, action);

    const expectedState = {
      error: '',
      items: [],
      listItems: [],
      decorated: [],
      masks: {},
      filtered: [],
      loading: true,
      outdated: false,
      config,
      filters: {
        ...filters,
        enumIndexedField: {
          ...filters.enumIndexedField,
          value: createBitwiseArray(weekDays, ['Tuesday']),
        },
      },
    };

    expect(state).toEqual(expectedState);
  });

  test('should update state for "FILTER" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const secondAction = { type: 'SUCCESS', value: items };
    const thirdState = reducer(secondState, secondAction);
    const action = { type: 'FILTER', value: { booleanIndexedField: true } };
    const state = reducer(thirdState, action);

    const filters2 = {
      ...filters,
      booleanIndexedField: {
        ...filters.booleanIndexedField,
        value: true,
      },
    };
    const { decorated, masks } = decorateItems(items, filters);
    const listItems = coerceListItems(items, config);

    const expectedState = {
      error: '',
      items,
      listItems,
      decorated,
      masks,
      filtered: filterItems(listItems, decorated, filters2),
      loading: false,
      outdated: false,
      config,
      filters: filters2,
    };

    expect(state).toEqual(expectedState);
  });

  test('should update state for "FILTER" type of action 2', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const secondAction = { type: 'SUCCESS', value: items };
    const thirdState = reducer(secondState, secondAction);
    const action = {
      type: 'FILTER',
      value: { enumIndexedField: createBitwiseArray(weekDays, ['Tuesday']) },
    };
    const state = reducer(thirdState, action);

    const filters2 = {
      ...filters,
      enumIndexedField: {
        ...filters.enumIndexedField,
        value: createBitwiseArray(weekDays, ['Tuesday']),
      },
    };
    const { decorated, masks } = decorateItems(items, filters);
    const listItems = coerceListItems(items, config);

    const expectedState = {
      error: '',
      items,
      listItems,
      decorated,
      masks,
      filtered: filterItems(listItems, decorated, filters2),
      loading: false,
      outdated: false,
      config,
      filters: filters2,
    };

    expect(state).toEqual(expectedState);
  });

  test('should update state for "SUCCESS" type of action after change "filters"', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const secondAction = { type: 'FILTER', value: { booleanIndexedField: true } };
    const thirdState = reducer(secondState, secondAction);
    const action = { type: 'SUCCESS', value: items };
    const state = reducer(thirdState, action);

    const filters2 = {
      ...filters,
      booleanIndexedField: {
        ...filters.booleanIndexedField,
        value: true,
      },
    };
    const { decorated, masks } = decorateItems(items, filters);
    const listItems = coerceListItems(items, config);
    const expectedState = {
      error: '',
      items,
      listItems,
      decorated,
      masks,
      filtered: filterItems(listItems, decorated, filters2),
      loading: false,
      outdated: false,
      config,
      filters: filters2,
    };

    expect(state).toEqual(expectedState);
  });

  test('should update state for "SUCCESS" type of action after change "filters" 2', () => {
    const { reducer, initialState } = createUseReducerArgs(generalConfig);
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const secondAction = {
      type: 'FILTER',
      value: { enumIndexedField: createBitwiseArray(weekDays, ['Tuesday']) },
    };
    const thirdState = reducer(secondState, secondAction);
    const action = { type: 'SUCCESS', value: items };
    const state = reducer(thirdState, action);

    const filters2 = {
      ...filters,
      enumIndexedField: {
        ...filters.enumIndexedField,
        value: createBitwiseArray(weekDays, ['Tuesday']),
      },
    };
    const { decorated, masks } = decorateItems(items, filters);
    const listItems = coerceListItems(items, config);

    const expectedState = {
      error: '',
      items,
      listItems,
      decorated,
      masks,
      filtered: filterItems(listItems, decorated, filters2),
      loading: false,
      outdated: false,
      config,
      filters: filters2,
    };

    expect(state).toEqual(expectedState);
  });
});
