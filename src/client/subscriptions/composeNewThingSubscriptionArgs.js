// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('../../types/inputs/createThingWhereInputType');

const composeNewThingSubscriptionArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [];

  const ThingWhereInputType = createThingWhereInputType(thingConfig);
  if (ThingWhereInputType) {
    argsArray.push({ argName: 'where', argType: `${name}WhereInput` });
  }

  if (!argsArray.length) {
    return [`subscription new${name} {`, `  new${name} {`];
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription new${name}(${args1}) {`, `  new${name}(${args2}) {`];
};

module.exports = composeNewThingSubscriptionArgs;
