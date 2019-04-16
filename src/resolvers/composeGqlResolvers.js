// @flow
import type { ThingConfig } from '../flowTypes';

const { DateTime } = require('@okgrow/graphql-scalars');

const createThingQueryResolver = require('./queries/createThingQueryResolver');
const composeThingResolvers = require('./types/composeThingResolvers');
const createCreateThingMutationResolver = require('./mutations/createCreateThingMutationResolver');

type ThingConfigs = Array<ThingConfig>;

const composeGqlResolvers = (thingConfigs: ThingConfigs): Object => {
  const resolvers = { DateTime, Query: {}, Mutation: {}, Subscription: {} };

  thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;

      const thingQueryResolver = createThingQueryResolver(thingConfig);

      // eslint-disable-next-line no-param-reassign
      prev.Query[name] = thingQueryResolver;

      const createThingMutationResolver = createCreateThingMutationResolver(thingConfig);

      // eslint-disable-next-line no-param-reassign
      prev.Mutation[`create${name}`] = createThingMutationResolver;
      return prev;
    }, resolvers);

  thingConfigs.reduce((prev, thingConfig) => {
    const { name, relationalFields } = thingConfig;
    if (relationalFields) {
      // eslint-disable-next-line no-param-reassign
      prev[name] = composeThingResolvers(thingConfig);
    }
    return prev;
  }, resolvers);

  return resolvers;
};

module.exports = composeGqlResolvers;
