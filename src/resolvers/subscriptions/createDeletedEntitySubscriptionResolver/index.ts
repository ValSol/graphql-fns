import type { GeneralConfig, Subscribe, EntityConfig } from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import withFilterAndTransformer from '../withFilterAndTransformer';
import createDeletedEntityFilter from './createDeletedEntityFilter';

const createDeletedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;
  if (!checkInventory(['Subscription', 'deletedEntity', name], inventory)) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(context.pubsub.subscribe(`deleted-${name}`), (payload) => {
        console.log('payload =', payload);

        return true;
      }),
  };

  return resolver;
};

export default createDeletedEntitySubscriptionResolver;
