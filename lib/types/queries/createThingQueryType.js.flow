// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${name}(where: ${name}WhereOneInput!): ${name}`;

  return result;
};

module.exports = createThingQueryType;
