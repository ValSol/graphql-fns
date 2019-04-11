// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingQueryType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `  ${thingName}(where: ${thingName}WhereInput!): ${thingName}`;

  return result;
};

module.exports = createThingQueryType;
