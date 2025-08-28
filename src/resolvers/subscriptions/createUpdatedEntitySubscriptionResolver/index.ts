import type { GeneralConfig, Subscribe, EntityConfig, ServersideConfig } from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const createUpdatedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  if (!checkInventory(['Subscription', 'updatedEntity', name], inventory)) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`updated-${name}`),
        (payload) => {
          // const { where } = mergeWhereAndFilter(filter, args.where || {}, entityConfig);

          return true;
        },
        (payload) => {
          const {
            [`updated${name}`]: { node, previousNode, updatedFields },
          } = payload as Record<string, any>;

          return {
            [`updated${name}`]: {
              node: transformAfter({}, node, entityConfig, generalConfig),
              previousNode: transformAfter({}, previousNode, entityConfig, generalConfig),
              updatedFields,
            },
          };
        },
      ),
  };

  return resolver;
};

export default createUpdatedEntitySubscriptionResolver;
