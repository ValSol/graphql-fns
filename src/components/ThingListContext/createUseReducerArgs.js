// @flow

import BitwiseArray from 'bitwise-array';

import type { AdminFilters, GeneralConfig, ThingConfig } from '../../flowTypes';

import coerceListItems from './coerceListItems';
import composeFilters from './composeFilters';
import decorateItems from './decorateItems';
import filterItems from './filterItems';

type Reducer = Function;
type InititalState = {
  error: string,
  decorated: Array<Object>,
  items: Array<Object>,
  listItems: Array<Object>,
  filtered: Array<Object>,
  masks: { [fieldName: string]: BitwiseArray },
  loading: boolean,
  filters: AdminFilters,
  config: ThingConfig | null,
  outdated: boolean,
};

type Result = {|
  reducer: Reducer,
  initialState: InititalState,
|};

const createUseReducerArgs = (generalConfig: GeneralConfig): Result => {
  const reducer = (state, action) => {
    const { type } = action;

    if (type === 'ERROR') {
      const { value } = action;
      return { ...state, error: value, loading: false };
    }

    if (type === 'SUCCESS') {
      const { value } = action;
      const { decorated, masks } = decorateItems(value, state.filters);
      const listItems = coerceListItems(value, state.config);
      const filtered = filterItems(listItems, decorated, state.filters);
      return { ...state, decorated, masks, items: value, listItems, filtered, loading: false };
    }

    if (type === 'LOAD') {
      const { config } = action;
      if (config === state.config && !state.error && !state.outdated) return state;
      const filters = composeFilters(config, generalConfig);
      return { ...state, error: '', loading: true, outdated: false, config, filters };
    }

    if (type === 'OUTDATE') {
      if (state.outdated) return state;
      return { ...state, outdated: true };
    }

    if (type === 'ADD') {
      const { value } = action;
      const items = [...state.items, value];
      const { decorated, masks } = decorateItems(items, state.filters);
      const listItems = coerceListItems(items, state.config);
      const filtered = filterItems(listItems, decorated, state.filters);
      return { ...state, decorated, masks, items, listItems, filtered };
    }

    if (type === 'FILTER') {
      const { value } = action;
      const { filters: currentFilters } = state;
      const filters = { ...currentFilters };
      Object.keys(value).forEach(key => {
        filters[key].value = value[key];
      });

      if (state.loading) {
        return { ...state, filters };
      }
      const filtered = filterItems(state.listItems, state.decorated, filters);
      return { ...state, filtered, filters };
    }

    throw new TypeError(`Invalid action type: "${type}"!`);
  };

  return {
    reducer,
    initialState: {
      error: '',
      decorated: [],
      filtered: [],
      items: [],
      listItems: [],
      masks: {},
      loading: false,
      config: null,
      filters: {},
      outdated: false,
    },
  };
};

export default createUseReducerArgs;
