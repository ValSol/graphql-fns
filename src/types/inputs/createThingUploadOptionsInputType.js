//  @flow

import type { ThingConfig } from '../../flowTypes';

const createThingUploadOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FileFieldNamesEnum {
${fieldLines.join('\n')}
}
input ${name}UploadOptionsInput {
  target: ${name}FileFieldNamesEnum!
}`;
};

export default createThingUploadOptionsInputType;
