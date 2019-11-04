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

import Router, { useRouter } from 'next/router';

import type { ThingConfig } from '../../flowTypes';

import { ThingListContext } from '../ThingListContext';
import arrangeListColumns from './arrangeListColumns';
import Link from '../Link';
import VirtualizedTable from '../VirtualizedTable';

type Props = { thingConfig: ThingConfig };

function ThingList(props: Props) {
  const router = useRouter();
  const { pathname } = router;
  const {
    thingConfig,
    thingConfig: { list, name },
  } = props;

  const {
    dispatch,
    state: { config, loading, outdated, filtered, error },
  } = React.useContext(ThingListContext);

  React.useEffect(() => {
    if (config !== thingConfig || outdated) {
      dispatch({ type: 'LOAD', config: thingConfig });
    }
  }, [dispatch, config, outdated, thingConfig]);

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

  return (
    <Container>
      <h1>{`All ${pluralize(name)}`}</h1>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Link href={pathname}>All Things</Link>
        <Typography color="textPrimary">{`All ${pluralize(name)}`}</Typography>
      </Breadcrumbs>

      <NoSsr>{resultChild}</NoSsr>
    </Container>
  );
}

export default ThingList;
