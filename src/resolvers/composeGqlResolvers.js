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
    const { thingName } = thingConfig;
    // eslint-disable-next-line no-param-reassign
    prev[thingName] = thingConfig;
    return prev;
  }, {});
  thingConfigs.reduce((prev, thingConfig) => {
    const { thingName, relationalFields } = thingConfig;
    const thingQueryResolver = createThingQueryResolver(thingConfig);
    // eslint-disable-next-line no-param-reassign
    prev.Query[thingName] = thingQueryResolver;
    const createThingMutationResolver = createCreateThingMutationResolver(thingConfig);
    // eslint-disable-next-line no-param-reassign
    prev.Mutation[`create${thingName}`] = createThingMutationResolver;
    if (relationalFields) {
      // eslint-disable-next-line no-param-reassign
      prev[thingName] = createThingResolver(thingConfig, thingConfigsObject);
    }
    return prev;
  }, resolvers);

  return resolvers;
};

module.exports = composeGqlResolvers;
