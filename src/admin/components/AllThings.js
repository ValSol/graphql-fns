// @flow

import React from 'react';
import Container from '@material-ui/core/Container';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';

import type { GeneralConfig } from '../../flowTypes';

import GeneralConfigContext from './GeneralConfigContext';
import Link from './Link';
import ThingCard from './ThingCard';

const AllThings = () => {
  const generalConfig: GeneralConfig = React.useContext(GeneralConfigContext);

  const { thingConfigs } = generalConfig;

  return (
    <Container>
      <h1>All things</h1>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Typography color="textPrimary">All Things</Typography>
      </Breadcrumbs>
      {thingConfigs
        .filter(({ embedded }) => !embedded)
        .map(config => (
          <ThingCard key={config.name} config={config} />
        ))}
    </Container>
  );
};

export default AllThings;
