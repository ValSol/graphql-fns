// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

const composeImportThingsMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation import${pluralize(name)}($file: Upload!, $options: ImportOptionsInput) {`,
    `  import${pluralize(name)}(file: $file, options: $options) {`,
  ];

  return result;
};

export default composeImportThingsMutationArgs;
