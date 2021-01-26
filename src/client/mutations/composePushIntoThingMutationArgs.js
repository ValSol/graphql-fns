// @flow
import type { ThingConfig } from '../../flowTypes';

const composePushIntoThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation ${prefixName}_pushInto${name}($whereOne: ${name}WhereOneInput!, $data: PushInto${name}Input!) {`,
    `  pushInto${name}(whereOne: $whereOne, data: $data) {`,
  ];

  return result;
};

export default composePushIntoThingMutationArgs;
