// @flow
import type { ThingConfig } from '../../flowTypes';

const composeConcatenateThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation concatenate${name}($whereOne: ${name}WhereOneInput!, $data: ${name}ConcatenateInput!) {`,
    `  concatenate${name}(whereOne: $whereOne, data: $data) {`,
  ];

  return result;
};

export default composeConcatenateThingMutationArgs;
