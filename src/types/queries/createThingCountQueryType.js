// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createThingCountQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);

  if (thingWhereInputType) return `  ${name}Count(where: ${name}WhereInput): Int!`;

  return `  ${name}Count: Int!`;
};

module.exports = createThingCountQueryType;
