// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createThingCountQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);

  if (thingWhereInputType) return `  ${name}Count(where: ${name}WhereInput): String!`;

  return `  ${name}Count: String!`;
};

module.exports = createThingCountQueryType;
