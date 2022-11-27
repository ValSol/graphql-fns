// @flow

import { withFilter } from 'graphql-subscriptions';

import type { GeneralConfig, Subscribe, EntityConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createDeletedEntityFilter from './createDeletedEntityFilter';

const createDeletedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): Function | null => {
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
      (_, args, { pubsub }) => pubsub.asyncIterator(`deleted-${name}`),
      createDeletedEntityFilter(entityConfig),
    ),
  };

  return resolver;
};

export default createDeletedEntitySubscriptionResolver;
