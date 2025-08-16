import type { GeneralConfig, Subscribe, EntityConfig } from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import withFilterAndTransformer from '../withFilterAndTransformer';

const createUpdatedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;
  if (!checkInventory(['Subscription', 'updatedEntity', name], inventory)) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, context, info, involvedFilters) =>
      withFilterAndTransformer(context.pubsub.subscribe(`updated-${name}`), (payload) => {
        const { where } = args;

        return true;
      }),
  };

  return resolver;
};

export default createUpdatedEntitySubscriptionResolver;
