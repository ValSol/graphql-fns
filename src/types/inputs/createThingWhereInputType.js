// @flow

import type { ThingConfig } from '../../flowTypes';

const composeScalarFields = (thingConfig: ThingConfig, parentFieldName?: string): string => {
  const {
    booleanFields,
    enumFields,
    dateTimeFields,
    intFields,
    floatFields,
    textFields,
  } = thingConfig;

  const prefix = parentFieldName ? `${parentFieldName}__` : '';

  const fields = [
    `  ${prefix}id_in: [ID!]
  ${prefix}id_nin: [ID!]
  ${prefix}createdAt_in: [DateTime!]
  ${prefix}createdAt_nin: [DateTime!]
  ${prefix}createdAt_ne: DateTime
  ${prefix}createdAt_gt: DateTime
  ${prefix}createdAt_gte: DateTime
  ${prefix}createdAt_lt: DateTime
  ${prefix}createdAt_lte: DateTime
  ${prefix}updatedAt_in: [DateTime!]
  ${prefix}updatedAt_nin: [DateTime!]
  ${prefix}updatedAt_ne: DateTime
  ${prefix}updatedAt_gt: DateTime
  ${prefix}updatedAt_gte: DateTime
  ${prefix}updatedAt_lt: DateTime
  ${prefix}updatedAt_lte: DateTime`,
  ];

  if (textFields) {
    textFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${prefix}${fieldName}: String`);
        fields.push(`  ${prefix}${fieldName}_in: [String!]
  ${prefix}${fieldName}_nin: [String!]
  ${prefix}${fieldName}_ne: String
  ${prefix}${fieldName}_re: [RegExp!]`);
      }
    });
  }

  if (intFields) {
    intFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${prefix}${fieldName}: Int`);
        fields.push(`  ${prefix}${fieldName}_in: [Int!]
  ${prefix}${fieldName}_nin: [Int!]
  ${prefix}${fieldName}_ne: Int
  ${prefix}${fieldName}_gt: Int
  ${prefix}${fieldName}_gte: Int
  ${prefix}${fieldName}_lt: Int
  ${prefix}${fieldName}_lte: Int`);
      }
    });
  }

  if (floatFields) {
    floatFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${prefix}${fieldName}: Float`);
        fields.push(`  ${prefix}${fieldName}_in: [Float!]
  ${prefix}${fieldName}_nin: [Float!]
  ${prefix}${fieldName}_ne: Float
  ${prefix}${fieldName}_gt: Float
  ${prefix}${fieldName}_gte: Float
  ${prefix}${fieldName}_lt: Float
  ${prefix}${fieldName}_lte: Float`);
      }
    });
  }

  if (dateTimeFields) {
    dateTimeFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${prefix}${fieldName}: DateTime`);
        fields.push(`  ${prefix}${fieldName}_in: [DateTime!]
  ${prefix}${fieldName}_nin: [DateTime!]
  ${prefix}${fieldName}_ne: DateTime
  ${prefix}${fieldName}_gt: DateTime
  ${prefix}${fieldName}_gte: DateTime
  ${prefix}${fieldName}_lt: DateTime
  ${prefix}${fieldName}_lte: DateTime`);
      }
    });
  }

  if (booleanFields) {
    booleanFields.forEach(({ name: fieldName, index }) => {
      if (index) {
        fields.push(`  ${prefix}${fieldName}: Boolean`);
      }
    });
  }

  if (enumFields) {
    enumFields.forEach(({ name: fieldName, enumName, index }) => {
      if (index) {
        fields.push(`  ${prefix}${fieldName}: ${enumName}Enumeration
  ${prefix}${fieldName}_in: [${enumName}Enumeration!]
  ${prefix}${fieldName}_nin: [${enumName}Enumeration!]
  ${prefix}${fieldName}_ne: ${enumName}Enumeration
  ${prefix}${fieldName}_re: [RegExp!]`);
      }
    });
  }

  return fields.join('\n');
};

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { name, duplexFields, relationalFields } = thingConfig;

  const fields = [composeScalarFields(thingConfig)];

  if (relationalFields) {
    relationalFields.forEach(({ name: fieldName, index, unique, config }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID
${composeScalarFields(config, fieldName)}`);
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
${composeScalarFields(config, fieldName)}`);
      }
    });
  }

  fields.push(`  AND: [${name}WhereInput!]
  NOR: [${name}WhereInput!]
  OR: [${name}WhereInput!]`);

  const result = `input ${name}WhereInput {
${fields.join('\n')}
}`;
  return result;
};

export default createThingWhereInputType;
