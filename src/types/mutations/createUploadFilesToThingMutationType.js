// @flow

import type { ThingConfig } from '../../flowTypes';

import createUploadFilesToThingOptionsInputType from '../inputs/createUploadFilesToThingOptionsInputType';

const createUploadFilesToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const uploadFilesToThingOptionsInput = createUploadFilesToThingOptionsInputType(thingConfig);

  if (uploadFilesToThingOptionsInput) {
    return `  uploadFilesTo${name}(whereOne: ${name}WhereOneInput!, files: [Upload!]!, options: UploadFilesTo${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadFilesToThingMutationType;
