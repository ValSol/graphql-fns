// @flow
const createAddThingMutationResolver = require('./createAddThingMutationResolver');

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };
type ThingConfigs = Array<ThingConfig>;

const composeGqlResolvers = (thingConfigs: ThingConfigs): Object => {
  const resolvers = { Mutation: {} };
  thingConfigs.reduce((prev, thingConfig) => {
    const { thingName } = thingConfig;
    const addThingMutationResolver = createAddThingMutationResolver(thingConfig);
    // eslint-disable-next-line no-param-reassign
    prev.Mutation[`add${thingName}`] = addThingMutationResolver;
    return prev;
  }, resolvers);

  return resolvers;
};

module.exports = composeGqlResolvers;
