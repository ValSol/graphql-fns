// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../../types/inputs/createThingNearInputType';
import createThingPaginationInputType from '../../types/inputs/createThingPaginationInputType';
import createThingSortInputType from '../../types/inputs/createThingSortInputType';

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

  argsArray.push({ argName: 'where', argType: `${name}WhereInput` });

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

export default composeThingCountQuery;
