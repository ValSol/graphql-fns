// @flow

import type { ThingConfig } from '../flowTypes';

const createThingType = require('./createThingType');
const createThingCreateInputType = require('./inputs/createThingCreateInputType');
const createThingPaginationInputType = require('./inputs/createThingPaginationInputType');
const createThingUpdateInputType = require('./inputs/createThingUpdateInputType');
const createThingNearInputType = require('./inputs/createThingNearInputType');
const createThingWhereInputType = require('./inputs/createThingWhereInputType');
const createThingWhereOneInputType = require('./inputs/createThingWhereOneInputType');
const createThingQueryType = require('./queries/createThingQueryType');
const createThingsQueryType = require('./queries/createThingsQueryType');
const createCreateThingMutationType = require('./mutations/createCreateThingMutationType');
const createUpdateThingMutationType = require('./mutations/createUpdateThingMutationType');
const createDeleteThingMutationType = require('./mutations/createDeleteThingMutationType');
const composeGeospatialTypes = require('./specialized/composeGeospatialTypes');

type ThingConfigs = Array<ThingConfig>;

const composeGqlTypes = (thingConfigs: ThingConfigs): string => {
  const thingTypes = thingConfigs.map(thingConfig => createThingType(thingConfig)).join('\n');

  const thingInputTypes = thingConfigs
    .map(
      thingConfig => `${createThingCreateInputType(thingConfig)}
${createThingUpdateInputType(thingConfig)}`,
    )
    .join('\n');

  const thingInputTypes2 = thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .map(
      thingConfig =>
        `${createThingWhereOneInputType(thingConfig)}${createThingWhereInputType(
          thingConfig,
        )}${createThingPaginationInputType(thingConfig)}${createThingNearInputType(thingConfig)}`,
    )
    .join('\n');

  const thingQueryTypes = thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .map(
      thingConfig => `${createThingQueryType(thingConfig)}
${createThingsQueryType(thingConfig)}`,
    )
    .join('\n');

  const thingMutationTypes = thingConfigs
    .filter(({ isEmbedded }) => !isEmbedded)
    .map(
      thingConfig => `${createCreateThingMutationType(thingConfig)}
${createUpdateThingMutationType(thingConfig)}
${createDeleteThingMutationType(thingConfig)}`,
    )
    .join('\n');

  const result = `scalar DateTime${composeGeospatialTypes(thingConfigs)}
${thingTypes}
${thingInputTypes}
${thingInputTypes2}
type Query {
${thingQueryTypes}
}
type Mutation {
${thingMutationTypes}
}`;

  return result;
};

module.exports = composeGqlTypes;
