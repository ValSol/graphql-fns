import mingo from 'mingo';

import type { GeneralConfig, Subscription, EntityConfig, ServersideConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const store = Object.create(null);

const createUpdatedEntitySubscriptionResolver = (
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

  const descendantKey = originalOrCustomName.slice('updatedEntity'.length);

  const entityConfig = descendantKey
    ? composeDescendantConfigByName(descendantKey, preEntityConfig, generalConfig)
    : preEntityConfig;

  store[storeKey] = {
    subscribe: (_, args, context, info, resolverOptions) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`updated-${name}`),

        (payload) => {
          const { involvedFilters, subscribePayloadMongoFilter } = resolverOptions;

          if (!involvedFilters || !subscribePayloadMongoFilter) {
            return false;
          }

          const query = new mingo.Query(subscribePayloadMongoFilter);

          return query.test(payload[`updated${name}`].previousNode);
        },

        (payload) => {
          const {
            [`updated${name}`]: { node, previousNode, updatedFields },
          } = payload as Record<string, any>;

          return {
            [`updated${name}${descendantKey}`]: {
              node: transformAfter({}, node, entityConfig, generalConfig),
              previousNode: transformAfter({}, previousNode, entityConfig, generalConfig),
              updatedFields,
            },
          };
        },
      ),
  };

  return store[storeKey];
};

export default createUpdatedEntitySubscriptionResolver;
