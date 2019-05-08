// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { name, booleanFields, enumFields, duplexFields, relationalFields } = thingConfig;

  const scalarFieldTypes = [
    { fieldTypeName: 'textFields', gqlType: 'String' },
    { fieldTypeName: 'intFields', gqlType: 'Int' },
    { fieldTypeName: 'floatFields', gqlType: 'Float' },
    { fieldTypeName: 'dateTimeFields', gqlType: 'DateTime' },
  ];

  const indexedFields = scalarFieldTypes.reduce((prev, { fieldTypeName, gqlType }) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName]
        .filter(({ index }) => index)
        .forEach(({ name: name2 }) => prev.push(`  ${name2}: ${gqlType}`));
    }
    return prev;
  }, []);

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
    ? `
input ${name}WhereInput {
${indexedFields.join('\n')}
}`
    : '';

  return result;
};

module.exports = createThingWhereInputType;
