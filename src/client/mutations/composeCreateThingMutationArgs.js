// @flow
import type { ThingConfig } from '../../flowTypes';

const composeCreateThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation create${name}($data: ${name}CreateInput!) {`,
    `  create${name}(data: $data) {`,
  ];

  return result;
};

export default composeCreateThingMutationArgs;
