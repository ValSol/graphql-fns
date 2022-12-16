// @flow

import type { VirtualConfigComposer } from '../../flowTypes';

import composeConnectionVirtualConfigName from './composeConnectionVirtualConfigName';

const composeConnectionVirtualConfig: VirtualConfigComposer = (config, generalConfig) => {
  const { name, type: configType = 'tangible' } = config;

  if (configType !== 'tangible' && configType !== 'tangibleFile') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Connection" virtual config!`,
    );
  }

  const {
    allEntityConfigs: { PageInfo, [`${name}Edge`]: edgeConfig },
  } = generalConfig;

  return {
    name: composeConnectionVirtualConfigName(name),
    type: 'virtual',
    derivativeNameSlicePosition: -'Connection'.length,

    childFields: [
      { name: 'pageInfo', config: PageInfo, required: true },
      { name: 'edges', config: edgeConfig, array: true },
    ],
  };
};

export default composeConnectionVirtualConfig;
