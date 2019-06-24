// @flow

import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createNewThingFilter from './createNewThingFilter';

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
    subscribe: withFilter((_, args, { pubsub }) => {
      return pubsub.asyncIterator(`new-${name}`);
    }, createNewThingFilter(thingConfig)),
  };

  return resolver;
};

export default createNewThingSubscriptionResolver;
