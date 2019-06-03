// @flow

import React from 'react';
import Container from '@material-ui/core/Container';

import type { GeneralConfig } from '../../flowTypes';

import ThingCard from './ThingCard';

type Props = { generalConfig: GeneralConfig, router: Object };

const AllThings = (props: Props) => {
  const {
    generalConfig,
    generalConfig: { thingConfigs },
    router,
  } = props;

  return (
    <Container>
      <h1>All things</h1>
      {thingConfigs
        .filter(({ embedded }) => !embedded)
        .map(config => (
          <ThingCard
            key={config.name}
            config={config}
            generalConfig={generalConfig}
            router={router}
          />
        ))}
    </Container>
  );
};

export default AllThings;
