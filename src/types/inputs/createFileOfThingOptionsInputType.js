//  @flow

import type { ThingConfig } from '../../flowTypes';

const createFileOfThingOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FileGeneralNamesEnum {
${fieldLines.join('\n')}
}
input FileOf${name}OptionsInput {
  target: ${name}FileGeneralNamesEnum!
}`;
};

export default createFileOfThingOptionsInputType;
