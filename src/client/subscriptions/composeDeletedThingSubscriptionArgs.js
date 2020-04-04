// @flow
import type { ThingConfig } from '../../flowTypes';

const composeDeletedThingSubscriptionArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [{ argName: 'where', argType: `${name}WhereInput` }];

  if (!argsArray.length) {
    return [`subscription deleted${name} {`, `  deleted${name} {`];
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription deleted${name}(${args1}) {`, `  deleted${name}(${args2}) {`];
};

export default composeDeletedThingSubscriptionArgs;
