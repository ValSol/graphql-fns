// @flow

import type { ThingConfig } from '../../flowTypes';

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `  create${thingName}(data: ${thingName}CreateInput!): ${thingName}!`;

  return result;
};

module.exports = createCreateThingMutationType;
