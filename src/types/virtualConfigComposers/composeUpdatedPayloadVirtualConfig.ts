import type { TangibleEntityConfig, VirtualConfigComposer, VirtualEntityConfig } from '@/tsTypes';

import composeUpdatedPayloadVirtualConfigName from './composeUpdatedPayloadVirtualConfigName';
import composeFieldsObject from '@/utils/composeFieldsObject';
import checkSubscriptionActorConfig from './checkSubscriptionActorConfig';

const composeUpdatedPayloadVirtualConfig: VirtualConfigComposer = (config, generalConfig) => {
  const {
    name,
    type: configType = 'tangible',
    subscriptionActorConfig,
    calculatedFields = [],
  } = config as TangibleEntityConfig;

  if (configType !== 'tangible') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "UpdatedPayload" virtual config!`,
    );
  }

  const childFields = [
    { name: 'node', config, required: true, type: 'childFields' },
    { name: 'previousNode', config, required: true, type: 'childFields' },
  ];

  if (subscriptionActorConfig) {
    checkSubscriptionActorConfig(calculatedFields, subscriptionActorConfig);

    childFields.push({
      name: 'actor',
      config: subscriptionActorConfig,
      required: false,
      type: 'childFields',
    });
  }

  return {
    name: composeUpdatedPayloadVirtualConfigName(name),
    type: 'virtual',
    representationNameSlicePosition: -'UpdatedPayload'.length,

    childFields,

    textFields: [{ name: 'updatedFields', array: true, type: 'textFields' }],
  } as VirtualEntityConfig;
};

export default composeUpdatedPayloadVirtualConfig;
