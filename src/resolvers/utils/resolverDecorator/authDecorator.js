// @flow

import type {
  GeneralConfig,
  ThreeSegmentInventoryChain,
  ServersideConfig,
} from '../../../flowTypes';

import executeAuthorisation from '../executeAuthorisation';

const authDecorator =
  (
    func: Function,
    inventoryChain: ThreeSegmentInventoryChain,
    involvedEntityNames: { [key: string]: string },
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): Function =>
  async (...argarray) => {
    const [parent, args, context, info] = argarray;
    const filter = await executeAuthorisation(
      inventoryChain,
      involvedEntityNames,
      context,
      generalConfig,
      serversideConfig,
    );
    if (!filter) return null;

    const result = await func(parent, args, context, info, filter);
    return result;
  };

export default authDecorator;
