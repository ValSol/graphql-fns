//  @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadFilesToThingOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields
    ? fileFields.filter(({ array }) => array).map(({ name: fieldName }) => `  ${fieldName}`)
    : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FilesFieldNamesEnum {
${fieldLines.join('\n')}
}
input UploadFilesTo${name}OptionsInput {
  targets: [${name}FilesFieldNamesEnum!]!
}`;
};

export default createUploadFilesToThingOptionsInputType;
