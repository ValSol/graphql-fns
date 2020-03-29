// @flow
import type { ThingConfig } from '../../flowTypes';

const composePushIntoThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation pushInto${name}($whereOne: ${name}WhereOneInput!, $data: PushInto${name}Input!) {`,
    `  pushInto${name}(whereOne: $whereOne, data: $data) {`,
  ];

  return result;
};

export default composePushIntoThingMutationArgs;
