// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingCreateInputType = (thingConfig: ThingConfig): string => {
  const { relationalFields, textFields, thingName } = thingConfig;

  const thingTypeArray = [`input ${thingName}CreateInput {`];

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
        `  ${name}: ${array ? '[' : ''}${referencedThingName}Create2Input${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push(`}
input ${thingName}Create2Input {
  connect: ID
  create: ${thingName}CreateInput
}`);

  const result = thingTypeArray.join('\n');

  return result;
};

module.exports = createThingCreateInputType;
