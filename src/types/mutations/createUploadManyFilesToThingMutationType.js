// @flow

import type { ThingConfig } from '../../flowTypes';

import createUploadManyFilesToThingOptionsInputType from '../inputs/createUploadManyFilesToThingOptionsInputType';

const createUploadManyFilesToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const uploadManyFilesToThingOptionsInput = createUploadManyFilesToThingOptionsInputType(
    thingConfig,
  );

  if (uploadManyFilesToThingOptionsInput) {
    return `  uploadManyFilesTo${name}(whereOne: ${name}WhereOneInput!, files: [Upload!]!, options: UploadManyFilesTo${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadManyFilesToThingMutationType;
