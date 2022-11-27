// @flow

import type { InputCreator } from '../../flowTypes';

const createEntityReorderUploadedInputType: InputCreator = (entityConfig) => {
  const { fileFields, name } = entityConfig;

  const inputName = `${name}ReorderUploadedInput`;

  const entityTypeArray = [];

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.reduce((prev, { array, freeze, name: name2 }) => {
      if (array && !freeze) {
        prev.push(`  ${name2}: [Int!]`);
      }
      return prev;
    }, entityTypeArray);
  }

  if (!entityTypeArray.length) return [inputName, '', {}];

  entityTypeArray.unshift(`input ${name}ReorderUploadedInput {`);
  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, {}];
};

export default createEntityReorderUploadedInputType;
