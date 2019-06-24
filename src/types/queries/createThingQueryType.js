// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${name}(whereOne: ${name}WhereOneInput!): ${name}`;

  return result;
};

export default createThingQueryType;
