// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingCreateInputType = (thingConfig: ThingConfig): string => {
  const { relationalFields, textFields, name } = thingConfig;

  const thingTypeArray = [`input ${name}CreateInput {`];

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
        `  ${name2}: ${thingName}${array ? 'CreateChildrenInput' : 'CreateChildInput'}${
          required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push(`}
input ${name}CreateChildInput {
  connect: ID
  create: ${name}CreateInput
}
input ${name}CreateChildrenInput {
  connect: [ID!]
  create: [${name}CreateInput!]
}`);

  const result = thingTypeArray.join('\n');

  return result;
};

module.exports = createThingCreateInputType;
