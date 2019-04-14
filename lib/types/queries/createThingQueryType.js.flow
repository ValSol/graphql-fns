// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${name}(where: ${name}WhereInput!): ${name}`;

  return result;
};

module.exports = createThingQueryType;
