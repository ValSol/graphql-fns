// @flow

import type { ThingConfig } from '../../flowTypes';

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  create${name}(data: ${name}CreateInput!): ${name}!`;

  return result;
};

export default createCreateThingMutationType;
