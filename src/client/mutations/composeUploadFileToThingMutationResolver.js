// @flow
import type { ThingConfig } from '../../flowTypes';

const composeUploadFileToThingMutationResolver = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `mutation uploadFileTo${name}($whereOne: ${name}WhereOneInput!, $file: Upload!, $options: FileOf${name}OptionsInput!) {`,
    `  uploadFileTo${name}(whereOne: $whereOne, file: $file, options: $options) {`,
  ];

  return result;
};

export default composeUploadFileToThingMutationResolver;
