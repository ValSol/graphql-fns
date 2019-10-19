// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

const createImportThingsMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  import${pluralize(name)}(file: Upload!): [${name}!]!`;

  return result;
};

export default createImportThingsMutationType;
