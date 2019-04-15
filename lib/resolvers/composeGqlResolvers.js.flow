// @flow
import type { ThingConfig } from '../flowTypes';

const { DateTime } = require('@okgrow/graphql-scalars');

const createThingQueryResolver = require('./queries/createThingQueryResolver');
const createThingResolver = require('./types/composeThingResolvers');
const createCreateThingMutationResolver = require('./mutations/createCreateThingMutationResolver');

type ThingConfigs = Array<ThingConfig>;

const composeGqlResolvers = (thingConfigs: ThingConfigs): Object => {
  const resolvers = { DateTime, Query: {}, Mutation: {}, Subscription: {} };
  const thingConfigsObject = thingConfigs.reduce((prev, thingConfig) => {
    const { name } = thingConfig;
    // eslint-disable-next-line no-param-reassign
    prev[name] = thingConfig;
    return prev;
  }, {});
  thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .reduce((prev, thingConfig) => {
      const { name, relationalFields } = thingConfig;

      const thingQueryResolver = createThingQueryResolver(thingConfig);

      // eslint-disable-next-line no-param-reassign
      prev.Query[name] = thingQueryResolver;

      const createThingMutationResolver = createCreateThingMutationResolver(thingConfig);

      // eslint-disable-next-line no-param-reassign
      prev.Mutation[`create${name}`] = createThingMutationResolver;

      if (relationalFields) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = createThingResolver(thingConfig, thingConfigsObject);
      }
      return prev;
    }, resolvers);

  return resolvers;
};

module.exports = composeGqlResolvers;
