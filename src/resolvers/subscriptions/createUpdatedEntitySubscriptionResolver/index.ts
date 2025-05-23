import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, EntityConfig } from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createUpdatedEntityFilter from './createUpdatedEntityFilter';

const createUpdatedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;
  if (
    !checkInventory(['Mutation', 'updateEntity', name], inventory) ||
    !checkInventory(['Subscription', 'updatedEntity', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: withFilter(
      (_, args, { pubsub }) => pubsub.asyncIterableIterator(`updated-${name}`),
      createUpdatedEntityFilter(entityConfig),
    ),
  };

  return resolver;
};

export default createUpdatedEntitySubscriptionResolver;
