// @flow

import type { ThingConfig } from '../flowTypes';

const createThingType = (thingConfig: ThingConfig): string => {
  const {
    isEmbedded,
    duplexFields,
    embeddedFields,
    geospatialFields,
    relationalFields,
    textFields,
    name,
  } = thingConfig;

  const thingTypeArray = [
    `type ${name} {
  id: ID!`,
  ];

  if (!isEmbedded) {
    thingTypeArray.push(`  createdAt: DateTime!
  updatedAt: DateTime!`);
  }

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
    relationalFields.reduce(
      (prev, { array, name: name2, required, config: { name: relationalThingName } }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${relationalThingName}${array ? '!]!' : ''}${
            !array && required ? '!' : ''
          }`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce(
      (prev, { array, name: name2, required, config: { name: relationalThingName } }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${relationalThingName}${array ? '!]!' : ''}${
            !array && required ? '!' : ''
          }`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  if (embeddedFields) {
    embeddedFields.reduce(
      (prev, { array, name: name2, required, config: { name: embeddedName } }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${embeddedName}${array ? '!]!' : ''}${
            !array && required ? '!' : ''
          }`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name: name2, type, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${type}${array ? '!]!' : ''}${
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
