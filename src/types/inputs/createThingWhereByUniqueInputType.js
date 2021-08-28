// @flow

import type { InputCreator } from '../../flowTypes';

const defaultFields = '  id_in: [ID!]';

const createThingWhereByUniqueInputType: InputCreator = (thingConfig) => {
  const { name } = thingConfig;

  const inputName = `${name}WhereByUniqueInput`;

  const {
    dateTimeFields,
    duplexFields,
    intFields,
    floatFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const fields = [defaultFields];

  if (textFields) {
    textFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [String!]`);
      }
    });
  }

  if (intFields) {
    intFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [Int!]`);
      }
    });
  }

  if (floatFields) {
    floatFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [Float!]`);
      }
    });
  }

  if (dateTimeFields) {
    dateTimeFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [DateTime!]`);
      }
    });
  }

  if (relationalFields) {
    relationalFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [ID!]`);
      }
    });
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [ID!]`);
      }
    });
  }

  const inputDefinition = [`input ${name}WhereByUniqueInput {`, ...fields, '}'].join('\n');

  return [inputName, inputDefinition, {}];
};

export default createThingWhereByUniqueInputType;
