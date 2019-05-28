// @flow

import React from 'react';
import Container from '@material-ui/core/Container';

import type { RouterQuery, ThingConfig } from '../../flowTypes';

type Props = { thingConfig: ThingConfig, router: { pathname: string, query: RouterQuery } };

const ThingList = (props: Props) => {
  const {
    thingConfig: { name },
    router: { query },
  } = props;

  console.log('query =', query);

  return (
    <Container>
      <h1>{`${name} List`}</h1>
    </Container>
  );
};

export default ThingList;
