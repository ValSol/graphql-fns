// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';

const createThingCountQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);

  if (thingWhereInputType) return `  ${name}Count(where: ${name}WhereInput): Int!`;

  return `  ${name}Count: Int!`;
};

export default createThingCountQueryType;
