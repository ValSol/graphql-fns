// @flow

import type { ThingConfig } from '../../flowTypes';

const createDeleteThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  update${name}(where: ${name}WhereInput! data: ${name}UpdateInput!): ${name}!`;
  return result;
};

module.exports = createDeleteThingMutationType;
