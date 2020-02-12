// @flow

import type { ThingConfig } from '../../flowTypes';

import createUploadFileToThingOptionsInputType from '../inputs/createUploadFileToThingOptionsInputType';

const createUploadFileToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const uploadFileToThingOptionsInput = createUploadFileToThingOptionsInputType(thingConfig);

  if (uploadFileToThingOptionsInput) {
    return `  uploadFileTo${name}(whereOne: ${name}WhereOneInput!, file: Upload!, options: UploadFileTo${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadFileToThingMutationType;
