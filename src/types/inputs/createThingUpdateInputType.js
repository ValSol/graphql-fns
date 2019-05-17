// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingUpdateInputType = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    duplexFields,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
    name,
  } = thingConfig;

  const thingTypeArray = [`input ${name}UpdateInput {`];

  const scalarFieldTypes = [
    { fieldTypeName: 'textFields', gqlType: 'String' },
    { fieldTypeName: 'intFields', gqlType: 'Int' },
    { fieldTypeName: 'floatFields', gqlType: 'Float' },
    { fieldTypeName: 'dateTimeFields', gqlType: 'DateTime' },
  ];
  scalarFieldTypes.reduce((prev, { fieldTypeName, gqlType }) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName].forEach(({ array, name: name2 }) =>
        prev.push(`  ${name2}: ${array ? '[' : ''}${gqlType}${array ? '!]' : ''}`),
      );
    }
    return prev;
  }, thingTypeArray);

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
    relationalFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}ID${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}ID${array ? '!]' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { array, name: name2, config: { name: embeddedName } }) => {
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

  const result = thingTypeArray.join('\n');

  return result;
};

module.exports = createThingUpdateInputType;
