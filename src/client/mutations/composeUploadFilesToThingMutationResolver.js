// @flow
import type { ThingConfig } from '../../flowTypes';

const composeUploadFilesToThingMutationResolver = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation uploadFilesTo${name}($whereOne: ${name}WhereOneInput!, $files: [Upload!]!, $options: FilesOf${name}OptionsInput!) {`,
    `  uploadFilesTo${name}(whereOne: $whereOne, files: $files, options: $options) {`,
  ];

  return result;
};

export default composeUploadFilesToThingMutationResolver;
