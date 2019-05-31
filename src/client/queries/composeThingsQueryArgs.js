// @flow
import type { ThingConfig } from '../../flowTypes';

const pluralize = require('pluralize');

const createThingNearInputType = require('../../types/inputs/createThingNearInputType');
const createThingPaginationInputType = require('../../types/inputs/createThingPaginationInputType');
const createThingSortInputType = require('../../types/inputs/createThingSortInputType');
const createThingWhereInputType = require('../../types/inputs/createThingWhereInputType');

const composeThingCountQuery = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;
  const argsArray = [];

  const thingNearInputType = createThingNearInputType(thingConfig);
  if (thingNearInputType) {
    argsArray.push({ argName: 'near', argType: `${name}NearInput` });
  }

  const thingPaginationInputType = createThingPaginationInputType(thingConfig);
  if (thingPaginationInputType) {
    argsArray.push({ argName: 'pagination', argType: `${name}PaginationInput` });
  }

  const tThingWhereInputType = createThingWhereInputType(thingConfig);
  if (tThingWhereInputType) {
    argsArray.push({ argName: 'where', argType: `${name}WhereInput` });
  }

  const thingSortInputType = createThingSortInputType(thingConfig);
  if (thingSortInputType) {
    argsArray.push({ argName: 'sort', argType: `${name}SortInput` });
  }

  if (!argsArray.length) {
    return [`query ${pluralize(name)} {`, `  ${pluralize(name)} {`];
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`query ${pluralize(name)}(${args1}) {`, `  ${pluralize(name)}(${args2}) {`];
};

module.exports = composeThingCountQuery;
