// @flow

import type { ThingConfig } from '../flowTypes';

const createThingType = (thingConfig: ThingConfig): string => {
  const { relationalFields, textFields, thingName } = thingConfig;

  const thingTypeArray = [
    `type ${thingName} {`,
    '  id: ID!',
    '  createdAt: DateTime!',
    '  updatedAt: DateTime!',
    '  deletedAt: DateTime',
  ];

  if (textFields) {
    textFields.reduce((prev, { array, name, required }) => {
      prev.push(
        `  ${name}: ${array ? '[' : ''}String${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, thingTypeArray);
  }
  if (relationalFields) {
    relationalFields.reduce((prev, { array, name, required, thingName: referencedThingName }) => {
      prev.push(
        `  ${name}: ${array ? '[' : ''}${referencedThingName}${array ? '!]!' : ''}${
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
