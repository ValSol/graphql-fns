// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../inputs/createThingNearInputType';
import createThingPaginationInputType from '../inputs/createThingPaginationInputType';

const createThingsQueryType = (thingConfig: ThingConfig): string => {
  const { name, textFields } = thingConfig;

  const mutationArgs = [`where: ${name}WhereInput`, `sort: ${name}SortInput`];

  const thingPaginationInputType = createThingPaginationInputType(thingConfig);
  if (thingPaginationInputType) mutationArgs.push(`pagination: ${name}PaginationInput`);

  const thingNearInputType = createThingNearInputType(thingConfig);
  if (thingNearInputType) mutationArgs.push(`near: ${name}NearInput`);

  const textIndex = textFields ? textFields.some(({ weight }) => weight) : false;
  if (textIndex) mutationArgs.push('search: String');

  return `  ${pluralize(name)}(${mutationArgs.join(', ')}): [${name}!]!`;
};

export default createThingsQueryType;
