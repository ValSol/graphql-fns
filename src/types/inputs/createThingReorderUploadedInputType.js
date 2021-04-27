// @flow

import type { InputCreator } from '../../flowTypes';

const createThingReorderUploadedInputType: InputCreator = (thingConfig) => {
  const { fileFields, name } = thingConfig;

  const inputName = `${name}ReorderUploadedInput`;

  const thingTypeArray = [];

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.reduce((prev, { array, name: name2 }) => {
      if (array) {
        prev.push(`  ${name2}: [Int!]`);
      }
      return prev;
    }, thingTypeArray);
  }

  if (!thingTypeArray.length) return [inputName, '', {}];

  thingTypeArray.unshift(`input ${name}ReorderUploadedInput {`);
  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, {}];
};

export default createThingReorderUploadedInputType;
