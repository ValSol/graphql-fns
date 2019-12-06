// @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name, fileFields } = thingConfig;

  if (fileFields && fileFields.length) {
    return `  uploadTo${name}(whereOne: ${name}WhereOneInput!, file: Upload!, options: ${name}UploadOptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadToThingMutationType;
