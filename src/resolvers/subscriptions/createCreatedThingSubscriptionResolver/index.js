// @flow

import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createCreatedThingFilter from './createCreatedThingFilter';

const createCreatedThingSubscriptionResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  if (
    !checkInventory(['Mutation', 'createThing', name], inventory) ||
    !checkInventory(['Subscription', 'createdThing', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: withFilter(
      (_, args, { pubsub }) => pubsub.asyncIterator(`created-${name}`),
      createCreatedThingFilter(thingConfig),
    ),
  };

  return resolver;
};

export default createCreatedThingSubscriptionResolver;
