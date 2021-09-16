// @flow

import type { Report } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../../utils/executeAuthorisation';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { context } = resolverArg;
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const subscriptionInventoryChain = ['Subscription', 'createdThing', name];
  const allowSubscription =
    checkInventory(subscriptionInventoryChain, inventory) ||
    (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig));

  const result = allowSubscription
    ? ({ current: [current] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        pubsub.publish(`created-${name}`, { [`created${name}`]: current });
      }
    : null;

  return result;
};

export default report;
