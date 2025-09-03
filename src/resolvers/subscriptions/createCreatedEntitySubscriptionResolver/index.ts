import mingo from 'mingo';

import type { GeneralConfig, Subscription, EntityConfig, ServersideConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
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
    subscribe: (_, args, context, info, resolverOptions) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`created-${name}`),

        (payload) => {
          const { involvedFilters, subscribePayloadMongoFilter } = resolverOptions;

          if (!involvedFilters || !subscribePayloadMongoFilter) {
            return false;
          }

          const query = new mingo.Query(subscribePayloadMongoFilter);

          return query.test(payload[`created${name}`]);
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
