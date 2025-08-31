import type { GeneralConfig, Subscription, EntityConfig, ServersideConfig } from '../../../tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const store = Object.create(null);

const createDeletedEntitySubscriptionResolver = (
  originalOrCustomName: string,
  preEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | { subscribe: Subscription } => {
  const { inventory } = generalConfig;
  const { name } = preEntityConfig;

  if (!checkInventory(['Subscription', originalOrCustomName, name], inventory)) {
    return null;
  }

  const storeKey = `${originalOrCustomName}:${name}`;

  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  const descendantKey = originalOrCustomName.slice('deletedEntity'.length);

  const entityConfig = descendantKey
    ? composeDescendantConfigByName(descendantKey, preEntityConfig, generalConfig)
    : preEntityConfig;

  store[storeKey] = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`deleted-${name}`),
        (payload) => {
          // const { where } = mergeWhereAndFilter(filter, args.where || {}, entityConfig);

          return true;
        },
        (payload) => {
          const { [`deleted${name}`]: item } = payload as Record<string, any>;

          return {
            [`deleted${name}${descendantKey}`]: transformAfter(
              {},
              item,
              entityConfig,
              generalConfig,
            ),
          };
        },
      ),
  };

  return store[storeKey];
};

export default createDeletedEntitySubscriptionResolver;
