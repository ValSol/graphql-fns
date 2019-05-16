// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../../types/inputs/createThingWhereInputType');

const composeDeletedThingSubscriptionArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [];

  const ThingWhereInputType = createThingWhereInputType(thingConfig);
  if (ThingWhereInputType) {
    argsArray.push({ argName: 'where', argType: `${name}WhereInput` });
  }

  if (!argsArray.length) {
    return [`subscription deleted${name} {`, `  deleted${name} {`];
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription deleted${name}(${args1}) {`, `  deleted${name}(${args2}) {`];
};

module.exports = composeDeletedThingSubscriptionArgs;
