// @flow

import React from 'react';
import pluralize from 'pluralize';

// $FlowFixMe - no 'ApolloContext' in flow types of 'react-apollo'
import { ApolloContext } from 'react-apollo';
import gql from 'graphql-tag';

import type { ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import coerceListItems from './coerceListItems';
import { ThingListContext } from '../ThingListContext';

function useThingList(thingConfig: ThingConfig, columns: Array<Object>) {
  const [state, setState] = React.useContext(ThingListContext);
  const { client: apolloClient } = React.useContext(ApolloContext);
  React.useEffect(() => {
    const fetchData = async () => {
      setState(currentState => ({ ...currentState, loading: true, error: '' }));

      const { name } = thingConfig;

      const include = columns.reduce(
        (prev, { dataKey }) => {
          prev[dataKey] = null; // eslint-disable-line no-param-reassign
          return prev;
        },
        { id: null },
      );

      const thingQuery = gql(composeQuery('things', thingConfig, null, include));

      try {
        const { data } = await apolloClient.query({ query: thingQuery });
        const fetchedItems = coerceListItems(data[pluralize(name)], thingConfig);
        setState({ items: fetchedItems, loading: false, error: '' });
      } catch (fetchingError) {
        setState({ items: [], loading: false, error: fetchingError });
      }
    };

    fetchData();
  }, [thingConfig]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

export default useThingList;
