// @flow

import React from 'react';
import pluralize from 'pluralize';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import NoSsr from '@material-ui/core/NoSsr';
import Snackbar from '@material-ui/core/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import AddIcon from '@material-ui/icons/Add';

import Router from 'next/router';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import type { RouterQuery, ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import arrangeListColumns from '../arrangeListColumns';
import coerceListItems from '../coerceListItems';
import Link from './Link';
import VirtualizedTable from './VirtualizedTable';

type Props = { thingConfig: ThingConfig, router: { pathname: string, query: RouterQuery } };

function ThingList(props: Props) {
  const {
    thingConfig,
    thingConfig: { list, name },
    router,
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

  const columns2 = [
    {
      dataKey: '',
      label: '',
      width: 48,
    },
    {
      dataKey: '',
      label: '#',
      width: 48,
    },
    ...columns,
    {
      dataKey: '',
      label: '',
      width: 48,
    },
  ];

  const width = columns2.reduce((prev, { width: columnWidht }) => {
    prev += columnWidht; // eslint-disable-line no-param-reassign
    return prev;
  }, 0);

  return (
    <Container>
      <h1>{`All ${pluralize(name)}`}</h1>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Link href={pathname}>All Things</Link>
        <Typography color="textPrimary">{`All ${pluralize(name)}`}</Typography>
      </Breadcrumbs>

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

            if (!data) throw new TypeError('Undefined data!'); // to elimiate flowjs error

            const items = coerceListItems(data[pluralize(name)], thingConfig);

            return (
              <div>
                <VirtualizedTable
                  columns={columns2}
                  router={router}
                  rowCount={items.length}
                  rowGetter={({ index }) => items[index]}
                  thingConfig={thingConfig}
                  width={width}
                />
                <Tooltip title={`Create new ${name}`}>
                  <Fab
                    color="primary"
                    aria-label={`Create new ${name}`}
                    onClick={() => Router.push(`${pathname}?thing=${name}&create`)}
                    style={{
                      position: 'sticky',
                      bottom: 32,
                      marginTop: 16,
                      marginLeft: width / 2 - 28,
                    }}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </div>
            );
          }}
        </Query>
      </NoSsr>
    </Container>
  );
}

export default ThingList;
