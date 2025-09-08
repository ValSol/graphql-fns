import type {
  EmbeddedField,
  TangibleEntityConfig,
  VirtualConfigComposer,
  VirtualEntityConfig,
} from '@/tsTypes';

import composeFieldsObject from '@/utils/composeFieldsObject';
import composeCreatedOrDeletedPayloadVirtualConfigName from './composeCreatedOrDeletedPayloadVirtualConfigName';
import checkSubscriptionActorConfig from './checkSubscriptionActorConfig';

const composeCreatedOrDeletedPayloadVirtualConfig: VirtualConfigComposer = (
  config,
  generalConfig,
) => {
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

  const childFields = [{ name: 'node', config, required: true, type: 'childFields' }];

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
    name: composeCreatedOrDeletedPayloadVirtualConfigName(name),
    type: 'virtual',
    descendantNameSlicePosition: -'CreatedOrDeletedPayload'.length,

    childFields,
  } as VirtualEntityConfig;
};

export default composeCreatedOrDeletedPayloadVirtualConfig;
