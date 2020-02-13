// @flow

import type { ThingConfig } from '../../flowTypes';

import createFileOfThingOptionsInputType from '../inputs/createFileOfThingOptionsInputType';

const createUploadFileToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const fileOfThingOptionsInput = createFileOfThingOptionsInputType(thingConfig);

  if (fileOfThingOptionsInput) {
    return `  uploadFileTo${name}(whereOne: ${name}WhereOneInput!, file: Upload!, options: FileOf${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadFileToThingMutationType;
