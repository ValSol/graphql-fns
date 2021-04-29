//  @flow

import type { InputCreator } from '../../flowTypes';

const createFilesOfThingOptionsInputType: InputCreator = (thingConfig) => {
  const { fileFields, name } = thingConfig;

  const inputName = `FilesOf${name}OptionsInput`;

  const fieldLines = fileFields ? fileFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  const inputDefinition = fieldLines.length
    ? `enum ${name}FileNamesEnum {
${fieldLines.join('\n')}
}
input FilesOf${name}OptionsInput {
  targets: [${name}FileNamesEnum!]!
  counts: [Int!]!
  hashes: [String!]!
}`
    : '';

  return [inputName, inputDefinition, {}];
};

export default createFilesOfThingOptionsInputType;
