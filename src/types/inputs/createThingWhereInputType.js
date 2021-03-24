// @flow

import type { ThingConfig } from '../../flowTypes';

const defaultFields = `  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime`;

const counterFields = `
  counter_in: [Int!]
  counter_nin: [Int!]
  counter_ne: Int
  counter_gt: Int
  counter_gte: Int
  counter_lt: Int
  counter_lte: Int`;

const composeFields = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    enumFields,
    dateTimeFields,
    duplexFields,
    intFields,
    floatFields,
    relationalFields,
    textFields,
    counter,
  } = thingConfig;

  const fields = [`${defaultFields}${counter ? counterFields : ''}`];

  if (textFields) {
    textFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${fieldName}: String`);
        fields.push(`  ${fieldName}_in: [String!]
  ${fieldName}_nin: [String!]
  ${fieldName}_ne: String
  ${fieldName}_re: [RegExp!]`);
      }
    });
  }

  if (intFields) {
    intFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${fieldName}: Int`);
        fields.push(`  ${fieldName}_in: [Int!]
  ${fieldName}_nin: [Int!]
  ${fieldName}_ne: Int
  ${fieldName}_gt: Int
  ${fieldName}_gte: Int
  ${fieldName}_lt: Int
  ${fieldName}_lte: Int`);
      }
    });
  }

  if (floatFields) {
    floatFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${fieldName}: Float`);
        fields.push(`  ${fieldName}_in: [Float!]
  ${fieldName}_nin: [Float!]
  ${fieldName}_ne: Float
  ${fieldName}_gt: Float
  ${fieldName}_gte: Float
  ${fieldName}_lt: Float
  ${fieldName}_lte: Float`);
      }
    });
  }

  if (dateTimeFields) {
    dateTimeFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${fieldName}: DateTime`);
        fields.push(`  ${fieldName}_in: [DateTime!]
  ${fieldName}_nin: [DateTime!]
  ${fieldName}_ne: DateTime
  ${fieldName}_gt: DateTime
  ${fieldName}_gte: DateTime
  ${fieldName}_lt: DateTime
  ${fieldName}_lte: DateTime`);
      }
    });
  }

  if (booleanFields) {
    booleanFields.forEach(({ name: fieldName, index }) => {
      if (index) {
        fields.push(`  ${fieldName}: Boolean`);
      }
    });
  }

  if (enumFields) {
    enumFields.forEach(({ name: fieldName, enumName, index }) => {
      if (index) {
        fields.push(`  ${fieldName}: ${enumName}Enumeration
  ${fieldName}_in: [${enumName}Enumeration!]
  ${fieldName}_nin: [${enumName}Enumeration!]
  ${fieldName}_ne: ${enumName}Enumeration
  ${fieldName}_re: [RegExp!]`);
      }
    });
  }

  if (relationalFields) {
    relationalFields.forEach(({ name: fieldName, index, unique, config }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID
  ${fieldName}_: ${config.name}WhereWithoutBooleanOperationsInput`);
      }
    });
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.forEach(({ name: fieldName, config, index, unique }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID
  ${fieldName}_: ${config.name}WhereWithoutBooleanOperationsInput`);
      }
    });
  }

  return fields.join('\n');
};

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const fields = [composeFields(thingConfig)];

  const result = [
    `input ${name}WhereWithoutBooleanOperationsInput {`,
    ...fields,
    '}',
    `input ${name}WhereInput {`,
    ...fields,
    `  AND: [${name}WhereInput!]
  NOR: [${name}WhereInput!]
  OR: [${name}WhereInput!]
}`,
  ].join('\n');

  return result;
};

export default createThingWhereInputType;
