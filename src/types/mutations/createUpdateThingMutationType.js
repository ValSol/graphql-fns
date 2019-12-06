// @flow

import type { ThingConfig } from '../../flowTypes';

const createDeleteThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  update${name}(whereOne: ${name}WhereOneInput!, data: ${name}UpdateInput!): ${name}!`;
  return result;
};

export default createDeleteThingMutationType;
