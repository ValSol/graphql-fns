import type {
  GeneralConfig,
  ThreeSegmentInventoryChain,
  ServersideConfig,
  ActionInvolvedEntityNames,
} from '@/tsTypes';

import executeAuthorisation from '../executeAuthorisation';

const authDecorator =
  (
    func: any,
    inventoryChain: ThreeSegmentInventoryChain,
    involvedEntityNames: ActionInvolvedEntityNames,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): any =>
  async (...argarray) => {
    const [parent, args, context, info] = argarray;
    const { involvedFilters, subscriptionEntityNames, subscribePayloadMongoFilter } =
      await executeAuthorisation(
        inventoryChain,
        involvedEntityNames,
        args,
        context,
        generalConfig,
        serversideConfig,
      );
    if (!involvedFilters) return null;

    const [actionType] = inventoryChain;

    const result = await func(
      parent,
      args,
      context,
      info,
      actionType === 'Subscription'
        ? { involvedFilters, subscribePayloadMongoFilter }
        : subscriptionEntityNames
          ? { involvedFilters, subscriptionEntityNames }
          : { involvedFilters },
    );
    return result;
  };

export default authDecorator;
