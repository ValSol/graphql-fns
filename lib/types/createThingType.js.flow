// @flow

import type { ThingConfig } from '../flowTypes';

const createThingType = (thingConfig: ThingConfig): string => {
  const { relationalFields, textFields, name } = thingConfig;

  const thingTypeArray = [
    `type ${name} {`,
    '  id: ID!',
    '  createdAt: DateTime!',
    '  updatedAt: DateTime!',
    '  deletedAt: DateTime',
  ];

  if (textFields) {
    textFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}String${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }
  if (relationalFields) {
    relationalFields.reduce((prev, { array, name: name2, required, thingName }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${thingName}${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

module.exports = createThingType;
