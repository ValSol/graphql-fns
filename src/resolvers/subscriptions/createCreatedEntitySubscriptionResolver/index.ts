import mingo from 'mingo';

import type {
  GeneralConfig,
  Subscription,
  EntityConfig,
  ServersideConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';
import testSubscriptionNode from '../testSubscriptionNode';

const store = Object.create(null);

const createCreatedEntitySubscriptionResolver = (
  originalOrCustomName: string,
  preEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | { subscribe: Subscription } => {
  const { allEntityConfigs, inventory } = generalConfig;
  const { name, subscriptionActorConfig: preSubscriptionActorConfig } =
    preEntityConfig as TangibleEntityConfig;

  if (!checkInventory(['Subscription', originalOrCustomName, name], inventory)) {
    return null;
  }

  const storeKey = `${originalOrCustomName}:${name}`;

  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  const descendantKey = originalOrCustomName.slice('createdEntity'.length);

  const entityConfig = descendantKey
    ? composeDescendantConfigByName(descendantKey, preEntityConfig, generalConfig)
    : preEntityConfig;

  const subscriptionActorConfig =
    preSubscriptionActorConfig &&
    (descendantKey
      ? composeDescendantConfigByName(descendantKey, preSubscriptionActorConfig, generalConfig)
      : preSubscriptionActorConfig);

  store[storeKey] = {
    subscribe: (_, { wherePayload = {} }, context, info, resolverOptions) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`created-${name}`),

        (payload) => {
          const { involvedFilters, subscribePayloadMongoFilter } = resolverOptions;

          if (!involvedFilters || !subscribePayloadMongoFilter) {
            return false;
          }

          return testSubscriptionNode(
            [payload[`created${name}`].node],
            wherePayload,
            subscribePayloadMongoFilter,
            allEntityConfigs[name],
          );
        },

        (payload) => {
          const {
            [`created${name}`]: { actor, node },
          } = payload as Record<string, any>;

          return {
            [`created${name}${descendantKey}`]: {
              actor: actor && transformAfter({}, actor, subscriptionActorConfig, generalConfig),
              node: transformAfter({}, node, entityConfig, generalConfig),
            },
          };
        },
      ),
  };

  return store[storeKey];
};

export default createCreatedEntitySubscriptionResolver;
