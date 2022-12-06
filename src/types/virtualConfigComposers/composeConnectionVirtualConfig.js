// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

const composeConnectionVirtualConfig = (
  config: EntityConfig,
  generalConfig: GeneralConfig,
  prefix?: string, // eslint-disable-line no-unused-vars
): EntityConfig => {
  const { name, type: configType = 'tangible' } = config;

  if (configType !== 'tangible' && configType !== 'tangibleFile') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Connection" virtual config!`,
    );
  }

  const {
    entityConfigs: { PageInfo, [`${name}Edge`]: edgeConfig },
  } = generalConfig;

  return {
    name: `${name}Connection`,
    type: 'virtual',

    childFields: [
      { name: 'pageInfo', config: PageInfo, required: true },
      { name: 'edges', config: edgeConfig, array: true },
    ],
  };
};

export default composeConnectionVirtualConfig;
