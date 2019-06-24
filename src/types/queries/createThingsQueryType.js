// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../inputs/createThingNearInputType';
import createThingPaginationInputType from '../inputs/createThingPaginationInputType';
import createThingSortInputType from '../inputs/createThingSortInputType';
import createThingWhereInputType from '../inputs/createThingWhereInputType';

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

export default createThingsQueryType;
