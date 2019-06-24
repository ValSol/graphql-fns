// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';

const createNewThingSubscriptionType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingWhereInputType = createThingWhereInputType(thingConfig);
  if (thingWhereInputType) {
    return `  new${name}(where: ${name}WhereInput): ${name}!`;
  }
  return `  new${name}: ${name}!`;
};

export default createNewThingSubscriptionType;
