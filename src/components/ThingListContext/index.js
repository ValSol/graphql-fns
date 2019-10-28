// @flow

import * as React from 'react';
import pluralize from 'pluralize';

import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import coerceListItems from './coerceListItems';
import createUseReducerArgs from './createUseReducerArgs';

type Props = {
  children: React.Node,
};

const ThingListContext = React.createContext<{
  state: {
    error: string,
    items: Array<Object>,
    loading: boolean,
    config: ThingConfig | null,
    generalConfig: GeneralConfig | null,
  },
  dispatch: Function,
}>({
  state: { error: '', items: [], config: null, generalConfig: null, loading: false },
  dispatch: () => {},
});

const ThingListProvider = (props: Props) => {
  const { children } = props;
  const apolloClient = useApolloClient();
  const { reducer, initialState } = createUseReducerArgs();
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { loading, config } = state;

  React.useEffect(() => {
    if (!config || !loading) return;
    const fetchData = async () => {
      const { name } = config;

      const thingQuery = gql(composeQuery('things', config, null));

      try {
        const { data } = await apolloClient.query({ query: thingQuery });
        const fetchedItems = coerceListItems(data[pluralize(name)], config);
        dispatch({ type: 'SUCCESS', value: fetchedItems, config });
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
