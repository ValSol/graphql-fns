// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

const composeCreateThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation createMany${pluralize(name)}($data: [${name}CreateInput!]!) {`,
    `  createMany${pluralize(name)}(data: $data) {`,
  ];

  return result;
};

export default composeCreateThingMutationArgs;
