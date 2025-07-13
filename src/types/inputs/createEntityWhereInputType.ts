import type { InputCreator, EntityConfig } from '../../tsTypes';

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

const embeddedEntityDefaultFields = `  id_in: [ID!]
  id_nin: [ID!]
  _index: Int`; // "_index" only used for search in "array" field to select "_index" index of array!

const counterFields = `
  counter_in: [Int!]
  counter_nin: [Int!]
  counter_ne: Int
  counter_gt: Int
  counter_gte: Int
  counter_lt: Int
  counter_lte: Int`;

const composeInputFields = (
  entityConfig: EntityConfig,
  childChain: {
    [inputSpecificName: string]: EntityConfig;
  },
): string => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    intFields = [],
    geospatialFields = [],
    floatFields = [],
    textFields = [],
    type: entityType,
  } = entityConfig;

  const fields =
    entityType === 'tangible'
      ? [`${defaultFields}${entityConfig.counter ? counterFields : ''}`]
      : [embeddedEntityDefaultFields];

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

  geospatialFields.forEach(({ geospatialType, name: fieldName }) => {
    if (geospatialType === 'Point') {
      fields.push(`  ${fieldName}_withinPolygon: [GeospatialPointInput!]
  ${fieldName}_withinSphere: GeospatialSphereInput`);
    } else {
      fields.push(`  ${fieldName}_intersectsPoint: GeospatialPointInput`);
    }
  });

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

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    relationalFields.forEach(({ name: fieldName, array, index, parent, unique, config }) => {
      if (parent) {
        const oppositeField = config.relationalFields.find(
          ({ oppositeName }) => oppositeName === fieldName,
        );

        try {
          if (oppositeField.index) {
            fields.push(`  ${fieldName}_: ${config.name}WhereWithoutBooleanOperationsInput`);
          }
        } catch (err) {
          throw new TypeError(err);
        }
        return;
      }
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

      childChain[`${config.name}WhereInput`] = config;
    });

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

      childChain[`${config.name}WhereInput`] = config;
    });
  }

  embeddedFields.forEach(({ name: fieldName, array, config, index }) => {
    if (index) {
      fields.push(`  ${fieldName}: ${config.name}WhereInput`);

      childChain[`${config.name}WhereInput`] = config;
    }
    if (index && !array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (index && array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  return fields.join('\n'); // embeddedFields
};

const createEntityWhereInputType: InputCreator = (entityConfig) => {
  const { name, type: entityType } = entityConfig;

  const inputName = `${name}WhereInput`;
  const preChildChain: Record<string, any> = {};

  const fields = composeInputFields(entityConfig, preChildChain);

  const result =
    entityType === 'tangible'
      ? [
          `input ${name}WhereInput {`,
          fields,
          `  AND: [${name}WhereInput!]
  NOR: [${name}WhereInput!]
  OR: [${name}WhereInput!]
}`,
          `input ${name}WhereWithoutBooleanOperationsInput {`,
          fields,
          '}',
        ]
      : [`input ${name}WhereInput {`, fields, '}'];

  const inputDefinition = result.join('\n');

  const childChain = Object.keys(preChildChain).reduce<Record<string, any>>((prev, inputName2) => {
    prev[inputName2] = [createEntityWhereInputType, preChildChain[inputName2]];
    return prev;
  }, {});

  return [inputName, inputDefinition, childChain];
};

export default createEntityWhereInputType;
