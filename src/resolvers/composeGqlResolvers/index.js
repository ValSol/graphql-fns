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
import composeThingResolvers from '../types/composeThingResolvers';
import createCustomResolver from '../createCustomResolver';
import createNodeQueryResolver from '../queries/createNodeQueryResolver';
import queries from '../queries';
import mutations from '../mutations';

import createCreatedThingSubscriptionResolver from '../subscriptions/createCreatedThingSubscriptionResolver';
import createUpdatedThingSubscriptionResolver from '../subscriptions/createUpdatedThingSubscriptionResolver';
import createDeletedThingSubscriptionResolver from '../subscriptions/createDeletedThingSubscriptionResolver';

const composeGqlResolvers = (
  generalConfig: GeneralConfig,
  serversideConfig?: ServersideConfig = {}, // default "{}" to eliminate flowjs error
): Object => {
  const { thingConfigs, inventory, derivative } = generalConfig;

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

  Object.keys(thingConfigs).reduce((prev, thingName) => {
    const thingConfig = thingConfigs[thingName];
    if (allowQueries) {
      Object.keys(queryAttributes).forEach((actionName) => {
        if (queryAttributes[actionName].actionAllowed(thingConfig)) {
          const resolver = queries[actionName](thingConfig, generalConfig, serversideConfig);
          if (resolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Query[queryAttributes[actionName].actionName(thingName)] = resolverDecorator(
              resolver,
              queryAttributes[actionName],
              thingConfig,
            );
          }
        }
      });

      const customQueryNames = Object.keys(customQuery);

      customQueryNames.forEach((customName) => {
        const customQueryResolver = createCustomResolver(
          'Query',
          customName,
          thingConfig,
          generalConfig,
          serversideConfig,
        );

        if (customQueryResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Query[customQuery[customName].specificName(thingConfig, generalConfig)] =
            customQueryResolver;
        }
      });
    }

    if (allowMutations) {
      Object.keys(mutationAttributes).forEach((actionName) => {
        if (mutationAttributes[actionName].actionAllowed(thingConfig)) {
          const resolver = mutations[actionName](thingConfig, generalConfig, serversideConfig);
          if (resolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[mutationAttributes[actionName].actionName(thingName)] = resolverDecorator(
              resolver,
              mutationAttributes[actionName],
              thingConfig,
            );
          }
        }
      });

      const customMutationNames = Object.keys(customMutation);

      customMutationNames.forEach((customName) => {
        const customMutationResolver = createCustomResolver(
          'Mutation',
          customName,
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (customMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[customMutation[customName].specificName(thingConfig, generalConfig)] =
            customMutationResolver;
        }
      });
    }

    return prev;
  }, resolvers);

  Object.keys(thingConfigs)
    .map((thingName) => thingConfigs[thingName])
    .filter(({ type: configType }) => configType === 'tangible')
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;

      if (allowSubscriptions) {
        const createdThingSubscriptionResolver = createCreatedThingSubscriptionResolver(
          thingConfig,
          generalConfig,
        );
        if (createdThingSubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`created${name}`] = createdThingSubscriptionResolver;
        }

        const deletedThingSubscriptionResolver = createDeletedThingSubscriptionResolver(
          thingConfig,
          generalConfig,
        );
        if (deletedThingSubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`deleted${name}`] = deletedThingSubscriptionResolver;
        }

        const updatedThingSubscriptionResolver = createUpdatedThingSubscriptionResolver(
          thingConfig,
          generalConfig,
        );
        if (updatedThingSubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`updated${name}`] = updatedThingSubscriptionResolver;
        }
      }

      return prev;
    }, resolvers);

  Object.keys(thingConfigs)
    .map((thingName) => thingConfigs[thingName])
    .reduce((prev, thingConfig) => {
      const { name, duplexFields, geospatialFields, relationalFields } = thingConfig;
      if (duplexFields || geospatialFields || relationalFields) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = composeThingResolvers(thingConfig, generalConfig, serversideConfig);
      }

      // process derivative objects fields
      Object.keys(derivativeConfigs).forEach((derivativeKey) => {
        const derivativeConfig = composeDerivativeConfig(
          derivativeConfigs[derivativeKey],
          thingConfig,
          generalConfig,
        );

        if (derivativeConfig) {
          // eslint-disable-next-line no-param-reassign
          prev[`${name}${derivativeKey}`] = composeThingResolvers(
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
