// @flow
import type { ThingConfig } from '../../flowTypes';

const composeUpdatedThingSubscriptionArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
  childArgs: { [argName: string]: string },
): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [{ argName: 'where', argType: `${name}WhereInput` }];

  const args1arr = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`);
  Object.keys(childArgs).forEach((argName) => {
    args1arr.push(`$${argName}: ${childArgs[argName]}`);
  });
  const args1 = args1arr.join(', ');

  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription ${prefixName}_updated${name}(${args1}) {`, `  updated${name}(${args2}) {`];
};

export default composeUpdatedThingSubscriptionArgs;
