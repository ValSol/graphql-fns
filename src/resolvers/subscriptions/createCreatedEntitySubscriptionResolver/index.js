// @flow

import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, EntityConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createCreatedEntityFilter from './createCreatedEntityFilter';

const createCreatedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;
  if (
    !checkInventory(['Mutation', 'createEntity', name], inventory) ||
    !checkInventory(['Subscription', 'createdEntity', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: withFilter(
      (_, args, { pubsub }) => pubsub.asyncIterator(`created-${name}`),
      createCreatedEntityFilter(entityConfig),
    ),
  };

  return resolver;
};

export default createCreatedEntitySubscriptionResolver;
