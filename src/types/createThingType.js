// @flow

import type { ThingConfig } from '../flowTypes';

import composeChildActionSignature from './composeChildActionSignature';

const createThingType = (
  thingConfig: ThingConfig,
  dic: { [inputName: string]: string },
): string => {
  const {
    embedded,
    counter,
    file,
    booleanFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields,
    textFields,
    name,
  } = thingConfig;

  const thingTypeArray = [
    // use not required ID in embedded things...
    // ... to not provoke error for null embedded objects
    `type ${name} {
  id: ID!`,
  ];

  if (!(embedded || file)) {
    thingTypeArray.push(`  createdAt: DateTime!
  updatedAt: DateTime!`);
  }

  if (counter) {
    thingTypeArray.push('  counter: Int!');
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

  if (intFields) {
    intFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Int${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (floatFields) {
    floatFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Float${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (enumFields) {
    enumFields.reduce((prev, { array, enumName, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { array, name: name2, required, config }) => {
      const { name: relationalThingName } = config;
      prev.push(
        `  ${name2}${array ? `(${composeChildActionSignature(config, dic)})` : ''}: ${
          array ? '[' : ''
        }${relationalThingName}${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce((prev, { array, name: name2, required, config }) => {
      const { name: relationalThingName } = config;
      prev.push(
        `  ${name2}${array ? `(${composeChildActionSignature(config, dic)})` : ''}: ${
          array ? '[' : ''
        }${relationalThingName}${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, thingTypeArray);
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

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.reduce((prev, { array, name: name2, required, config: { name: embeddedName } }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${embeddedName}${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name: name2, geospatialType, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}${array ? '!]!' : ''}${
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

export default createThingType;
