// @flow

import type { ThreeSegmentInventoryChain, ServersideConfig } from '../../../flowTypes';

import executeAuthorisation from '../executeAuthorisation';

const authDecorator =
  (
    func: Function,
    inventoryChain: ThreeSegmentInventoryChain,
    serversideConfig: ServersideConfig,
  ): Function =>
  async (...argarray) => {
    const [parent, args, context, info] = argarray;
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const result = await func(parent, args, context, info, filter);
    return result;
  };

export default authDecorator;
