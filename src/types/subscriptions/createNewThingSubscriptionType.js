// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createNewThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) {
    return `  new${name}(where: ${name}WhereInput): ${name}!`;
  }
  return `  new${name}: ${name}!`;
};

module.exports = createNewThingSubscriptionType;
