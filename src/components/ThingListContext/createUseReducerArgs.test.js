// @flow
/* eslint-env jest */

// import { createBitwiseArray } from 'bitwise-array';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import createUseReducerArgs from './createUseReducerArgs';

describe('createUseReducerArgs util', () => {
  const config: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };
  const generalConfig: GeneralConfig = { thingConfigs: [config] };

  test('should return correct initialState', () => {
    const { reducer, initialState } = createUseReducerArgs();
    const expectedInitialState = {
      error: '',
      items: [],
      loading: false,
      config: null,
      generalConfig: null,
    };
    expect(initialState).toEqual(expectedInitialState);
    expect(typeof reducer).toBe('function');
  });

  test('should update state for "LOAD" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs();
    const action = { type: 'LOAD', config, generalConfig };

    const state = reducer(initialState, action);
    const expectedState = {
      error: '',
      items: [],
      loading: true,
      config,
      generalConfig,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "ERROR" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs();
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const action = { type: 'ERROR', value: 'Test Error!' };
    const state = reducer(secondState, action);

    const expectedState = {
      error: 'Test Error!',
      items: [],
      loading: false,
      config,
      generalConfig,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "SUCCESS" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs();
    const firstAction = { type: 'LOAD', config, generalConfig };
    const secondState = reducer(initialState, firstAction);
    const action = { type: 'SUCCESS', value: [{ item: 'item' }] };
    const state = reducer(secondState, action);

    const expectedState = {
      error: '',
      items: [{ item: 'item' }],
      loading: false,
      config,
      generalConfig,
    };
    expect(state).toEqual(expectedState);
  });

  test('should update state for "ADD" type of action', () => {
    const { reducer, initialState } = createUseReducerArgs();
    const action = { type: 'ADD', value: { id: 'testId' } };
    const state = reducer(initialState, action);

    const expectedState = {
      error: '',
      items: [{ id: 'testId' }],
      loading: false,
      config: null,
      generalConfig: null,
    };
    expect(state).toEqual(expectedState);
  });
});
