// @flow

import type { InputCreator } from '../../flowTypes';

import createThingCreateInputType from './createThingCreateInputType';

const createPushIntoThingInputType: InputCreator = (thingConfig) => {
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
  } = thingConfig;

  const inputName = `PushInto${name}Input`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const thingTypeArray = [];
  const childChain = {};

  if (textFields) {
    textFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [String!]`);
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
        prev.push(`  ${name2}: [Float!]`);
        return prev;
      }, thingTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [DateTime!]`);
        return prev;
      }, thingTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Boolean!]`);
        return prev;
      }, thingTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { enumName, name: name2 }) => {
        prev.push(`  ${name2}: [${enumName}Enumeration!]`);
        return prev;
      }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: relationalThingName } }) => {
        prev.push(`  ${name2}: ${relationalThingName}CreateOrPushChildrenInput`);

        childChain[`${relationalThingName}CreateInput`] = [createThingCreateInputType, config2];

        return prev;
      }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: relationalThingName } }) => {
        prev.push(`  ${name2}: ${relationalThingName}CreateOrPushChildrenInput`);

        childChain[`${relationalThingName}CreateInput`] = [createThingCreateInputType, config2];

        return prev;
      }, thingTypeArray);
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);

        childChain[`${embeddedName}CreateInput`] = [createThingCreateInputType, config2];

        return prev;
      }, thingTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);

        childChain[`${embeddedName}CreateInput`] = [createThingCreateInputType, config2];

        return prev;
      }, thingTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, geospatialType }) => {
        prev.push(`  ${name2}: [Geospatial${geospatialType}Input!]`);
        return prev;
      }, thingTypeArray);
  }

  if (!thingTypeArray.length) return [inputName, '', {}];

  thingTypeArray.unshift(`input PushInto${name}Input {`);
  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createPushIntoThingInputType;
