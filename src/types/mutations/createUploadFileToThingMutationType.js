// @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadFileToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name, fileFields } = thingConfig;

  if (fileFields && fileFields.length) {
    return `  uploadFileTo${name}(whereOne: ${name}WhereOneInput!, file: Upload!, options: UploadFileTo${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadFileToThingMutationType;
