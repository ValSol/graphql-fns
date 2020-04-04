// @flow
import type { ThingConfig } from '../../flowTypes';

const composeCreatedThingSubscriptionArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [{ argName: 'where', argType: `${name}WhereInput` }];

  if (!argsArray.length) {
    return [`subscription created${name} {`, `  created${name} {`];
  }

  const args1 = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`).join(', ');
  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription created${name}(${args1}) {`, `  created${name}(${args2}) {`];
};

export default composeCreatedThingSubscriptionArgs;
