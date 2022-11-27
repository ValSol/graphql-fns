// @flow

import { DateTimeResolver } from 'graphql-scalars';
// import GraphQLUpload from 'graphql-upload/public/GraphQLUpload';
import { GraphQLUpload } from 'graphql-upload';

import type { GeneralConfig, ServersideConfig } from '../../flowTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import composeDerivativeConfig from '../../utils/composeDerivativeConfig';

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

const composeGqlResolvers = (
  generalConfig: GeneralConfig,
  serversideConfig?: ServersideConfig = {}, // default "{}" to eliminate flowjs error
): Object => {
  const { entityConfigs, inventory, derivative } = generalConfig;

  const custom = mergeDerivativeIntoCustom(generalConfig);

  // eslint-disable-next-line no-nested-ternary
  const customQuery = custom?.Query || {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom?.Mutation || {};
  const derivativeConfigs = derivative || {};

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

  const resolvers = {};

  resolvers.DateTime = DateTimeResolver;

  resolvers.Upload = GraphQLUpload;

  resolvers.Node = {
    __resolveType: (obj) => obj.__typename, // eslint-disable-line no-underscore-dangle
  };

  if (allowQueries)
    resolvers.Query = {
      node: createNodeQueryResolver(generalConfig, serversideConfig),
    };
  if (allowMutations) resolvers.Mutation = {};
  if (allowSubscriptions) resolvers.Subscription = {};

  Object.keys(entityConfigs).reduce((prev, entityName) => {
    const entityConfig = entityConfigs[entityName];
    if (allowQueries) {
      Object.keys(queryAttributes).forEach((actionName) => {
        if (queryAttributes[actionName].actionAllowed(entityConfig)) {
          const resolver = queries[actionName](entityConfig, generalConfig, serversideConfig);
          if (resolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Query[queryAttributes[actionName].actionName(entityName)] = resolverDecorator(
              resolver,
              queryAttributes[actionName],
              entityConfig,
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
          // eslint-disable-next-line no-param-reassign
          prev.Query[customQuery[customName].specificName(entityConfig, generalConfig)] =
            customQueryResolver;
        }
      });
    }

    if (allowMutations) {
      Object.keys(mutationAttributes).forEach((actionName) => {
        if (mutationAttributes[actionName].actionAllowed(entityConfig)) {
          const resolver = mutations[actionName](entityConfig, generalConfig, serversideConfig);
          if (resolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[mutationAttributes[actionName].actionName(entityName)] =
              resolverDecorator(resolver, mutationAttributes[actionName], entityConfig);
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
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[customMutation[customName].specificName(entityConfig, generalConfig)] =
            customMutationResolver;
        }
      });
    }

    return prev;
  }, resolvers);

  Object.keys(entityConfigs)
    .map((entityName) => entityConfigs[entityName])
    .filter(({ type: configType }) => configType === 'tangible')
    .reduce((prev, entityConfig) => {
      const { name } = entityConfig;

      if (allowSubscriptions) {
        const createdEntitySubscriptionResolver = createCreatedEntitySubscriptionResolver(
          entityConfig,
          generalConfig,
        );
        if (createdEntitySubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`created${name}`] = createdEntitySubscriptionResolver;
        }

        const deletedEntitySubscriptionResolver = createDeletedEntitySubscriptionResolver(
          entityConfig,
          generalConfig,
        );
        if (deletedEntitySubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`deleted${name}`] = deletedEntitySubscriptionResolver;
        }

        const updatedEntitySubscriptionResolver = createUpdatedEntitySubscriptionResolver(
          entityConfig,
          generalConfig,
        );
        if (updatedEntitySubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`updated${name}`] = updatedEntitySubscriptionResolver;
        }
      }

      return prev;
    }, resolvers);

  Object.keys(entityConfigs)
    .map((entityName) => entityConfigs[entityName])
    .reduce((prev, entityConfig) => {
      const { name, duplexFields, geospatialFields, relationalFields } = entityConfig;
      if (duplexFields || geospatialFields || relationalFields) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = composeEntityResolvers(entityConfig, generalConfig, serversideConfig);
      }

      // process derivative objects fields
      Object.keys(derivativeConfigs).forEach((derivativeKey) => {
        const derivativeConfig = composeDerivativeConfig(
          derivativeConfigs[derivativeKey],
          entityConfig,
          generalConfig,
        );

        if (derivativeConfig) {
          // eslint-disable-next-line no-param-reassign
          prev[`${name}${derivativeKey}`] = composeEntityResolvers(
            derivativeConfig,
            generalConfig,
            serversideConfig,
          );
        }
      });

      return prev;
    }, resolvers);

  return resolvers;
};

export default composeGqlResolvers;
