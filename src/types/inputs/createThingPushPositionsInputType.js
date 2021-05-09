// @flow

import type { InputCreator } from '../../flowTypes';

const createThingPushPositionsInputType: InputCreator = (thingConfig) => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embedded,
    embeddedFields,
    enumFields,
    file,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields,
    textFields,
    name,
  } = thingConfig;

  const inputName = `${name}PushPositionsInput`;

  if (embedded || file) return [inputName, '', {}];

  const thingTypeArray = [];

  if (textFields) {
    textFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (intFields) {
    intFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (floatFields) {
    floatFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, thingTypeArray);
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, thingTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, thingTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, thingTypeArray);
  }

  if (!thingTypeArray.length) return [inputName, '', {}];

  thingTypeArray.unshift(`input ${name}PushPositionsInput {`);
  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, {}];
};

export default createThingPushPositionsInputType;
