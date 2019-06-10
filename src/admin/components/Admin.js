// @flow

import React from 'react';
import { withRouter } from 'next/router';

import type { GeneralConfig, RouterQuery } from '../../flowTypes';

import AllThings from './AllThings';
import ThingForm from './ThingForm';
import ThingList from './ThingList';

type Props = { generalConfig: GeneralConfig };
type ProvidedProps = {
  router: { pathname: string, query: RouterQuery },
};

const Admin = (props: Props & ProvidedProps) => {
  const {
    generalConfig,
    generalConfig: { thingConfigs },
    router,
    router: {
      query: { create, id, thing },
    },
  } = props;

  const thingConfig = thingConfigs.find(({ name }) => name === thing);

  if (!thingConfig) {
    return <AllThings router={router} generalConfig={generalConfig} />;
  }

  if (id || create || create === '') {
    return <ThingForm router={router} thingConfig={thingConfig} generalConfig={generalConfig} />;
  }

  return <ThingList router={router} thingConfig={thingConfig} />;
};

export default withRouter(Admin);
