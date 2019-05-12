// @flow
import type { GeneralConfig, Subscribe, ThingConfig } from '../../flowTypes';

const { withFilter } = require('graphql-subscriptions');

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
    subscribe: withFilter(
      (_, args, { pubsub }) => {
        console.log('********************');
        console.log('args =', args);
        console.log('********************');
        return pubsub.asyncIterator(`new-${name}`);
      },
      (payload, variables) => {
        console.log('=======================');
        console.log('payload =', payload);
        console.log('variables =', variables);
        console.log('=======================');
        return true;
      },
    ),
  };

  return resolver;
};

module.exports = createNewThingSubscriptionResolver;
