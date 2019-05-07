// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { name, enumFields, duplexFields, relationalFields, textFields } = thingConfig;

  const indexedFields = textFields
    ? textFields.filter(({ index }) => index).map(({ name: fieldName }) => `  ${fieldName}: String`)
    : [];

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
    ? `
input ${name}WhereInput {
${indexedFields.join('\n')}
}`
    : '';

  return result;
};

module.exports = createThingWhereInputType;
