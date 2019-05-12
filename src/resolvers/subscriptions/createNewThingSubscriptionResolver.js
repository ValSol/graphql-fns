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
    subscribe: (parent, args, { pubsub }) => {
      console.log('******************************');
      console.log('parent =', parent);
      console.log('args =', args);
      console.log('******************************');
      return pubsub.asyncIterator(`new-${name}`);
    },
  };

  return resolver;
};

module.exports = createNewThingSubscriptionResolver;
