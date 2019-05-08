// @flow

import type { GeneralConfig } from '../flowTypes';

const createThingType = require('./createThingType');
const createThingCreateInputType = require('./inputs/createThingCreateInputType');
const createThingPaginationInputType = require('./inputs/createThingPaginationInputType');
const createThingUpdateInputType = require('./inputs/createThingUpdateInputType');
const createThingNearInputType = require('./inputs/createThingNearInputType');
const createThingSortInputType = require('./inputs/createThingSortInputType');
const createThingWhereInputType = require('./inputs/createThingWhereInputType');
const createThingWhereOneInputType = require('./inputs/createThingWhereOneInputType');
const createThingQueryType = require('./queries/createThingQueryType');
const createThingsQueryType = require('./queries/createThingsQueryType');
const createCreateThingMutationType = require('./mutations/createCreateThingMutationType');
const createUpdateThingMutationType = require('./mutations/createUpdateThingMutationType');
const createDeleteThingMutationType = require('./mutations/createDeleteThingMutationType');
const composeEnumTypes = require('./specialized/composeEnumTypes');
const composeGeospatialTypes = require('./specialized/composeGeospatialTypes');

const composeGqlTypes = (generalConfig: GeneralConfig): string => {
  const { thingConfigs } = generalConfig;
  const thingTypes = thingConfigs.map(thingConfig => createThingType(thingConfig)).join('\n');

  const thingInputTypes = thingConfigs
    .map(
      thingConfig => `${createThingCreateInputType(thingConfig)}
${createThingUpdateInputType(thingConfig)}`,
    )
    .join('\n');

  const thingInputTypes2 = thingConfigs
    .filter(({ embedded }) => !embedded)
    .map(
      thingConfig =>
        `${createThingWhereOneInputType(thingConfig)}${createThingWhereInputType(
          thingConfig,
        )}${createThingSortInputType(thingConfig)}${createThingPaginationInputType(
          thingConfig,
        )}${createThingNearInputType(thingConfig)}`,
    )
    .join('\n');

  const thingQueryTypes = thingConfigs
    .filter(({ embedded }) => !embedded)
    .map(
      thingConfig => `${createThingQueryType(thingConfig)}
${createThingsQueryType(thingConfig)}`,
    )
    .join('\n');

  const thingMutationTypes = thingConfigs
    .filter(({ embedded }) => !embedded)
    .map(
      thingConfig => `${createCreateThingMutationType(thingConfig)}
${createUpdateThingMutationType(thingConfig)}
${createDeleteThingMutationType(thingConfig)}`,
    )
    .join('\n');

  const result = `scalar DateTime${composeEnumTypes(generalConfig)}${composeGeospatialTypes(
    generalConfig,
  )}
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
