// @flow

// import BitwiseArray, { createBitwiseArray } from 'bitwise-array';
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

// type Arg = {
// };
type Reducer = Function;
type InititalState = {
  error: string,
  items: Array<Object>,
  loading: boolean,
  generalConfig: GeneralConfig | null,
  config: ThingConfig | null,
};

type Result = {|
  reducer: Reducer,
  initialState: InititalState,
|};

const createUseReducerArgs = (): Result => {
  const reducer = (state, action) => {
    const { type } = action;

    if (type === 'ERROR') {
      const { value } = action;
      return { ...state, error: value, loading: false };
    }

    if (type === 'SUCCESS') {
      const { value } = action;
      return { ...state, items: value, loading: false };
    }

    if (type === 'LOAD') {
      const { config, generalConfig } = action;
      if (config === state.config && !state.error) return state;
      return { ...state, error: '', loading: true, config, generalConfig };
    }

    if (type === 'ADD') {
      const { value } = action;
      return { ...state, items: [...state.items, value] };
    }

    throw new TypeError(`Invalid action type: "${type}"!`);
  };

  return {
    reducer,
    initialState: {
      error: '',
      items: [],
      loading: false,
      config: null,
      generalConfig: null,
    },
  };
};

export default createUseReducerArgs;
