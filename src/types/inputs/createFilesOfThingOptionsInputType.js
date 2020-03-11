//  @flow
// COMEBACK

import type { ThingConfig } from '../../flowTypes';

const createFilesOfThingOptionsInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}FileNamesEnum {
${fieldLines.join('\n')}
}
input FilesOf${name}OptionsInput {
  targets: [${name}FileNamesEnum!]!
  counts: [Int!]!
  hashes: [String!]!
}`;
};

export default createFilesOfThingOptionsInputType;
