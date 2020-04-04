// @flow
import type { ThingConfig } from '../../flowTypes';

const createUpdatedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const subscriptionArgs = [`where: ${name}WhereInput`];

  const result = `  updated${name}(${subscriptionArgs.join(', ')}): Updated${name}Payload!`;

  return result;
};

export default createUpdatedThingSubscriptionType;
