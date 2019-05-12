// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createDeletedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const subscriptionArgs = [`whereOne: ${name}WhereOneInput`];

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) subscriptionArgs.push(`where: ${name}WhereInput`);

  const result = `  deleted${name}(${subscriptionArgs.join(', ')}): ${name}!`;

  return result;
};

module.exports = createDeletedThingSubscriptionType;
