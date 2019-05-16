// @flow
import type { ThingConfig } from '../../flowTypes';

const composUpdateThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation update${name}($whereOne: ${name}WhereOneInput!, $data: ${name}UpdateInput!) {`,
    `  update${name}(whereOne: $whereOne, data: $data) {`,
  ];

  return result;
};

module.exports = composUpdateThingMutationArgs;
