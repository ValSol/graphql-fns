// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingReorderCreatedInputType = (thingConfig: ThingConfig): string => {
  const { duplexFields, relationalFields, name } = thingConfig;

  // const thingTypeArray = [`input ${name}UpdateInput {`];
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

  if (!thingTypeArray.length) return '';

  thingTypeArray.unshift(`input ${name}ReorderCreatedInput {`);
  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

export default createThingReorderCreatedInputType;
