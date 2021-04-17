// @flow

import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createUpdatedThingFilter from './createUpdatedThingFilter';

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
    subscribe: withFilter(
      (_, args, { pubsub }) => pubsub.asyncIterator(`updated-${name}`),
      createUpdatedThingFilter(thingConfig),
    ),
  };

  return resolver;
};

export default createUpdatedThingSubscriptionResolver;
