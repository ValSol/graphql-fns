// @flow
import type { ThingConfig } from '../flowTypes';

const { DateTime } = require('@okgrow/graphql-scalars');

const createThingQueryResolver = require('./queries/createThingQueryResolver');
const createCreateThingMutationResolver = require('./mutations/createCreateThingMutationResolver');

type ThingConfigs = Array<ThingConfig>;

const composeGqlResolvers = (thingConfigs: ThingConfigs): Object => {
  const resolvers = { DateTime, Query: {}, Mutation: {}, Subscription: {} };
  thingConfigs.reduce((prev, thingConfig) => {
    const { thingName } = thingConfig;
    const thingQueryResolver = createThingQueryResolver(thingConfig);
    // eslint-disable-next-line no-param-reassign
    prev.Query[thingName] = thingQueryResolver;
    const createThingMutationResolver = createCreateThingMutationResolver(thingConfig);
    // eslint-disable-next-line no-param-reassign
    prev.Mutation[`create${thingName}`] = createThingMutationResolver;
    return prev;
  }, resolvers);

  return resolvers;
};

module.exports = composeGqlResolvers;
