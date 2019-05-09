// @flow

import type { GeneralConfig } from '../flowTypes';

const checkInventory = require('../utils/checkInventory');
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
  const { thingConfigs, inventory } = generalConfig;

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);

  const thingTypes = thingConfigs.map(thingConfig => createThingType(thingConfig)).join('\n');

  const thingInputTypes = allowMutations
    ? thingConfigs
        .map(
          thingConfig => `${createThingCreateInputType(thingConfig)}
${createThingUpdateInputType(thingConfig)}
`,
        )
        .join('')
    : '';

  const thingInputTypes3 = thingConfigs
    .filter(({ embedded }) => !embedded)
    .map(
      thingConfig =>
        `${createThingWhereOneInputType(thingConfig)}${
          allowQueries ? createThingWhereInputType(thingConfig) : ''
        }${allowQueries ? createThingSortInputType(thingConfig) : ''}${
          allowQueries ? createThingPaginationInputType(thingConfig) : ''
        }${allowQueries ? createThingNearInputType(thingConfig) : ''}`,
    )
    .join('\n');

  const thingQueryTypes = allowQueries
    ? thingConfigs
        .filter(({ embedded }) => !embedded)
        .map(
          thingConfig => `${createThingQueryType(thingConfig)}
${createThingsQueryType(thingConfig)}`,
        )
        .join('\n')
    : '';
  const thingQueryTypes2 = allowQueries
    ? `
type Query {
${thingQueryTypes}
}`
    : '';

  const thingMutationTypes = allowMutations
    ? thingConfigs
        .filter(({ embedded }) => !embedded)
        .map(
          thingConfig => `${createCreateThingMutationType(thingConfig)}
${createUpdateThingMutationType(thingConfig)}
${createDeleteThingMutationType(thingConfig)}`,
        )
        .join('\n')
    : '';
  const thingMutationTypes2 = allowMutations
    ? `
type Mutation {
${thingMutationTypes}
}`
    : '';

  const result = `scalar DateTime${composeEnumTypes(generalConfig)}${composeGeospatialTypes(
    generalConfig,
  )}
${thingTypes}
${thingInputTypes}${thingInputTypes3}${thingQueryTypes2}${thingMutationTypes2}`;

  return result;
};

module.exports = composeGqlTypes;
