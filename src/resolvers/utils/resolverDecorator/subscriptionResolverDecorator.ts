import type {
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  ThreeSegmentInventoryChain,
} from '@/tsTypes';

import authDecorator from './authDecorator';
import transformWhere from './transformBefore/transformWhere';

const subscriptionResolverDecorator = (
  subscribeObject: { subscribe: any },
  inventoryChain: ThreeSegmentInventoryChain,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { subscribe: preSubscribe } = subscribeObject;

  const involvedEntityNames = { inputOutputEntity: entityConfig.name };

  const subscribe = async (...resolverArgs) => {
    const [parent, args, ...rest] = resolverArgs;

    const { where: preWherePayload = {} } = args;

    const where = transformWhere(preWherePayload, entityConfig);

    return await authDecorator(
      preSubscribe,
      inventoryChain,
      involvedEntityNames,
      generalConfig,
      serversideConfig,
    )(parent, { ...args, where }, ...rest);
  };

  return { subscribe };
};

export default subscriptionResolverDecorator;
