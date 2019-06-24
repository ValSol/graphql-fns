// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';

const createCreatedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) {
    return `  created${name}(where: ${name}WhereInput): ${name}!`;
  }
  return `  created${name}: ${name}!`;
};

export default createCreatedThingSubscriptionType;
