// @flow

import pluralize from 'pluralize';
import { DateTimeResolver } from 'graphql-scalars';

import type { GeneralConfig, ServersideConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import mergeDerivativeIntoCustom from '../utils/mergeDerivativeIntoCustom';
import composeDerivativeConfig from '../utils/composeDerivativeConfig';
import createPushIntoThingInputType from '../types/inputs/createPushIntoThingInputType';
import createFilesOfThingOptionsInputType from '../types/inputs/createFilesOfThingOptionsInputType';
import createThingDistinctValuesOptionsInputType from '../types/inputs/createThingDistinctValuesOptionsInputType';

import createCustomResolver from './createCustomResolver';
import createThingCountQueryResolver from './queries/createThingCountQueryResolver';
import createThingFileCountQueryResolver from './queries/createThingFileCountQueryResolver';
import createThingFileQueryResolver from './queries/createThingFileQueryResolver';
import createThingFilesQueryResolver from './queries/createThingFilesQueryResolver';
import createThingDistinctValuesQueryResolver from './queries/createThingDistinctValuesQueryResolver';
import createThingQueryResolver from './queries/createThingQueryResolver';
import createThingsQueryResolver from './queries/createThingsQueryResolver';
import composeThingResolvers from './types/composeThingResolvers';

import createCreateManyThingsMutationResolver from './mutations/createCreateManyThingsMutationResolver';
import createCreateThingMutationResolver from './mutations/createCreateThingMutationResolver';
import createImportThingsMutationResolver from './mutations/createImportThingsMutationResolver';
import createPushIntoThingMutationResolver from './mutations/createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from './mutations/createUpdateThingMutationResolver';
import createDeleteThingMutationResolver from './mutations/createDeleteThingMutationResolver';
import createUploadFilesToThingMutationResolver from './mutations/createUploadFilesToThingMutationResolver';

import createCreatedThingSubscriptionResolver from './subscriptions/createCreatedThingSubscriptionResolver';
import createUpdatedThingSubscriptionResolver from './subscriptions/createUpdatedThingSubscriptionResolver';
import createDeletedThingSubscriptionResolver from './subscriptions/createDeletedThingSubscriptionResolver';

const composeGqlResolvers = (
  generalConfig: GeneralConfig,
  serversideConfig?: ServersideConfig = {}, // default "{}" to eliminate flowjs error
): Object => {
  const { thingConfigs, inventory, derivative } = generalConfig;

  const custom = mergeDerivativeIntoCustom(generalConfig);

  // eslint-disable-next-line no-nested-ternary
  const customQuery = custom ? (custom.Query ? custom.Query : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom ? (custom.Mutation ? custom.Mutation : {}) : {};
  const derivativeConfigs = derivative || {};

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

  const resolvers = {};

  resolvers.DateTime = DateTimeResolver;
  if (allowQueries) resolvers.Query = {};
  if (allowMutations) resolvers.Mutation = {};
  if (allowSubscriptions) resolvers.Subscription = {};

  Object.keys(thingConfigs)
    .map((thingName) => thingConfigs[thingName])
    .filter(({ embedded, file }) => !(embedded || file))
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;

      if (allowQueries) {
        const thingCountQueryResolver = createThingCountQueryResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        // eslint-disable-next-line no-param-reassign
        if (thingCountQueryResolver) prev.Query[`${name}Count`] = thingCountQueryResolver;

        const thingDistinctValuesOptionsInputType = createThingDistinctValuesOptionsInputType(
          thingConfig,
        );
        if (thingDistinctValuesOptionsInputType) {
          const thingDistinctValuesQueryResolver = createThingDistinctValuesQueryResolver(
            thingConfig,
            generalConfig,
            serversideConfig,
          );
          if (thingDistinctValuesQueryResolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Query[`${name}DistinctValues`] = thingDistinctValuesQueryResolver;
          }
        }

        const thingQueryResolver = createThingQueryResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        // eslint-disable-next-line no-param-reassign
        if (thingQueryResolver) prev.Query[name] = thingQueryResolver;

        const thingsQueryResolver = createThingsQueryResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        // eslint-disable-next-line no-param-reassign
        if (thingsQueryResolver) prev.Query[pluralize(name)] = thingsQueryResolver;

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
            prev.Query[
              customQuery[customName].specificName(thingConfig, generalConfig)
            ] = customQueryResolver;
          }
        });
      }

      if (allowMutations) {
        const createThingMutationResolver = createCreateThingMutationResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (createThingMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`create${name}`] = createThingMutationResolver;
        }

        const createManyThingsMutationResolver = createCreateManyThingsMutationResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (createManyThingsMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`createMany${pluralize(name)}`] = createManyThingsMutationResolver;
        }

        const importThingsMutationResolver = createImportThingsMutationResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (importThingsMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`import${pluralize(name)}`] = importThingsMutationResolver;
        }

        const pushIntoThingInputType = createPushIntoThingInputType(thingConfig);
        if (pushIntoThingInputType) {
          const pushIntoThingMutationResolver = createPushIntoThingMutationResolver(
            thingConfig,
            generalConfig,
            serversideConfig,
          );
          if (pushIntoThingMutationResolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[`pushInto${name}`] = pushIntoThingMutationResolver;
          }
        }

        const updateThingMutationResolver = createUpdateThingMutationResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (updateThingMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`update${name}`] = updateThingMutationResolver;
        }

        const deleteThingMutationResolver = createDeleteThingMutationResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (deleteThingMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[`delete${name}`] = deleteThingMutationResolver;
        }

        const filesOfThingOptionsInputType = createFilesOfThingOptionsInputType(thingConfig);
        if (filesOfThingOptionsInputType) {
          const uploadFilesToThingMutationResolver = createUploadFilesToThingMutationResolver(
            thingConfig,
            generalConfig,
            serversideConfig,
          );
          if (uploadFilesToThingMutationResolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[`uploadFilesTo${name}`] = uploadFilesToThingMutationResolver;
          }
        }

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
            prev.Mutation[
              customMutation[customName].specificName(thingConfig, generalConfig)
            ] = customMutationResolver;
          }
        });
      }

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
    .filter(({ file }) => file)
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;

      if (allowQueries) {
        const thingFileCountQueryResolver = createThingFileCountQueryResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        if (thingFileCountQueryResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Query[`${name}FileCount`] = thingFileCountQueryResolver;
        }

        const thingFileQueryResolver = createThingFileQueryResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        // eslint-disable-next-line no-param-reassign
        if (thingFileQueryResolver) prev.Query[`${name}File`] = thingFileQueryResolver;

        const thingFilesQueryResolver = createThingFilesQueryResolver(
          thingConfig,
          generalConfig,
          serversideConfig,
        );
        // eslint-disable-next-line no-param-reassign
        if (thingFilesQueryResolver) prev.Query[`${name}Files`] = thingFilesQueryResolver;
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
