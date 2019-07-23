// @flow

import React from 'react';
import { useRouter } from 'next/router';

import type { GeneralConfig } from '../../flowTypes';

import AllThings from './AllThings';
import ThingForm from './ThingForm';
import ThingList from './ThingList';
import GeneralConfigContext from './GeneralConfigContext';

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
    resultChild = <AllThings />;
  } else if (id || create || create === '') {
    resultChild = <ThingForm thingConfig={thingConfig} />;
  } else {
    resultChild = <ThingList thingConfig={thingConfig} />;
  }
  return (
    <GeneralConfigContext.Provider value={generalConfig}>
      {resultChild}
    </GeneralConfigContext.Provider>
  );
};

export default Admin;
