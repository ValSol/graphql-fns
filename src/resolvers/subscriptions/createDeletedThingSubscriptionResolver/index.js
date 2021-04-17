// @flow

import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createDeletedThingFilter from './createDeletedThingFilter';

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
    subscribe: withFilter(
      (_, args, { pubsub }) => pubsub.asyncIterator(`deleted-${name}`),
      createDeletedThingFilter(thingConfig),
    ),
  };

  return resolver;
};

export default createDeletedThingSubscriptionResolver;
