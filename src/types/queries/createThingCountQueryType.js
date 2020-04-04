// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingCountQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `  ${name}Count(where: ${name}WhereInput): Int!`;
};

export default createThingCountQueryType;
