//  @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadFileToThingOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FileFieldNamesEnum {
${fieldLines.join('\n')}
}
input UploadFileTo${name}OptionsInput {
  targets: [${name}FileFieldNamesEnum!]!
}`;
};

export default createUploadFileToThingOptionsInputType;
