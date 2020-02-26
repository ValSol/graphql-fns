// @flow

import pluralize from 'pluralize';
import { DateTimeResolver } from 'graphql-scalars';

import type { GeneralConfig, ServersideConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import createThingConcatenateInputType from '../types/inputs/createThingConcatenateInputType';
import createFileOfThingOptionsInputType from '../types/inputs/createFileOfThingOptionsInputType';
import createManyFilesOfThingOptionsInputType from '../types/inputs/createManyFilesOfThingOptionsInputType';
import createCustomResolver from './createCustomResolver';
import createThingCountQueryResolver from './queries/createThingCountQueryResolver';
import createThingQueryResolver from './queries/createThingQueryResolver';
import createThingsQueryResolver from './queries/createThingsQueryResolver';
import composeThingResolvers from './types/composeThingResolvers';

import createCreateManyThingsMutationResolver from './mutations/createCreateManyThingsMutationResolver';
import createCreateThingMutationResolver from './mutations/createCreateThingMutationResolver';
import createImportThingsMutationResolver from './mutations/createImportThingsMutationResolver';
import createConcatenateThingMutationResolver from './mutations/createConcatenateThingMutationResolver';
import createUpdateThingMutationResolver from './mutations/createUpdateThingMutationResolver';
import createDeleteThingMutationResolver from './mutations/createDeleteThingMutationResolver';
import createUploadFileToThingMutationResolver from './mutations/createUploadFileToThingMutationResolver';
import createUploadManyFilesToThingMutationResolver from './mutations/createUploadManyFilesToThingMutationResolver';

import createCreatedThingSubscriptionResolver from './subscriptions/createCreatedThingSubscriptionResolver';
import createUpdatedThingSubscriptionResolver from './subscriptions/createUpdatedThingSubscriptionResolver';
import createDeletedThingSubscriptionResolver from './subscriptions/createDeletedThingSubscriptionResolver';

const composeGqlResolvers = (
  generalConfig: GeneralConfig,
  serversideConfig?: ServersideConfig = {}, // default "{}" to eliminate flowjs error
): Object => {
  const { thingConfigs, custom, inventory } = generalConfig;

  // eslint-disable-next-line no-nested-ternary
  const customQuery = custom ? (custom.Query ? custom.Query : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom ? (custom.Mutation ? custom.Mutation : {}) : {};

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

  const resolvers = {};

  resolvers.DateTime = DateTimeResolver;
  if (allowQueries) resolvers.Query = {};
  if (allowMutations) resolvers.Mutation = {};
  if (allowSubscriptions) resolvers.Subscription = {};

  thingConfigs
    .filter(({ embedded }) => !embedded)
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

        customQueryNames.forEach(customName => {
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
              customQuery[customName].name(thingConfig, generalConfig)
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

        const thingConcatenateInputType = createThingConcatenateInputType(thingConfig);
        if (thingConcatenateInputType) {
          const concatenateThingMutationResolver = createConcatenateThingMutationResolver(
            thingConfig,
            generalConfig,
            serversideConfig,
          );
          if (concatenateThingMutationResolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[`concatenate${name}`] = concatenateThingMutationResolver;
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

        const fileOfThingOptionsInputType = createFileOfThingOptionsInputType(thingConfig);
        if (fileOfThingOptionsInputType) {
          const uploadFileToThingMutationResolver = createUploadFileToThingMutationResolver(
            thingConfig,
            generalConfig,
            serversideConfig,
          );
          if (uploadFileToThingMutationResolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[`uploadFileTo${name}`] = uploadFileToThingMutationResolver;
          }
        }

        const manyFilesOfThingOptionsInputType = createManyFilesOfThingOptionsInputType(
          thingConfig,
        );
        if (manyFilesOfThingOptionsInputType) {
          const uploadManyFilesToThingMutationResolver = createUploadManyFilesToThingMutationResolver(
            thingConfig,
            generalConfig,
            serversideConfig,
          );
          if (uploadManyFilesToThingMutationResolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[`uploadManyFilesTo${name}`] = uploadManyFilesToThingMutationResolver;
          }
        }

        const customMutationNames = Object.keys(customMutation);

        customMutationNames.forEach(customName => {
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
              customMutation[customName].name(thingConfig, generalConfig)
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

  thingConfigs.reduce((prev, thingConfig) => {
    const { name, duplexFields, geospatialFields, relationalFields } = thingConfig;
    if (duplexFields || geospatialFields || relationalFields) {
      // eslint-disable-next-line no-param-reassign
      prev[name] = composeThingResolvers(thingConfig, generalConfig, serversideConfig);
    }
    return prev;
  }, resolvers);

  return resolvers;
};

export default composeGqlResolvers;
