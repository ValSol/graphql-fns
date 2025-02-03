import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, EntityConfig } from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createDeletedEntityFilter from './createDeletedEntityFilter';

const createDeletedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;
  if (
    !checkInventory(['Mutation', 'deleteEntity', name], inventory) ||
    !checkInventory(['Subscription', 'deletedEntity', name], inventory)
  ) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: withFilter(
      (_, args, { pubsub }) => pubsub.asyncIterableIterator(`deleted-${name}`),
      createDeletedEntityFilter(entityConfig),
    ),
  };

  return resolver;
};

export default createDeletedEntitySubscriptionResolver;
