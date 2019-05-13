// @flow
import type { GeneralConfig, Subscribe, ThingConfig } from '../../flowTypes';

const { withFilter } = require('graphql-subscriptions');

const checkInventory = require('../../utils/checkInventory');
const createUpdatedThingFilter = require('./createUpdatedThingFilter');

const createUpdatedThingSubscriptionResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  if (
    !checkInventory(['Mutation', 'updateThing', name], inventory) ||
    !checkInventory(['Subscription', 'updatedThing', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: withFilter((_, args, { pubsub }) => {
      return pubsub.asyncIterator(`updated-${name}`);
    }, createUpdatedThingFilter(thingConfig)),
  };

  return resolver;
};

module.exports = createUpdatedThingSubscriptionResolver;
