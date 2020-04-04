// @flow
import type { ThingConfig } from '../../flowTypes';

const composeUpdatedThingSubscriptionArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [{ argName: 'where', argType: `${name}WhereInput` }];

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription updated${name}(${args1}) {`, `  updated${name}(${args2}) {`];
};

export default composeUpdatedThingSubscriptionArgs;
