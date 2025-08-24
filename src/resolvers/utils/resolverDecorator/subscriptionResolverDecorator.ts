import type {
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  ThreeSegmentInventoryChain,
} from '@/tsTypes';

import authDecorator from './authDecorator';

const subscriptionResolverDecorator = (
  subscribeObject: { subscribe: any },
  inventoryChain: ThreeSegmentInventoryChain,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { subscribe } = subscribeObject;

  const involvedEntityNames = { inputOutputEntity: entityConfig.name };

  return {
    subscribe: authDecorator(
      subscribe,
      inventoryChain,
      involvedEntityNames,
      generalConfig,
      serversideConfig,
    ),
  };
};

export default subscriptionResolverDecorator;
