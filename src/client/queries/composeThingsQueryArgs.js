// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../../types/inputs/createThingNearInputType';
import createThingPaginationInputType from '../../types/inputs/createThingPaginationInputType';

const composeThingCountQuery = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;
  const argsArray = [
    { argName: 'where', argType: `${name}WhereInput` },
    { argName: 'sort', argType: `${name}SortInput` },
  ];

  const thingNearInputType = createThingNearInputType(thingConfig);
  if (thingNearInputType) {
    argsArray.push({ argName: 'near', argType: `${name}NearInput` });
  }

  const thingPaginationInputType = createThingPaginationInputType(thingConfig);
  if (thingPaginationInputType) {
    argsArray.push({ argName: 'pagination', argType: `${name}PaginationInput` });
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`query ${pluralize(name)}(${args1}) {`, `  ${pluralize(name)}(${args2}) {`];
};

export default composeThingCountQuery;
