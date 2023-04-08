import type { InputCreator } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';

const createPushIntoEntityInputType: InputCreator = (entityConfig) => {
  const {
    booleanFields,
    dateTimeFields,
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    textFields,
    type: configType,
    name,
  } = entityConfig;

  const inputName = `PushInto${name}Input`;

  if (configType !== 'tangible') return [inputName, '', {}];
  const { duplexFields, relationalFields } = entityConfig;

  const entityTypeArray: Array<string> = [];
  const childChain: Record<string, any> = {};

  if (textFields) {
    textFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [String!]`);
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
        prev.push(`  ${name2}: [Float!]`);
        return prev;
      }, entityTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [DateTime!]`);
        return prev;
      }, entityTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}: [Boolean!]`);
        return prev;
      }, entityTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { enumName, name: name2 }) => {
        prev.push(`  ${name2}: [${enumName}Enumeration!]`);
        return prev;
      }, entityTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: relationalEntityName } }) => {
        prev.push(`  ${name2}: ${relationalEntityName}CreateOrPushChildrenInput`);

        childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config2];

        return prev;
      }, entityTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: relationalEntityName } }) => {
        prev.push(`  ${name2}: ${relationalEntityName}CreateOrPushChildrenInput`);

        childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config2];

        return prev;
      }, entityTypeArray);
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);

        childChain[`${embeddedName}CreateInput`] = [createEntityCreateInputType, config2];

        return prev;
      }, entityTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, config: config2, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);

        childChain[`${embeddedName}CreateInput`] = [createEntityCreateInputType, config2];

        return prev;
      }, entityTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ array, freeze }) => array && !freeze)
      .reduce((prev, { name: name2, geospatialType }) => {
        prev.push(`  ${name2}: [Geospatial${geospatialType}Input!]`);
        return prev;
      }, entityTypeArray);
  }

  if (!entityTypeArray.length) return [inputName, '', {}];

  entityTypeArray.unshift(`input PushInto${name}Input {`);
  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createPushIntoEntityInputType;
