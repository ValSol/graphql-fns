// @flow

import type { ThingConfig } from '../../flowTypes';

import createUploadFilesToThingInputType from '../inputs/createUploadFilesToThingInputType';
import createThingReorderUploadedInputType from '../inputs/createThingReorderUploadedInputType';

const createUploadFilesToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const filesOfThingOptionsInputType = createUploadFilesToThingInputType(thingConfig);

  if (filesOfThingOptionsInputType) {
    const thingReorderUploadedInputType = createThingReorderUploadedInputType(thingConfig);

    const reorderField = thingReorderUploadedInputType
      ? `, positions: ${name}ReorderUploadedInput`
      : '';

    return `  uploadFilesTo${name}(whereOne: ${name}WhereOneInput!, data: UploadFilesTo${name}Input, files: [Upload!]!, options: FilesOf${name}OptionsInput!${reorderField}): ${name}!`;
  }

  return '';
};

export default createUploadFilesToThingMutationType;
