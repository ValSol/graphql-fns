// @flow

import type { ThingConfig } from '../flowTypes';

const createThingType = require('./createThingType');
const createThingCreateInputType = require('./inputs/createThingCreateInputType');
const createThingUpdateInputType = require('./inputs/createThingUpdateInputType');
const createThingWhereInputType = require('./inputs/createThingWhereInputType');
const createThingQueryType = require('./queries/createThingQueryType');
const createCreateThingMutationType = require('./mutations/createCreateThingMutationType');
const createUpdateThingMutationType = require('./mutations/createUpdateThingMutationType');
const createDeleteThingMutationType = require('./mutations/createDeleteThingMutationType');

type ThingConfigs = Array<ThingConfig>;

const composeGqlTypes = (thingConfigs: ThingConfigs): string => {
  const thingTypes = thingConfigs.map(thingConfig => createThingType(thingConfig)).join('\n');

  const thingInputTypes = thingConfigs
    .map(
      thingConfig => `${createThingCreateInputType(thingConfig)}
${createThingUpdateInputType(thingConfig)}
${createThingWhereInputType(thingConfig)}`,
    )
    .join('\n');

  const thingQueryTypes = thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .map(thingConfig => createThingQueryType(thingConfig))
    .join('\n');

  const thingMutationTypes = thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .map(
      thingConfig => `${createCreateThingMutationType(thingConfig)}
${createUpdateThingMutationType(thingConfig)}
${createDeleteThingMutationType(thingConfig)}`,
    )
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
