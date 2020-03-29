// @flow

import type { ThingConfig } from '../../flowTypes';

import createPushIntoThingInputType from '../inputs/createPushIntoThingInputType';

const createPushIntoThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const pushIntoThingInputType = createPushIntoThingInputType(thingConfig);

  if (pushIntoThingInputType) {
    return `  pushInto${name}(whereOne: ${name}WhereOneInput!, data: PushInto${name}Input!): ${name}!`;
  }

  return '';
};

export default createPushIntoThingMutationType;
