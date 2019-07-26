// @flow

import React from 'react';
import { useRouter } from 'next/router';

import type { GeneralConfig } from '../flowTypes';

import AllThings from './AllThings';
import ThingForm from './ThingForm';
import ThingList from './ThingList';
import GeneralConfigContext from './GeneralConfigContext';
import { ThingListProvider } from './ThingListContext';

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
    resultChild = (
      <ThingListProvider>
        <ThingForm thingConfig={thingConfig} />
      </ThingListProvider>
    );
  } else {
    resultChild = (
      <ThingListProvider>
        <ThingList thingConfig={thingConfig} />
      </ThingListProvider>
    );
  }
  return (
    <GeneralConfigContext.Provider value={generalConfig}>
      {resultChild}
    </GeneralConfigContext.Provider>
  );
};

export default Admin;
