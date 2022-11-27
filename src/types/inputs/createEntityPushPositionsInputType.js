// @flow

import type { InputCreator } from '../../flowTypes';

const createEntityPushPositionsInputType: InputCreator = (entityConfig) => {
  const {
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
    type: configType,
    name,
  } = entityConfig;

  const inputName = `${name}PushPositionsInput`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const entityTypeArray = [];

  if (textFields) {
    textFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (intFields) {
    intFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (floatFields) {
    floatFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, entityTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, entityTypeArray);
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, entityTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);

        return prev;
      }, entityTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Int!]`);
        return prev;
      }, entityTypeArray);
  }

  if (!entityTypeArray.length) return [inputName, '', {}];

  entityTypeArray.unshift(`input ${name}PushPositionsInput {`);
  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, {}];
};

export default createEntityPushPositionsInputType;
