import mingo from 'mingo';

import type {
  GeneralConfig,
  Subscription,
  EntityConfig,
  ServersideConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import checkInventory from '@/utils/inventory/checkInventory';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import withFilterAndTransformer from '../withFilterAndTransformer';
import filterUpdatedFields, { WhichUpdated } from './filterUpdatedFields';
import testSubscriptionNode from '../testSubscriptionNode';
import createObjectBoundStore from '@/utils/createObjectBoundStore';

// separate cache for every combination of generalConfig & serversideConfig
const getStore = createObjectBoundStore();

const createUpdatedEntitySubscriptionResolver = (
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

  const store = getStore(generalConfig, serversideConfig);

  const storeKey = `${originalOrCustomName}:${name}`;

  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  const representationKey = originalOrCustomName.slice('updatedEntity'.length);

  const entityConfig = representationKey
    ? composeRepresentationConfigByName(representationKey, preEntityConfig, generalConfig)
    : preEntityConfig;

  const subscriptionActorConfig =
    preSubscriptionActorConfig &&
    (representationKey
      ? composeRepresentationConfigByName(
          representationKey,
          preSubscriptionActorConfig,
          generalConfig,
        )
      : preSubscriptionActorConfig);

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
          // "inputOutputFilterAndLimit" is "null" if user has no access to subscription
          if (
            !involvedFilters ||
            !involvedFilters.inputOutputFilterAndLimit ||
            !subscribePayloadMongoFilter
          ) {
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

          return testSubscriptionNode(
            [payload[`updated${name}`].previousNode, payload[`updated${name}`].node],
            wherePayload,
            subscribePayloadMongoFilter,
            allEntityConfigs[name],
          );
        },

        (payload) => {
          const {
            [`updated${name}`]: { actor, node, previousNode, updatedFields: preUpdatedFields },
          } = payload as Record<string, any>;

          const updatedFields = filterUpdatedFields(
            preUpdatedFields,
            subscriptionUpdatedFields,
            whichUpdated as WhichUpdated,
          );

          return {
            [`updated${name}${representationKey}`]: {
              actor: actor && transformAfter({}, actor, subscriptionActorConfig, generalConfig),
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
