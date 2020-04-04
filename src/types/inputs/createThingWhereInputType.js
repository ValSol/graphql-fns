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

  const fields = ['  id: [ID!]'];

  if (textFields) {
    textFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}: [String!]`);
      } else if (index) {
        fields.push(`  ${fieldName}: String`);
      }
    });
  }

  if (intFields) {
    intFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}: [Int!]`);
      } else if (index) {
        fields.push(`  ${fieldName}: Int`);
      }
    });
  }

  if (floatFields) {
    floatFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}: [Float!]`);
      } else if (index) {
        fields.push(`  ${fieldName}: Float`);
      }
    });
  }

  if (dateTimeFields) {
    dateTimeFields.forEach(({ name: fieldName, index, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}: [DateTime!]`);
      } else if (index) {
        fields.push(`  ${fieldName}: DateTime`);
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
        fields.push(`  ${fieldName}: ${enumName}Enumeration`);
      }
    });
  }

  if (relationalFields) {
    relationalFields.forEach(({ name: fieldName, index }) => {
      if (index) {
        fields.push(`  ${fieldName}: ID`);
      }
    });
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.forEach(({ name: fieldName, index }) => {
      if (index) {
        fields.push(`  ${fieldName}: ID`);
      }
    });
  }

  const result = `input ${name}WhereInput {
${fields.join('\n')}
}`;
  return result;
};

export default createThingWhereInputType;
