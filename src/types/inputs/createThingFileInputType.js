//  @flow

import type { ThingConfig } from '../../flowTypes';

const createThingFileInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FileFieldNamesEnum {
${fieldLines.join('\n')}
}
input ${name}FileInput {
  file: Upload!
  target: ${name}FileFieldNamesEnum!
}`;
};

export default createThingFileInputType;
