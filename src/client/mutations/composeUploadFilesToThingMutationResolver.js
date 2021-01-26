// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingReorderUploadedInputType from '../../types/inputs/createThingReorderUploadedInputType';

const composeUploadFilesToThingMutationResolver = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const thingReorderUploadedInputType = createThingReorderUploadedInputType(thingConfig);

  const reorderField = thingReorderUploadedInputType
    ? [`, $positions: ${name}ReorderUploadedInput`, ', positions: $positions']
    : ['', ''];

  const result = [
    `mutation ${prefixName}_uploadFilesTo${name}($whereOne: ${name}WhereOneInput!, $data: UploadFilesTo${name}Input, $files: [Upload!]!, $options: FilesOf${name}OptionsInput!${reorderField[0]}) {`,
    `  uploadFilesTo${name}(whereOne: $whereOne, data: $data, files: $files, options: $options${reorderField[1]}) {`,
  ];

  return result;
};

export default composeUploadFilesToThingMutationResolver;
