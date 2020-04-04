// @flow
import type { ThingConfig } from '../../flowTypes';

const createCreatedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `  created${name}(where: ${name}WhereInput): ${name}!`;
};

export default createCreatedThingSubscriptionType;
