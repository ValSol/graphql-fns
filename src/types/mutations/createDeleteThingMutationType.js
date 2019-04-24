// @flow

import type { ThingConfig } from '../../flowTypes';

const createDeleteThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  delete${name}(where: ${name}WhereInput!): ${name}!`;

  return result;
};

module.exports = createDeleteThingMutationType;
