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
    floatFields,
    textFields,
    relationalFields,
  } = thingConfig;

  const fields = [
    `  id_in: [ID!]
  id_nin: [ID!]`,
  ];

  if (textFields) {
    textFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${fieldName}: String`);
        fields.push(`  ${fieldName}_in: [String!]
  ${fieldName}_nin: [String!]
  ${fieldName}_ne: String`);
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
  ${fieldName}_ne: ${enumName}Enumeration`);
      }
    });
  }

  if (relationalFields) {
    relationalFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID`);
      }
    });
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID`);
      }
    });
  }

  if (fields.length > 1) {
    fields.push(`  AND: [${name}WhereInput!]
  NOR: [${name}WhereInput!]
  OR: [${name}WhereInput!]`);
  }

  const result = `input ${name}WhereInput {
${fields.join('\n')}
}`;
  return result;
};

export default createThingWhereInputType;
