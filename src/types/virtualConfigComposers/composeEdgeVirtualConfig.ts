import type { VirtualConfigComposer, VirtualEntityConfig } from '../../tsTypes';

import composeEdgeVirtualConfigName from './composeEdgeVirtualConfigName';

const composeEdgeVirtualConfig: VirtualConfigComposer = (
  config,
  generalConfig, // eslint-disable-line no-unused-vars
) => {
  const { name, type: configType = 'tangible' } = config;

  if (configType === 'virtual') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Edge" virtual config!`,
    );
  }

  return {
    name: composeEdgeVirtualConfigName(name),
    type: 'virtual',
    derivativeNameSlicePosition: -'Edge'.length,

    childFields: [{ name: 'node', config, type: 'childFields' }],

    textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
  } as VirtualEntityConfig;
};

export default composeEdgeVirtualConfig;
