// @flow
import type { GeneralConfig, Subscribe, ThingConfig } from '../../flowTypes';

const { withFilter } = require('graphql-subscriptions');

const checkInventory = require('../../utils/checkInventory');
const createDeletedThingFilter = require('./createDeletedThingFilter');

const createDeletedThingSubscriptionResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  if (
    !checkInventory(['Mutation', 'deleteThing', name], inventory) ||
    !checkInventory(['Subscription', 'deletedThing', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: withFilter((_, args, { pubsub }) => {
      return pubsub.asyncIterator(`deleted-${name}`);
    }, createDeletedThingFilter(thingConfig)),
  };

  return resolver;
};

module.exports = createDeletedThingSubscriptionResolver;
