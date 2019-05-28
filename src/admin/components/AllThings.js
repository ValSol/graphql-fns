// @flow

import React from 'react';
import Container from '@material-ui/core/Container';

import type { GeneralConfig } from '../../flowTypes';

type Props = { generalConfig: GeneralConfig };

const AllThings = (props: Props) => {
  const {
    generalConfig: { thingConfigs },
  } = props;

  return (
    <Container>
      <h1>All things</h1>
      {thingConfigs.map(({ name }) => (
        <h2 key={name}>{name}</h2>
      ))}
    </Container>
  );
};

export default AllThings;
