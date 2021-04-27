// @flow

import type { InputCreator } from '../../flowTypes';

const createThingReorderCreatedInputType: InputCreator = (thingConfig) => {
  const { duplexFields, relationalFields, name } = thingConfig;

  const inputName = `${name}ReorderCreatedInput`;

  const thingTypeArray = [];

  if (relationalFields) {
    relationalFields.reduce((prev, { array, name: name2 }) => {
      if (array) {
        prev.push(`  ${name2}: [Int!]`);
      }
      return prev;
    }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce((prev, { array, name: name2 }) => {
      if (array) {
        prev.push(`  ${name2}: [Int!]`);
      }
      return prev;
    }, thingTypeArray);
  }

  if (!thingTypeArray.length) return [inputName, '', {}];

  thingTypeArray.unshift(`input ${name}ReorderCreatedInput {`);
  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, {}];
};

export default createThingReorderCreatedInputType;
