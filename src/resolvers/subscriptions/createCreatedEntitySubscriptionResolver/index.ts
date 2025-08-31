import type { GeneralConfig, Subscription, EntityConfig, ServersideConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const store = Object.create(null);

const createCreatedEntitySubscriptionResolver = (
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

  const descendantKey = originalOrCustomName.slice('createdEntity'.length);

  const entityConfig = descendantKey
    ? composeDescendantConfigByName(descendantKey, preEntityConfig, generalConfig)
    : preEntityConfig;

  store[storeKey] = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`created-${name}`),
        (payload) => {
          // const { where } = mergeWhereAndFilter(filter, args.where || {}, entityConfig);

          return true;
        },
        (payload) => {
          const { [`created${name}`]: item } = payload as Record<string, any>;

          return {
            [`created${name}${descendantKey}`]: transformAfter(
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

export default createCreatedEntitySubscriptionResolver;
