import type { VirtualConfigComposer, VirtualEntityConfig } from '@/tsTypes';

import composeUpdatedPayloadVirtualConfigName from './composeUpdatedPayloadVirtualConfigName';

const composeUpdatedPayloadVirtualConfig: VirtualConfigComposer = (config, generalConfig) => {
  const { name, type: configType = 'tangible' } = config;

  if (configType === 'virtual') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "UpdatedPayload" virtual config!`,
    );
  }

  return {
    name: composeUpdatedPayloadVirtualConfigName(name),
    type: 'virtual',
    descendantNameSlicePosition: -'UpdatedPayload'.length,

    childFields: [
      { name: 'node', config, required: true, type: 'childFields' },
      { name: 'previousNode', config, required: true, type: 'childFields' },
    ],

    textFields: [{ name: 'updatedFields', array: true, type: 'textFields' }],
  } as VirtualEntityConfig;
};

export default composeUpdatedPayloadVirtualConfig;
