// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

const createCreateManyThingsMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  createMany${pluralize(name)}(data: [${name}CreateInput!]!): [${name}!]!`;

  return result;
};

export default createCreateManyThingsMutationType;
