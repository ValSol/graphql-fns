// @flow
import type { ThingConfig } from '../../flowTypes';

const composeDeletedThingSubscriptionArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
  childArgs: { [argName: string]: string },
): Array<string> => {
  const { name } = thingConfig;

  const argsArray = [{ argName: 'where', argType: `${name}WhereInput` }];

  if (!argsArray.length) {
    return [`subscription ${prefixName}_deleted${name} {`, `  deleted${name} {`];
  }

  const args1arr = argsArray.map(({ argName, argType }) => `$${argName}: ${argType}`);
  Object.keys(childArgs).forEach((argName) => {
    args1arr.push(`$${argName}: ${childArgs[argName]}`);
  });
  const args1 = args1arr.join(', ');

  const args2 = argsArray.map(({ argName }) => `${argName}: $${argName}`).join(', ');

  return [`subscription ${prefixName}_deleted${name}(${args1}) {`, `  deleted${name}(${args2}) {`];
};

export default composeDeletedThingSubscriptionArgs;
