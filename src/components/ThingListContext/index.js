// @flow

import * as React from 'react';
import pluralize from 'pluralize';

import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import type { AdminListContextState, GeneralConfig } from '../../flowTypes';

import coerceDataFromGql from '../../utils/coerceDataFromGql';
import composeQuery from '../../client/queries/composeQuery';
import createUseReducerArgs from './createUseReducerArgs';

type Props = {
  children: React.Node,
  generalConfig: GeneralConfig,
};

const ThingListContext: Object = React.createContext<{
  state: AdminListContextState,
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

const ThingListProvider: React.StatelessFunctionalComponent<Props> = (props: Props) => {
  const { children, generalConfig } = props;
  const apolloClient = useApolloClient();
  const { reducer, initialState } = createUseReducerArgs(generalConfig);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { loading, config } = state;

  React.useEffect(() => {
    if (!config || !loading) return;
    const fetchData = async () => {
      const { name } = config;

      const thingQuery = gql(
        composeQuery('Admin_ThingListContext', 'things', config, generalConfig),
      );
      // dispatch({ type: 'LOAD', config });
      try {
        const { data } = await apolloClient.query({ query: thingQuery });
        // const fetchedItems = coerceListItems(data[pluralize(name)], config);
        const fetchedItems = data[pluralize(name)];
        const value = fetchedItems.map((item) => {
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
