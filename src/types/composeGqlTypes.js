// @flow
const createThingType = require('./createThingType');
const createThingCreateInputType = require('./inputs/createThingCreateInputType');
const createThingWhereInputType = require('./inputs/createThingWhereInputType');
const createThingQueryType = require('./queries/createThingQueryType');
const createCreateThingMutationType = require('./mutations/createCreateThingMutationType');

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };
type ThingConfigs = Array<ThingConfig>;

const composeGqlTypes = (thingConfigs: ThingConfigs): string => {
  const thingTypes = thingConfigs.map(thingConfig => createThingType(thingConfig)).join('\n');
  const thingInputTypes = thingConfigs
    .map(
      thingConfig => `${createThingCreateInputType(thingConfig)}
${createThingWhereInputType(thingConfig)}`,
    )
    .join('\n');
  const thingQueryTypes = thingConfigs
    .map(thingConfig => createThingQueryType(thingConfig))
    .join('\n');
  const thingMutationTypes = thingConfigs
    .map(thingConfig => createCreateThingMutationType(thingConfig))
    .join('\n');

  const result = `scalar DateTime
${thingTypes}
${thingInputTypes}
type Query {
${thingQueryTypes}
}
type Mutation {
${thingMutationTypes}
}`;

  return result;
};

module.exports = composeGqlTypes;
