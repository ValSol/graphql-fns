// @flow

import * as React from 'react';
import pluralize from 'pluralize';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import NoSsr from '@material-ui/core/NoSsr';
import Snackbar from '@material-ui/core/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';

import gql from 'graphql-tag';
import { useApolloClient } from '@apollo/react-hooks';
import Router, { useRouter } from 'next/router';

import type { ThingConfig } from '../../flowTypes';

import GeneralConfigContext from '../GeneralConfigContext';
import createExportFile from '../../client/utils/createExportFile';
import composeMutation from '../../client/mutations/composeMutation';
import composeQuery from '../../client/queries/composeQuery';
import { ThingListContext } from '../ThingListContext';
import arrangeListColumns from './arrangeListColumns';
import Link from '../Link';
import VirtualizedTable from '../VirtualizedTable';
import composeFilters from './composeFilters';

const useStyles = makeStyles(() => ({
  button: { marginRight: '0.5em' },
  exportImportContainer: { marginTop: '1em' },
  formControl: { marginRight: '1em' },
  inputLabel: { position: 'static', marginBottom: '-0.5em' },
}));

type Props = { thingConfig: ThingConfig };

const ThingList: React.StatelessFunctionalComponent<Props> = (props: Props) => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const { pathname } = router;
  const {
    thingConfig,
    thingConfig: { list, name },
  } = props;

  const {
    dispatch,
    state,
    state: { config, loading, outdated, filtered, filters, error },
  } = React.useContext(ThingListContext);

  React.useEffect(() => {
    if (config !== thingConfig || outdated) {
      dispatch({ type: 'LOAD', config: thingConfig });
    }
  }, [dispatch, config, outdated, thingConfig]);

  const generalConfig = React.useContext(GeneralConfigContext);

  const handleExport = React.useCallback(
    async (format: 'csv' | 'json') => {
      if (!config) return; // to prevent flowjs warnings
      const query = gql(composeQuery('things', config, generalConfig));
      const where = Object.keys(filters).reduce((prev, key) => {
        // $FlowFixMe
        const { enumeration, fieldVariant, value } = filters[key];
        if (value === 'all') return prev;
        if (fieldVariant === 'booleanField') {
          prev[key] = value; // eslint-disable-line no-param-reassign
        } else {
          // $FlowFixMe
          prev[key] = value.count() ? value.select(enumeration)[0] : null; // eslint-disable-line no-param-reassign
        }
        return prev;
      }, {});
      const variables = { where };
      const { name: thingName } = config;
      const queryName = pluralize(thingName);
      const {
        data: { [queryName]: items },
      } = await apolloClient.query({ query, variables });

      createExportFile(items, config, { format });
    },
    [apolloClient, config, generalConfig, filters],
  );

  const handleImport = React.useCallback(
    async (files, format) => {
      if (files && files.length) {
        if (!config) return; // to prevent flowjs warnings
        const mutation = gql(composeMutation('importThings', config, generalConfig));
        try {
          const variables = { file: files[0], options: { format } };
          await apolloClient.mutate({ mutation, variables });
          await apolloClient.clearStore();
          dispatch({ type: 'OUTDATE' });
        } catch (err) {
          const { message } = err;
          dispatch({ type: 'ERROR', value: message });
        }
      }
    },
    [apolloClient, config, dispatch, generalConfig],
  );

  const columns = (list || arrangeListColumns(thingConfig)).map(({ name: fieldName, width }) => ({
    dataKey: fieldName,
    label: fieldName,
    width,
  }));

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

  let resultChild = null;
  if (loading) {
    resultChild = 'Loading...';
  } else if (error) {
    resultChild = (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!error}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{error}</span>}
      />
    );
  } else {
    resultChild = (
      <div>
        <VirtualizedTable
          columns={columns2}
          router={router}
          rowCount={filtered.length}
          rowGetter={({ index }) => filtered[index]}
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
  }

  const classes = useStyles();

  return (
    <Container>
      <h1>{`All ${pluralize(name)}`}</h1>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Link href={pathname}>All Things</Link>
        <Typography color="textPrimary">{`${pluralize(name)} (${filtered.length})`}</Typography>
      </Breadcrumbs>
      <div>{composeFilters(state, dispatch, classes)}</div>
      <div className={classes.exportImportContainer}>
        <Button
          className={classes.button}
          component="span"
          onClick={() => handleExport('csv')}
          variant="outlined"
        >
          Export to CSV
        </Button>
        <Button
          className={classes.button}
          component="span"
          onClick={() => handleExport('json')}
          variant="outlined"
        >
          Export to JSON
        </Button>
        <label htmlFor="contained-button-CSV-file">
          <Button className={classes.button} component="span" variant="outlined">
            Import from CSV
          </Button>
          <input
            accept=".csv"
            id="contained-button-CSV-file"
            onChange={({ target: { files } }) => handleImport(files, 'csv')}
            multiple
            type="file"
            hidden
          />
        </label>
        <label htmlFor="contained-button-JSON-file">
          <Button className={classes.button} component="span" variant="outlined">
            Import from JSON
          </Button>
          <input
            accept="*.json,application/json"
            id="contained-button-JSON-file"
            onChange={({ target: { files } }) => handleImport(files, 'json')}
            multiple
            type="file"
            hidden
          />
        </label>
      </div>
      <NoSsr>{resultChild}</NoSsr>
    </Container>
  );
};

export default ThingList;
