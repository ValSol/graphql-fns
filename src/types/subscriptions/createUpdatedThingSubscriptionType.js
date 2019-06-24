// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';

const createUpdatedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const subscriptionArgs = [`whereOne: ${name}WhereOneInput`];

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) subscriptionArgs.push(`where: ${name}WhereInput`);

  const result = `  updated${name}(${subscriptionArgs.join(', ')}): Updated${name}Payload!`;

  return result;
};

export default createUpdatedThingSubscriptionType;
