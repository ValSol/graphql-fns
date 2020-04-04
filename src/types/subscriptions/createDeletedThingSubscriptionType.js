// @flow
import type { ThingConfig } from '../../flowTypes';

const createDeletedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `  deleted${name}(where: ${name}WhereInput): ${name}!`;
};

export default createDeletedThingSubscriptionType;
