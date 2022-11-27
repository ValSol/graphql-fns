// @flow

import type { Report } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../../utils/executeAuthorisation';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { context } = resolverArg;
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const subscriptionInventoryChain = ['Subscription', 'deletedEntity', name];
  const allowSubscription =
    checkInventory(subscriptionInventoryChain, inventory) ||
    (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig));

  const result = allowSubscription
    ? ({ previous: [previous] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        pubsub.publish(`deleted-${name}`, { [`deleted${name}`]: previous });
      }
    : null;

  return result;
};

export default report;
