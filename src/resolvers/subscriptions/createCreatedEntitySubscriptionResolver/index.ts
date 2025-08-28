import type { GeneralConfig, Subscribe, EntityConfig, ServersideConfig } from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const createCreatedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  if (!checkInventory(['Subscription', 'createdEntity', name], inventory)) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`created-${name}`),
        (payload) => {
          // const { where } = mergeWhereAndFilter(filter, args.where || {}, entityConfig);

          return true;
        },
        (payload) => {
          const { [`created${name}`]: item } = payload as Record<string, any>;

          return { [`created${name}`]: transformAfter({}, item, entityConfig, generalConfig) };
        },
      ),
  };

  return resolver;
};

export default createCreatedEntitySubscriptionResolver;
