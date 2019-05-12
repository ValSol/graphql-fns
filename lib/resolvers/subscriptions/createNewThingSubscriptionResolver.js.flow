// @flow
import type { GeneralConfig, Subscribe, ThingConfig } from '../../flowTypes';

const checkInventory = require('../../utils/checkInventory');

const createNewThingSubscriptionResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  if (
    !checkInventory(['Mutation', 'createThing', name], inventory) ||
    !checkInventory(['Subscription', 'newThing', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, { pubsub }) => pubsub.asyncIterator(`new-${name}`),
  };

  return resolver;
};

module.exports = createNewThingSubscriptionResolver;
