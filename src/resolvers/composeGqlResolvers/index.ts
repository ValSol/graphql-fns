import { DateTimeResolver } from 'graphql-scalars';

import type { GeneralConfig, ServersideConfig } from '../../tsTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import composeRepresentationConfigName from '../../utils/composeRepresentationConfig/composeRepresentationConfigName';
import mergeRepresentationIntoCustom from '../../utils/mergeRepresentationIntoCustom';
import composeRepresentationConfig from '../../utils/composeRepresentationConfig';
import { mutationAttributes, queryAttributes } from '../../types/actionAttributes';
import resolverDecorator from '../utils/resolverDecorator';
import composeEntityResolvers from '../types/composeEntityResolvers';
import createCustomResolver from '../createCustomResolver';
import createNodeQueryResolver from '../queries/createNodeQueryResolver';
import queries from '../queries';
import mutations from '../mutations';

import createCreatedEntitySubscriptionResolver from '../subscriptions/createCreatedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from '../subscriptions/createUpdatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from '../subscriptions/createDeletedEntitySubscriptionResolver';
import subscriptionResolverDecorator from '../utils/resolverDecorator/subscriptionResolverDecorator';
import createObjectBoundStore from '@/utils/createObjectBoundStore';

// separate cache for every combination of generalConfig & serversideConfig
const getStore = createObjectBoundStore();

// the same object for not set "serversideConfig" to use cache
const defaultServersideConfig: ServersideConfig = Object.freeze({});

const composeGqlResolvers = (
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },

  serversideConfig: ServersideConfig = defaultServersideConfig,
): any => {
  const store = getStore(generalConfig, serversideConfig);

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.resolvers) {
    return store.resolvers;
  }

  const { allEntityConfigs, inventory, representation = {} } = generalConfig;

  const custom = mergeRepresentationIntoCustom(generalConfig);

  const customQuery = custom?.Query || {};

  const customMutation = custom?.Mutation || {};

  const customSubscription = custom?.Subscription || {};

  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

  const resolvers: Record<string, any> = {};

  resolvers.DateTime = DateTimeResolver;

  resolvers.Node = { __resolveType: (obj) => obj.__typename };

  resolvers.Query = { node: createNodeQueryResolver(generalConfig, serversideConfig) };

  if (allowMutations) resolvers.Mutation = {};
  if (allowSubscriptions) resolvers.Subscription = {};

  Object.keys(allEntityConfigs).reduce((prev, entityName) => {
    const entityConfig = allEntityConfigs[entityName];

    Object.keys(queryAttributes).forEach((actionName) => {
      if (
        queryAttributes[actionName].actionAllowed(entityConfig) &&
        !queryAttributes[actionName].actionIsChild
      ) {
        const resolver = queries[actionName](entityConfig, generalConfig, serversideConfig);
        if (resolver) {
          prev.Query[queryAttributes[actionName].actionName(entityName)] = resolverDecorator(
            resolver,
            ['Query', actionName, entityConfig.name],
            queryAttributes[actionName],
            entityConfig,
            generalConfig,
            serversideConfig,
          );
        }
      }
    });

    const customQueryNames = Object.keys(customQuery);

    customQueryNames.forEach((customName) => {
      const customQueryResolver = createCustomResolver(
        'Query',
        customName,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

      if (customQueryResolver) {
        prev.Query[customQuery[customName].specificName(entityConfig, generalConfig)] =
          customQueryResolver;
      }
    });

    if (allowMutations) {
      Object.keys(mutationAttributes).forEach((actionName) => {
        if (
          mutationAttributes[actionName].actionAllowed(entityConfig) &&
          !mutationAttributes[actionName].actionIsChild
        ) {
          const resolver = mutations[actionName](entityConfig, generalConfig, serversideConfig);
          if (resolver) {
            prev.Mutation[mutationAttributes[actionName].actionName(entityName)] =
              resolverDecorator(
                resolver,
                ['Mutation', actionName, entityConfig.name],
                mutationAttributes[actionName],
                entityConfig,
                generalConfig,
                serversideConfig,
              );
          }
        }
      });

      const customMutationNames = Object.keys(customMutation);

      customMutationNames.forEach((customName) => {
        const customMutationResolver = createCustomResolver(
          'Mutation',
          customName,
          entityConfig,
          generalConfig,
          serversideConfig,
        );
        if (customMutationResolver) {
          prev.Mutation[customMutation[customName].specificName(entityConfig, generalConfig)] =
            customMutationResolver;
        }
      });
    }

    return prev;
  }, resolvers);

  Object.keys(allEntityConfigs)
    .map((entityName) => allEntityConfigs[entityName])
    .filter(({ type: configType }) => configType === 'tangible')
    .reduce((prev, entityConfig) => {
      const { name } = entityConfig;

      if (allowSubscriptions) {
        const createdEntitySubscriptionResolver = createCreatedEntitySubscriptionResolver(
          'createdEntity',
          entityConfig,
          generalConfig,
          serversideConfig,
        );

        if (createdEntitySubscriptionResolver) {
          prev.Subscription[`created${name}`] = subscriptionResolverDecorator(
            createdEntitySubscriptionResolver,
            ['Subscription', 'createdEntity', entityConfig.name],
            entityConfig,
            generalConfig,
            serversideConfig,
          );
        }

        const deletedEntitySubscriptionResolver = createDeletedEntitySubscriptionResolver(
          'deletedEntity',
          entityConfig,
          generalConfig,
          serversideConfig,
        );
        if (deletedEntitySubscriptionResolver) {
          prev.Subscription[`deleted${name}`] = subscriptionResolverDecorator(
            deletedEntitySubscriptionResolver,
            ['Subscription', 'deletedEntity', entityConfig.name],
            entityConfig,
            generalConfig,
            serversideConfig,
          );
        }

        const updatedEntitySubscriptionResolver = createUpdatedEntitySubscriptionResolver(
          'updatedEntity',
          entityConfig,
          generalConfig,
          serversideConfig,
        );
        if (updatedEntitySubscriptionResolver) {
          prev.Subscription[`updated${name}`] = subscriptionResolverDecorator(
            updatedEntitySubscriptionResolver,
            ['Subscription', 'updatedEntity', name],
            entityConfig,
            generalConfig,
            serversideConfig,
          );
        }

        Object.keys(customSubscription).forEach((customName) => {
          const specificName = customSubscription[customName].specificName(
            entityConfig,
            generalConfig,
          );

          let subscriptionResolver;

          if (customName.startsWith('createdEntity')) {
            subscriptionResolver = createCreatedEntitySubscriptionResolver(
              customName,
              entityConfig,
              generalConfig,
              serversideConfig,
            );
          } else if (customName.startsWith('deletedEntity')) {
            subscriptionResolver = createDeletedEntitySubscriptionResolver(
              customName,
              entityConfig,
              generalConfig,
              serversideConfig,
            );
          } else if (customName.startsWith('updatedEntity')) {
            subscriptionResolver = createUpdatedEntitySubscriptionResolver(
              customName,
              entityConfig,
              generalConfig,
              serversideConfig,
            );
          } else {
            throw new TypeError(`Got incorrect subscription customName: "${customName}"!`);
          }

          if (subscriptionResolver) {
            prev.Subscription[specificName] = subscriptionResolverDecorator(
              subscriptionResolver,
              ['Subscription', customName, name],
              entityConfig,
              generalConfig,
              serversideConfig,
            );
          }
        });
      }

      return prev;
    }, resolvers);

  // compose field resolvers for all entity types (tangible, embedded & virtual) used in schema
  Object.keys(allEntityConfigs)
    .map((entityName) => allEntityConfigs[entityName])
    .reduce((prev, entityConfig) => {
      const { name, representationNameSlicePosition } = entityConfig;

      if (entityTypeDic[name]) {
        const entityResolvers = composeEntityResolvers(
          entityConfig,
          generalConfig,
          serversideConfig,
        );

        if (Object.keys(entityResolvers).length > 0) {
          prev[name] = entityResolvers;
        }
      }

      // process representation objects fields
      Object.keys(representation).forEach((representationKey) => {
        const key = composeRepresentationConfigName(
          name,
          representationKey,
          representationNameSlicePosition,
        );

        if (!entityTypeDic[key]) return;

        const representationConfig = composeRepresentationConfig(
          representation[representationKey],
          entityConfig,
          generalConfig,
        );

        if (representationConfig) {
          const entityResolvers = composeEntityResolvers(
            representationConfig,
            generalConfig,
            serversideConfig,
          );

          if (Object.keys(entityResolvers).length > 0) {
            prev[key] = entityResolvers;
          }
        }
      });

      return prev;
    }, resolvers);

  // save only completely composed resolvers
  store.resolvers = resolvers;

  return resolvers;
};

export default composeGqlResolvers;
