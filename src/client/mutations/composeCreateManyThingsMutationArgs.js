// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

const composeCreateThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation ${prefixName}_createMany${pluralize(name)}($data: [${name}CreateInput!]!) {`,
    `  createMany${pluralize(name)}(data: $data) {`,
  ];

  return result;
};

export default composeCreateThingMutationArgs;
