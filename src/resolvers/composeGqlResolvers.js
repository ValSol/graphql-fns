// @flow
import type { GeneralConfig } from '../flowTypes';

const pluralize = require('pluralize');
const { DateTime } = require('@okgrow/graphql-scalars');

const createThingQueryResolver = require('./queries/createThingQueryResolver');
const createThingsQueryResolver = require('./queries/createThingsQueryResolver');
const composeThingResolvers = require('./types/composeThingResolvers');
const createCreateThingMutationResolver = require('./mutations/createCreateThingMutationResolver');
const createUpdateThingMutationResolver = require('./mutations/createUpdateThingMutationResolver');
const createDeleteThingMutationResolver = require('./mutations/createDeleteThingMutationResolver');

const composeGqlResolvers = (generalConfig: GeneralConfig): Object => {
  const { thingConfigs } = generalConfig;
  const resolvers = { DateTime, Query: {}, Mutation: {} /* Subscription: {} */ };

  thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;

      const thingQueryResolver = createThingQueryResolver(thingConfig, generalConfig);
      // eslint-disable-next-line no-param-reassign
      prev.Query[name] = thingQueryResolver;

      const thingsQueryResolver = createThingsQueryResolver(thingConfig, generalConfig);
      // eslint-disable-next-line no-param-reassign
      prev.Query[pluralize(name)] = thingsQueryResolver;

      const createThingMutationResolver = createCreateThingMutationResolver(
        thingConfig,
        generalConfig,
      );
      // eslint-disable-next-line no-param-reassign
      prev.Mutation[`create${name}`] = createThingMutationResolver;

      const updateThingMutationResolver = createUpdateThingMutationResolver(
        thingConfig,
        generalConfig,
      );
      // eslint-disable-next-line no-param-reassign
      prev.Mutation[`update${name}`] = updateThingMutationResolver;

      const deleteThingMutationResolver = createDeleteThingMutationResolver(
        thingConfig,
        generalConfig,
      );
      // eslint-disable-next-line no-param-reassign
      prev.Mutation[`delete${name}`] = deleteThingMutationResolver;

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

module.exports = composeGqlResolvers;
