import type { GeneralConfig, Subscribe, EntityConfig, ServersideConfig } from '../../../tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const createDeletedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  if (!checkInventory(['Subscription', 'deletedEntity', name], inventory)) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`deleted-${name}`),
        (payload) => {
          // const { where } = mergeWhereAndFilter(filter, args.where || {}, entityConfig);

          return true;
        },
        (payload) => {
          const { [`deleted${name}`]: item } = payload as Record<string, any>;

          return { [`deleted${name}`]: transformAfter({}, item, entityConfig, generalConfig) };
        },
      ),
  };

  return resolver;
};

export default createDeletedEntitySubscriptionResolver;
