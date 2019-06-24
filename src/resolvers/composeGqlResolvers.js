// @flow

import pluralize from 'pluralize';
import { DateTime } from '@okgrow/graphql-scalars';

import type { GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import createThingCountQueryResolver from './queries/createThingCountQueryResolver';
import createThingQueryResolver from './queries/createThingQueryResolver';
import createThingsQueryResolver from './queries/createThingsQueryResolver';
import composeThingResolvers from './types/composeThingResolvers';
import createCreateThingMutationResolver from './mutations/createCreateThingMutationResolver';
import createUpdateThingMutationResolver from './mutations/createUpdateThingMutationResolver';
import createDeleteThingMutationResolver from './mutations/createDeleteThingMutationResolver';
import createNewThingSubscriptionResolver from './subscriptions/createNewThingSubscriptionResolver';
import createUpdatedThingSubscriptionResolver from './subscriptions/createUpdatedThingSubscriptionResolver';
import createDeletedThingSubscriptionResolver from './subscriptions/createDeletedThingSubscriptionResolver';

const composeGqlResolvers = (generalConfig: GeneralConfig): Object => {
  const { thingConfigs, inventory } = generalConfig;

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

  const resolvers = {};

  resolvers.DateTime = DateTime;
  if (allowQueries) resolvers.Query = {};
  if (allowMutations) resolvers.Mutation = {};
  if (allowSubscriptions) resolvers.Subscription = {};

  thingConfigs
    .filter(({ embedded }) => !embedded)
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;

      if (allowQueries) {
        const thingCountQueryResolver = createThingCountQueryResolver(thingConfig, generalConfig);
        // eslint-disable-next-line no-param-reassign
        if (thingCountQueryResolver) prev.Query[`${name}Count`] = thingCountQueryResolver;

        const thingQueryResolver = createThingQueryResolver(thingConfig, generalConfig);
        // eslint-disable-next-line no-param-reassign
        if (thingQueryResolver) prev.Query[name] = thingQueryResolver;

        const thingsQueryResolver = createThingsQueryResolver(thingConfig, generalConfig);
        // eslint-disable-next-line no-param-reassign
        if (thingsQueryResolver) prev.Query[pluralize(name)] = thingsQueryResolver;
      }

      if (allowMutations) {
        const createThingMutationResolver = createCreateThingMutationResolver(
          thingConfig,
          generalConfig,
        );
        if (createThingMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`create${name}`] = createThingMutationResolver;
        }

        const updateThingMutationResolver = createUpdateThingMutationResolver(
          thingConfig,
          generalConfig,
        );
        if (updateThingMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`update${name}`] = updateThingMutationResolver;
        }

        const deleteThingMutationResolver = createDeleteThingMutationResolver(
          thingConfig,
          generalConfig,
        );
        if (deleteThingMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`delete${name}`] = deleteThingMutationResolver;
        }
      }

      if (allowSubscriptions) {
        const newThingSubscriptionResolver = createNewThingSubscriptionResolver(
          thingConfig,
          generalConfig,
        );
        if (newThingSubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`new${name}`] = newThingSubscriptionResolver;
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

  thingConfigs.reduce((prev, thingConfig) => {
    const { name, duplexFields, geospatialFields, relationalFields } = thingConfig;
    if (duplexFields || geospatialFields || relationalFields) {
      // eslint-disable-next-line no-param-reassign
      prev[name] = composeThingResolvers(thingConfig, generalConfig);
    }
    return prev;
  }, resolvers);

  return resolvers;
};

export default composeGqlResolvers;
