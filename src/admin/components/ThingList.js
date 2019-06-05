// @flow

import React from 'react';
import pluralize from 'pluralize';

import Container from '@material-ui/core/Container';
import NoSsr from '@material-ui/core/NoSsr';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';

import Router from 'next/router';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import type { RouterQuery, ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import arrangeListColumns from '../arrangeListColumns';
import coerceListItems from '../coerceListItems';
import VirtualizedTable from './VirtualizedTable';

type Props = { thingConfig: ThingConfig, router: { pathname: string, query: RouterQuery } };

function ThingList(props: Props) {
  const {
    thingConfig,
    thingConfig: { list, name },
    router: { pathname },
  } = props;

  const columns = (list || arrangeListColumns(thingConfig)).map(({ name: fieldName, width }) => ({
    dataKey: fieldName,
    label: fieldName,
    width,
  }));

  const include = columns.reduce(
    (prev, { dataKey }) => {
      prev[dataKey] = null; // eslint-disable-line no-param-reassign
      return prev;
    },
    { id: null },
  );

  const thingQuery = gql(composeQuery('things', thingConfig, { include }));

  return (
    <Container>
      <h1>{`${name} List`}</h1>
      <Paper style={{ height: 400, width: '100%' }}>
        <NoSsr>
          <Query query={thingQuery}>
            {({ data, error: thingQueryError, loading }) => {
              if (loading) return 'Loading...';

              if (thingQueryError)
                return (
                  <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={!!thingQueryError}
                    ContentProps={{
                      'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{thingQueryError.message}</span>}
                  />
                );

              const items = coerceListItems(data[pluralize(name)], thingConfig);

              return (
                <VirtualizedTable
                  rowCount={items.length}
                  rowGetter={({ index }) => items[index]}
                  onRowClick={({ rowData: { id } }) =>
                    Router.push({ pathname, query: { id, thing: name } })
                  }
                  columns={columns}
                />
              );
            }}
          </Query>
        </NoSsr>
      </Paper>
    </Container>
  );
}

export default ThingList;
