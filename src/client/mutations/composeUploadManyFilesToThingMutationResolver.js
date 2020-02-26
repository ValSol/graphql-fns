// @flow
import type { ThingConfig } from '../../flowTypes';

const composeUploadManyFilesToThingMutationResolver = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation uploadManyFilesTo${name}($whereOne: ${name}WhereOneInput!, $files: [Upload!]!, $options: ManyFilesOf${name}OptionsInput!) {`,
    `  uploadManyFilesTo${name}(whereOne: $whereOne, files: $files, options: $options) {`,
  ];

  return result;
};

export default composeUploadManyFilesToThingMutationResolver;
