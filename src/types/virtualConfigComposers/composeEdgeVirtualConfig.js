// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

const composeEdgeVirtualConfig = (
  config: EntityConfig,
  generalConfig: GeneralConfig, // eslint-disable-line no-unused-vars
  prefix?: string, // eslint-disable-line no-unused-vars
): EntityConfig => {
  const { name, type: configType = 'tangible' } = config;

  if (configType !== 'tangible' && configType !== 'tangibleFile') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Edge" virtual config!`,
    );
  }

  return {
    name: `${name}Edge`,
    type: 'virtual',

    childFields: [{ name: 'node', config }],

    textFields: [{ name: 'cursor', required: true }],
  };
};

export default composeEdgeVirtualConfig;
