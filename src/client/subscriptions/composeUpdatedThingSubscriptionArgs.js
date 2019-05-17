// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../../types/inputs/createThingWhereInputType');

const composeUpdatedThingSubscriptionArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [{ argName: 'whereOne', argType: `${name}WhereOneInput` }];

  const ThingWhereInputType = createThingWhereInputType(thingConfig);
  if (ThingWhereInputType) {
    argsArray.push({ argName: 'where', argType: `${name}WhereInput` });
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription updated${name}(${args1}) {`, `  updated${name}(${args2}) {`];
};

module.exports = composeUpdatedThingSubscriptionArgs;
