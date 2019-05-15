// @flow
import type { ThingConfig } from '../../flowTypes';

const composDeleteThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation delete${name}($whereOne: ${name}WhereOneInput!) {`,
    `  delete${name}(whereOne: $whereOne) {`,
  ];

  return result;
};

module.exports = composDeleteThingMutationArgs;
