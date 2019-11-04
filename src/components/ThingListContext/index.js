// @flow

import * as React from 'react';
import pluralize from 'pluralize';

import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import BitwiseArray from 'bitwise-array';

import type { AdminFilters, GeneralConfig, ThingConfig } from '../../flowTypes';

import coerceDataFromGql from '../../utils/coerceDataFromGql';
import composeQuery from '../../client/queries/composeQuery';
import createUseReducerArgs from './createUseReducerArgs';

type Props = {
  children: React.Node,
  generalConfig: GeneralConfig,
};

const ThingListContext = React.createContext<{
  state: {
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
  },
  dispatch: Function,
}>({
  state: {
    error: '',
    decorated: [],
    items: [],
    listItems: [],
    filtered: [],
    masks: {},
    loading: false,
    filters: {},
    config: null,
    outdated: false,
  },
  dispatch: () => {},
});

const ThingListProvider = (props: Props) => {
  const { children, generalConfig } = props;
  const apolloClient = useApolloClient();
  const { reducer, initialState } = createUseReducerArgs(generalConfig);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { loading, config } = state;

  React.useEffect(() => {
    if (!config || !loading) return;
    const fetchData = async () => {
      const { name } = config;

      const thingQuery = gql(composeQuery('things', config, null));
      // dispatch({ type: 'LOAD', config });
      try {
        const { data } = await apolloClient.query({ query: thingQuery });
        // const fetchedItems = coerceListItems(data[pluralize(name)], config);
        const fetchedItems = data[pluralize(name)];
        const value = fetchedItems.map(item => {
          const obj = coerceDataFromGql(item, config);
          obj.id = item.id;
          return obj;
        });
        dispatch({ type: 'SUCCESS', value });
      } catch (fetchingError) {
        dispatch({ type: 'ERROR', value: fetchingError });
      }
    };

    fetchData();
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThingListContext.Provider value={{ state, dispatch }}>{children}</ThingListContext.Provider>
  );
};

export { ThingListContext, ThingListProvider };
