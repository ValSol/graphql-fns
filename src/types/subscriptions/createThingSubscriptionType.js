// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../inputs/createThingWhereInputType');

const createThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const subscriptionArgs = [`whereOne: ${name}WhereOneInput`];

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) subscriptionArgs.push(`where: ${name}WhereInput`);

  subscriptionArgs.push(`mutation_in: [${name}SubscriptionMutationEnumeration!]!`);

  const result = `  ${name}Subscription(${subscriptionArgs.join(
    ', ',
  )}): ${name}SubscriptionPayload`;

  return result;
};

module.exports = createThingSubscriptionType;
