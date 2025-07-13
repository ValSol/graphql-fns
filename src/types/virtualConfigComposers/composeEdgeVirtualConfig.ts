import type { VirtualConfigComposer, VirtualEntityConfig } from '../../tsTypes';

import composeEdgeVirtualConfigName from './composeEdgeVirtualConfigName';

const composeEdgeVirtualConfig: VirtualConfigComposer = (config, generalConfig) => {
  const { name, type: configType = 'tangible' } = config;

  if (configType === 'virtual') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Edge" virtual config!`,
    );
  }

  return {
    name: composeEdgeVirtualConfigName(name),
    type: 'virtual',
    descendantNameSlicePosition: -'Edge'.length,

    childFields: [{ name: 'node', config, required: true, type: 'childFields' }],

    textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
  } as VirtualEntityConfig;
};

export default composeEdgeVirtualConfig;
