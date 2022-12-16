// @flow

import type { VirtualConfigComposer } from '../../flowTypes';

import composeEdgeVirtualConfigName from './composeEdgeVirtualConfigName';

const composeEdgeVirtualConfig: VirtualConfigComposer = (
  config,
  generalConfig, // eslint-disable-line no-unused-vars
) => {
  const { name, type: configType = 'tangible' } = config;

  if (configType !== 'tangible' && configType !== 'tangibleFile') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Edge" virtual config!`,
    );
  }

  return {
    name: composeEdgeVirtualConfigName(name),
    type: 'virtual',
    derivativeNameSlicePosition: -'Edge'.length,

    childFields: [{ name: 'node', config }],

    textFields: [{ name: 'cursor', required: true }],
  };
};

export default composeEdgeVirtualConfig;
