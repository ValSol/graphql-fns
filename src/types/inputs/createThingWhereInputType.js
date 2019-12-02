// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const {
    name,
    booleanFields,
    enumFields,
    dateTimeFields,
    duplexFields,
    intFields,
    fileFields,
    floatFields,
    textFields,
    relationalFields,
  } = thingConfig;

  const indexedFields = [];

  if (textFields) {
    textFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: String`);
        return prev;
      }, indexedFields);
  }

  if (fileFields) {
    fileFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: String`);
        return prev;
      }, indexedFields);
  }

  if (intFields) {
    intFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: Int`);
        return prev;
      }, indexedFields);
  }

  if (floatFields) {
    floatFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: Float`);
        return prev;
      }, indexedFields);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: DateTime`);
        return prev;
      }, indexedFields);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: Boolean`);
        return prev;
      }, indexedFields);
  }

  if (enumFields) {
    enumFields
      .filter(({ index }) => index)
      .reduce((prev, { enumName, name: fieldName }) => {
        prev.push(`  ${fieldName}: ${enumName}Enumeration`);
        return prev;
      }, indexedFields);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: ID`);
        return prev;
      }, indexedFields);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ index }) => index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}: ID`);
        return prev;
      }, indexedFields);
  }

  const result = indexedFields.length
    ? `input ${name}WhereInput {
${indexedFields.join('\n')}
}`
    : '';

  return result;
};

export default createThingWhereInputType;
