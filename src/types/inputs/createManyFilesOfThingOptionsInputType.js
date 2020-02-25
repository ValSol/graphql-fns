//  @flow

import type { ThingConfig } from '../../flowTypes';

const createManyFilesOfThingOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields
    ? fileFields.filter(({ array }) => array).map(({ name: fieldName }) => `  ${fieldName}`)
    : [];

  if (!fieldLines.length) return '';

  return `enum ${name}ManyFilesNamesEnum {
${fieldLines.join('\n')}
}
input ManyFilesOf${name}OptionsInput {
  target: ${name}ManyFilesNamesEnum!
}`;
};

export default createManyFilesOfThingOptionsInputType;
