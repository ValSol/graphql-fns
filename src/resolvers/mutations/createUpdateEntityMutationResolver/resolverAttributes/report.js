// @flow

import type { Report } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import addIdsToEntity from '../../../utils/addIdsToEntity';
import executeAuthorisation from '../../../utils/executeAuthorisation';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context } = resolverArg;
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const { data } = args;

  const subscriptionInventoryChain = ['Subscription', 'updatedEntity', name];
  const allowSubscription =
    checkInventory(subscriptionInventoryChain, inventory) ||
    (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig));

  const result = allowSubscription
    ? ({ previous: [previous], current: [current] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        const updatedFields = Object.keys(data);

        const payload = {
          node: current,
          previousNode: addIdsToEntity(previous, entityConfig),
          updatedFields,
        };
        pubsub.publish(`updated-${name}`, { [`updated${name}`]: payload });
      }
    : null;

  return result;
};

export default report;
