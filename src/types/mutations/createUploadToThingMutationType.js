// @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name, fileFields } = thingConfig;

  if (fileFields && fileFields.length) {
    return `  uploadTo${name}(file: Upload!, options: ${name}UploadOptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadToThingMutationType;
