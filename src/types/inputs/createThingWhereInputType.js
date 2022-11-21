// @flow

import type { InputCreator, ThingConfig } from '../../flowTypes';

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

const composeInputFields = (
  thingConfig: ThingConfig,
  childChain: { [inputSpecificName: string]: ThingConfig },
): string => {
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
    textFields.forEach(({ name: fieldName, array, index, unique }) => {
      if (unique || index) {
        if (index) fields.push(`  ${fieldName}: String`);
        fields.push(`  ${fieldName}_in: [String!]
  ${fieldName}_nin: [String!]
  ${fieldName}_ne: String
  ${fieldName}_gt: String
  ${fieldName}_gte: String
  ${fieldName}_lt: String
  ${fieldName}_lte: String
  ${fieldName}_re: [RegExp!]`);
      }
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  if (intFields) {
    intFields.forEach(({ name: fieldName, array, index, unique }) => {
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
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  if (floatFields) {
    floatFields.forEach(({ name: fieldName, array, index, unique }) => {
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
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  if (dateTimeFields) {
    dateTimeFields.forEach(({ name: fieldName, array, index, unique }) => {
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
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  if (booleanFields) {
    booleanFields.forEach(({ name: fieldName, array, index }) => {
      if (index) {
        fields.push(`  ${fieldName}: Boolean
  ${fieldName}_ne: Boolean`);
      }
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  if (enumFields) {
    enumFields.forEach(({ name: fieldName, enumName, array, index }) => {
      if (index) {
        fields.push(`  ${fieldName}: ${enumName}Enumeration
  ${fieldName}_in: [${enumName}Enumeration!]
  ${fieldName}_nin: [${enumName}Enumeration!]
  ${fieldName}_ne: ${enumName}Enumeration
  ${fieldName}_re: [RegExp!]`);
      }
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  if (relationalFields) {
    relationalFields.forEach(({ name: fieldName, array, index, unique, config }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID
  ${fieldName}_: ${config.name}WhereWithoutBooleanOperationsInput`);
      }
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }

      childChain[`${config.name}WhereInput`] = config; // eslint-disable-line no-param-reassign
    });
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.forEach(({ name: fieldName, array, config, index, unique }) => {
      if (unique || index) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID
  ${fieldName}_: ${config.name}WhereWithoutBooleanOperationsInput`);
      }
      if (index && !array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
      if (index && array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }

      childChain[`${config.name}WhereInput`] = config; // eslint-disable-line no-param-reassign
    });
  }

  return fields.join('\n');
};

const createThingWhereInputType: InputCreator = (thingConfig) => {
  const { name } = thingConfig;

  const inputName = `${name}WhereInput`;
  const preChildChain = {};

  const fields = composeInputFields(thingConfig, preChildChain);

  const result = [
    `input ${name}WhereInput {`,
    fields,
    `  AND: [${name}WhereInput!]
  NOR: [${name}WhereInput!]
  OR: [${name}WhereInput!]
}`,
    `input ${name}WhereWithoutBooleanOperationsInput {`,
    fields,
    '}',
  ];

  const inputDefinition = result.join('\n');

  const childChain = Object.keys(preChildChain).reduce((prev, inputName2) => {
    prev[inputName2] = [createThingWhereInputType, preChildChain[inputName2]]; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  return [inputName, inputDefinition, childChain];
};

export default createThingWhereInputType;
