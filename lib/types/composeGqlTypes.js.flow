// @flow
const createThingType = require('./createThingType');
const createThingCreateInputType = require('./createThingCreateInputType');
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
    .map(thingConfig => createThingCreateInputType(thingConfig))
    .join('\n');
  const thingMutationTypes = thingConfigs
    .map(thingConfig => createCreateThingMutationType(thingConfig))
    .join('\n');

  const result = `scalar DateTime
${thingTypes}
${thingInputTypes}
type Mutation {
${thingMutationTypes}
}`;

  return result;
};

module.exports = composeGqlTypes;
