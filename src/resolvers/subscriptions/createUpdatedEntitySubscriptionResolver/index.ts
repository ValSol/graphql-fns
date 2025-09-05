import mingo from 'mingo';

import type { GeneralConfig, Subscription, EntityConfig, ServersideConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
import composeSubscriptionDummyEntityConfig from '@/resolvers/utils/composeSubscriptionDummyEntityConfig';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';
import filterUpdatedFields, { WhichUpdated } from './filterUpdatedFields';

const store = Object.create(null);

const createUpdatedEntitySubscriptionResolver = (
  originalOrCustomName: string,
  preEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | { subscribe: Subscription } => {
  const { allEntityConfigs, inventory } = generalConfig;
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
    subscribe: (
      _,
      { wherePayload = {}, whichUpdated = {} },
      context,
      info,
      { involvedFilters, subscribePayloadMongoFilter, subscriptionUpdatedFields },
    ) =>
      withFilterAndTransformer(
        context.pubsub.subscribe(`updated-${name}`),

        (payload) => {
          if (!involvedFilters || !subscribePayloadMongoFilter) {
            return false;
          }

          const {
            [`updated${name}`]: { updatedFields: preUpdatedFields },
          } = payload as Record<string, any>;

          const updatedFields = filterUpdatedFields(
            preUpdatedFields,
            subscriptionUpdatedFields,
            whichUpdated as WhichUpdated,
          );

          if (updatedFields.length === 0) {
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

          return query.test(payload[`updated${name}`].previousNode);
        },

        (payload) => {
          const {
            [`updated${name}`]: { node, previousNode, updatedFields: preUpdatedFields },
          } = payload as Record<string, any>;

          const updatedFields = filterUpdatedFields(
            preUpdatedFields,
            subscriptionUpdatedFields,
            whichUpdated as WhichUpdated,
          );

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
