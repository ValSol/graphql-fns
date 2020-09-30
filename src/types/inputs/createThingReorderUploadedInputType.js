// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingReorderUploadedInputType = (thingConfig: ThingConfig): string => {
  const { fileFields, name } = thingConfig;

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

  if (!thingTypeArray.length) return '';

  thingTypeArray.unshift(`input ${name}ReorderUploadedInput {`);
  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

export default createThingReorderUploadedInputType;
