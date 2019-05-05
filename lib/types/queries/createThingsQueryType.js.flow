// @flow
import type { ThingConfig } from '../../flowTypes';

const pluralize = require('pluralize');

const createThingNearInputType = require('../inputs/createThingNearInputType');
const createThingPaginationInputType = require('../inputs/createThingPaginationInputType');
const createThingSortInputType = require('../inputs/createThingSortInputType');
const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createThingsQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const mutationArgs = [];

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) mutationArgs.push(`where: ${name}WhereInput`);

  const thingSortInputType = createThingSortInputType(thingConfig);
  if (thingSortInputType) mutationArgs.push(`sort: ${name}SortInput`);

  const thingPaginationInputType = createThingPaginationInputType(thingConfig);
  if (thingPaginationInputType) mutationArgs.push(`pagination: ${name}PaginationInput`);

  const thingNearInputType = createThingNearInputType(thingConfig);
  if (thingNearInputType) mutationArgs.push(`near: ${name}NearInput`);

  const result = mutationArgs.length
    ? `  ${pluralize(name)}(${mutationArgs.join(', ')}): [${name}!]!`
    : `  ${pluralize(name)}: [${name}!]!`;

  return result;
};

module.exports = createThingsQueryType;
