// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingUpdateInputType = (thingConfig: ThingConfig): string => {
  const {
    embedded,
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

  const thingTypeArray = [`input ${name}UpdateInput {`];

  if (textFields) {
    textFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (intFields) {
    intFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (floatFields) {
    floatFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (enumFields) {
    enumFields.reduce((prev, { array, enumName, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields.reduce(
      (prev, { array, name: name2, config: { name: relationalThingName } }) => {
        prev.push(
          `  ${name2}: ${relationalThingName}${array ? 'UpdateChildrenInput' : 'UpdateChildInput'}`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce((prev, { array, name: name2, config: { name: relationalThingName } }) => {
      prev.push(
        `  ${name2}: ${relationalThingName}${array ? 'UpdateChildrenInput' : 'UpdateChildInput'}`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { array, name: name2, config: { name: embeddedName } }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.reduce((prev, { array, name: name2, config: { name: embeddedName } }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name: name2, geospatialType }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push('}');

  if (!embedded) {
    thingTypeArray.push(`input ${name}UpdateChildInput {
  connect: ID
}
input ${name}UpdateChildrenInput {
  connect: [ID!]
}`);
  }

  const result = thingTypeArray.join('\n');

  return result;
};

export default createThingUpdateInputType;
