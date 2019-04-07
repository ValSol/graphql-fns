// @flow
const { DateTime } = require('@okgrow/graphql-scalars');

const createCreateThingMutationResolver = require('./createCreateThingMutationResolver');

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };
type ThingConfigs = Array<ThingConfig>;

const composeGqlResolvers = (thingConfigs: ThingConfigs): Object => {
  const resolvers = { DateTime, Mutation: {} };
  thingConfigs.reduce((prev, thingConfig) => {
    const { thingName } = thingConfig;
    const createThingMutationResolver = createCreateThingMutationResolver(thingConfig);
    // eslint-disable-next-line no-param-reassign
    prev.Mutation[`create${thingName}`] = createThingMutationResolver;
    return prev;
  }, resolvers);

  return resolvers;
};

module.exports = composeGqlResolvers;
