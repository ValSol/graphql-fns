// @flow

import type { ThingConfig } from '../../flowTypes';

import createFilesOfThingOptionsInputType from '../inputs/createFilesOfThingOptionsInputType';

const createUploadFilesToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const filesOfThingOptionsInputType = createFilesOfThingOptionsInputType(thingConfig);

  if (filesOfThingOptionsInputType) {
    return `  uploadFilesTo${name}(whereOne: ${name}WhereOneInput!, files: [Upload!]!, options: FilesOf${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadFilesToThingMutationType;
