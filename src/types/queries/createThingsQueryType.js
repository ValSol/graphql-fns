// @flow
import type { ThingConfig } from '../../flowTypes';

const pluralize = require('pluralize');

const createThingsQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${pluralize(name)}(where: ${name}WhereInput): [${name}!]!`;

  return result;
};

module.exports = createThingsQueryType;
