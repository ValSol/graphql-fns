// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

const composeImportThingsMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation import${pluralize(name)}($file: Upload!) {`,
    `  import${pluralize(name)}(file: $file) {`,
  ];

  return result;
};

export default composeImportThingsMutationArgs;
