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
    const involvedFilters = await executeAuthorisation(
      inventoryChain,
      involvedEntityNames,
      args,
      context,
      generalConfig,
      serversideConfig,
    );
    if (!involvedFilters) return null;

    const result = await func(parent, args, context, info, { involvedFilters });
    return result;
  };

export default authDecorator;
