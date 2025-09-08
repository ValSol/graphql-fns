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
import composeSubscriptionDummyEntityConfig from '@/resolvers/utils/composeSubscriptionDummyEntityConfig';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const store = Object.create(null);

const createDeletedEntitySubscriptionResolver = (
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

  const descendantKey = originalOrCustomName.slice('deletedEntity'.length);

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
        context.pubsub.subscribe(`deleted-${name}`),

        (payload) => {
          const { involvedFilters, subscribePayloadMongoFilter } = resolverOptions;

          if (!involvedFilters || !subscribePayloadMongoFilter) {
            return false;
          }

          const { where: wherePayloadMongo } = mergeWhereAndFilter(
            [],
            wherePayload,
            composeSubscriptionDummyEntityConfig(allEntityConfigs[name]),
          );

          const where =
            Object.keys(wherePayloadMongo).length === 0
              ? subscribePayloadMongoFilter
              : Object.keys(subscribePayloadMongoFilter).length === 0
                ? wherePayloadMongo
                : { $and: [wherePayloadMongo, subscribePayloadMongoFilter] };

          const query = new mingo.Query(where);

          return query.test(payload[`deleted${name}`].node);
        },

        (payload) => {
          const {
            [`deleted${name}`]: { actor, node },
          } = payload as Record<string, any>;

          return {
            [`deleted${name}${descendantKey}`]: {
              actor: actor && transformAfter({}, actor, subscriptionActorConfig, generalConfig),
              node: transformAfter({}, node, entityConfig, generalConfig),
            },
          };
        },
      ),
  };

  return store[storeKey];
};

export default createDeletedEntitySubscriptionResolver;
