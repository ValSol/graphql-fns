// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';

const createDeletedThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) {
    return `  deleted${name}(where: ${name}WhereInput): ${name}!`;
  }
  return `  deleted${name}: ${name}!`;
};

export default createDeletedThingSubscriptionType;
