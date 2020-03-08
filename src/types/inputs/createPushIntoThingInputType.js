// @flow

import type { ThingConfig } from '../../flowTypes';

const createPushIntoThingInputType = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embedded,
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

  if (embedded) return '';

  const thingTypeArray = [];

  if (textFields) {
    textFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [String!]`);
        return prev;
      }, thingTypeArray);
  }

  if (intFields) {
    intFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (floatFields) {
    floatFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Float!]`);
        return prev;
      }, thingTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [DateTime!]`);
        return prev;
      }, thingTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Boolean!]`);
        return prev;
      }, thingTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ array }) => array)
      .reduce((prev, { enumName, name: name2 }) => {
        prev.push(`  ${name2}: [${enumName}Enumeration!]`);
        return prev;
      }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2, config: { name: relationalThingName } }) => {
        prev.push(`  ${name2}: ${relationalThingName}CreateOrPushChildrenInput`);
        return prev;
      }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2, config: { name: relationalThingName } }) => {
        prev.push(`  ${name2}: ${relationalThingName}CreateOrPushChildrenInput`);
        return prev;
      }, thingTypeArray);
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);
        return prev;
      }, thingTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);
        return prev;
      }, thingTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ array }) => array)
      .reduce((prev, { name: name2, geospatialType }) => {
        prev.push(`  ${name2}: [Geospatial${geospatialType}Input!]`);
        return prev;
      }, thingTypeArray);
  }

  if (!thingTypeArray.length) return '';

  thingTypeArray.unshift(`input PushInto${name}Input {`);
  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

export default createPushIntoThingInputType;
