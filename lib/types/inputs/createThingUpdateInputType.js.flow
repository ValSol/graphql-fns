// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingUpdateInputType = (thingConfig: ThingConfig): string => {
  const { duplexFields, embeddedFields, relationalFields, textFields, name } = thingConfig;

  const thingTypeArray = [`input ${name}UpdateInput {`];

  if (textFields) {
    textFields.reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}`);
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

  thingTypeArray.push('}');

  const result = thingTypeArray.join('\n');

  return result;
};

module.exports = createThingUpdateInputType;
