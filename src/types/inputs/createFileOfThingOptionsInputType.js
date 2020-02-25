//  @flow
// COMEBACK

import type { ThingConfig } from '../../flowTypes';

const createFileOfThingOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FileNamesEnum {
${fieldLines.join('\n')}
}
input FileOf${name}OptionsInput {
  target: ${name}FileNamesEnum!
}`;
};

export default createFileOfThingOptionsInputType;
