// @flow

import React from 'react';
import { useRouter } from 'next/router';

import type { GeneralConfig } from '../../flowTypes';

import AllThings from './AllThings';
import ThingForm from './ThingForm';
import ThingList from './ThingList';
import GeneralAdminContext from './GeneralAdminContext';

type Props = { generalConfig: GeneralConfig };

const Admin = (props: Props) => {
  const {
    query: { create, id, thing },
  } = useRouter();
  const {
    generalConfig,
    generalConfig: { thingConfigs },
  } = props;

  const thingConfig = thingConfigs.find(({ name }) => name === thing);

  let resultChild;
  if (!thingConfig) {
    resultChild = <AllThings generalConfig={generalConfig} />;
  } else if (id || create || create === '') {
    resultChild = <ThingForm thingConfig={thingConfig} generalConfig={generalConfig} />;
  } else {
    resultChild = <ThingList thingConfig={thingConfig} />;
  }
  return (
    <GeneralAdminContext.Provider value={generalConfig}>{resultChild}</GeneralAdminContext.Provider>
  );
};

export default Admin;
