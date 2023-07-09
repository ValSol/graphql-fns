import type { GeneralConfig, ThreeSegmentInventoryChain, ServersideConfig } from '../../../tsTypes';

import executeAuthorisation from '../executeAuthorisation';

const authDecorator =
  (
    func: any,
    inventoryChain: ThreeSegmentInventoryChain,
    involvedEntityNames: {
      [key: string]: string;
    },
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): any =>
  async (...argarray) => {
    const [parent, args, context, info] = argarray;
    const filter = await executeAuthorisation(
      inventoryChain,
      involvedEntityNames,
      args,
      context,
      generalConfig,
      serversideConfig,
    );
    if (!filter) return null;

    const result = await func(parent, args, context, info, filter);
    return result;
  };

export default authDecorator;
