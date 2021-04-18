// @flow

import type { ThingConfig } from '../../flowTypes';

import createFilesOfThingOptionsInputType from '../inputs/createFilesOfThingOptionsInputType';
import createThingReorderCreatedInputType from '../inputs/createThingReorderCreatedInputType';
import createUploadFilesToThingInputType from '../inputs/createUploadFilesToThingInputType';

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const mutationArgs = [`data: ${name}CreateInput!`];

  const thingReorderCreatedInputType = createThingReorderCreatedInputType(thingConfig);
  if (thingReorderCreatedInputType) {
    mutationArgs.push(`positions: ${name}ReorderCreatedInput`);
  }

  const filesOfThingOptionsInputType = createFilesOfThingOptionsInputType(thingConfig);
  if (filesOfThingOptionsInputType) {
    mutationArgs.push(`optionsForUpload: FilesOf${name}OptionsInput`);
  }

  const uploadFilesToThingInputType = createUploadFilesToThingInputType(thingConfig);
  if (uploadFilesToThingInputType) {
    mutationArgs.push(`dataForUpload: UploadFilesTo${name}Input`);
  }

  return `  create${name}(${mutationArgs.join(', ')}): ${name}!`;
};

export default createCreateThingMutationType;
