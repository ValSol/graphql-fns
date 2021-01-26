// @flow
import type { ThingConfig } from '../../flowTypes';

const composeDeleteThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation ${prefixName}_delete${name}($whereOne: ${name}WhereOneInput!) {`,
    `  delete${name}(whereOne: $whereOne) {`,
  ];

  return result;
};

export default composeDeleteThingMutationArgs;
