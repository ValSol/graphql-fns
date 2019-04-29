// @flow
import type { ThingConfig } from '../../flowTypes';

const pluralize = require('pluralize');

const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createThingsQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);

  const result = thingWhereInputType
    ? `  ${pluralize(name)}(where: ${name}WhereInput): [${name}!]!`
    : `  ${pluralize(name)}: [${name}!]!`;

  return result;
};

module.exports = createThingsQueryType;
