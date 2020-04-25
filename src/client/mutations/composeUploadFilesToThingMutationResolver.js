// @flow
import type { ThingConfig } from '../../flowTypes';

const composeUploadFilesToThingMutationResolver = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation uploadFilesTo${name}($whereOne: ${name}WhereOneInput!, $data: UploadFilesTo${name}Input, $files: [Upload!]!, $options: FilesOf${name}OptionsInput!) {`,
    `  uploadFilesTo${name}(whereOne: $whereOne, data: $data, files: $files, options: $options) {`,
  ];

  return result;
};

export default composeUploadFilesToThingMutationResolver;
