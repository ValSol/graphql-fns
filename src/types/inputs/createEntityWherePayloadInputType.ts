import type { InputCreator, EntityConfig, TangibleEntityConfig } from '../../tsTypes';

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
  const preFields = [
    'booleanFields',
    'dateTimeFields',
    'embeddedFields',
    'enumFields',
    'intFields',
    'geospatialFields',
    'filterFields',
    'floatFields',
    'textFields',
  ].reduce(
    (prev, key) => {
      prev[key] = entityConfig[key] ? [...entityConfig[key]] : [];

      return prev;
    },
    {} as Record<string, any>,
  );

  const { type: entityType } = entityConfig;

  const { calculatedFields = [], subscriptionCalculatedFieldNames = [] } =
    entityConfig as TangibleEntityConfig;

  calculatedFields.forEach((field) => {
    const { name, calculatedType } = field;

    if (subscriptionCalculatedFieldNames.includes(name)) {
      preFields[calculatedType].push(field);
    }
  });

  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    intFields = [],
    geospatialFields = [],
    filterFields = [],
    floatFields = [],
    textFields = [],
  } = preFields;

  const fields =
    entityType === 'tangible'
      ? [`${defaultFields}${entityConfig.counter ? counterFields : ''}`]
      : [embeddedEntityDefaultFields];

  textFields.forEach(({ name: fieldName, array }) => {
    fields.push(`  ${fieldName}: String
  ${fieldName}_in: [String!]
  ${fieldName}_nin: [String!]
  ${fieldName}_ne: String
  ${fieldName}_gt: String
  ${fieldName}_gte: String
  ${fieldName}_lt: String
  ${fieldName}_lte: String
  ${fieldName}_re: [RegExp!]`);
    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  intFields.forEach(({ name: fieldName, array }) => {
    fields.push(`  ${fieldName}: Int
  ${fieldName}_in: [Int!]
  ${fieldName}_nin: [Int!]
  ${fieldName}_ne: Int
  ${fieldName}_gt: Int
  ${fieldName}_gte: Int
  ${fieldName}_lt: Int
  ${fieldName}_lte: Int`);

    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  floatFields.forEach(({ name: fieldName, array }) => {
    fields.push(`  ${fieldName}: Float
  ${fieldName}_in: [Float!]
  ${fieldName}_nin: [Float!]
  ${fieldName}_ne: Float
  ${fieldName}_gt: Float
  ${fieldName}_gte: Float
  ${fieldName}_lt: Float
  ${fieldName}_lte: Float`);

    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  dateTimeFields.forEach(({ name: fieldName, array }) => {
    fields.push(`  ${fieldName}: DateTime
  ${fieldName}_in: [DateTime!]
  ${fieldName}_nin: [DateTime!]
  ${fieldName}_ne: DateTime
  ${fieldName}_gt: DateTime
  ${fieldName}_gte: DateTime
  ${fieldName}_lt: DateTime
  ${fieldName}_lte: DateTime`);

    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  booleanFields.forEach(({ name: fieldName, array }) => {
    fields.push(`  ${fieldName}: Boolean
  ${fieldName}_ne: Boolean`);

    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
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

  enumFields.forEach(({ name: fieldName, enumName, array }) => {
    fields.push(`  ${fieldName}: ${enumName}Enumeration
  ${fieldName}_in: [${enumName}Enumeration!]
  ${fieldName}_nin: [${enumName}Enumeration!]
  ${fieldName}_ne: ${enumName}Enumeration
  ${fieldName}_re: [RegExp!]`);

    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    relationalFields.forEach(({ name: fieldName, array, parent, config }) => {
      if (!parent) {
        fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID`);

        if (!array) {
          fields.push(`  ${fieldName}_exists: Boolean`);
        }

        if (array) {
          fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
        }
      }
    });

    duplexFields.forEach(({ name: fieldName, array, config }) => {
      fields.push(`  ${fieldName}: ID
  ${fieldName}_in: [ID!]
  ${fieldName}_nin: [ID!]
  ${fieldName}_ne: ID`);

      if (!array) {
        fields.push(`  ${fieldName}_exists: Boolean`);
      }

      if (array) {
        fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
      }
    });
  }

  embeddedFields.forEach(({ name: fieldName, array, config }) => {
    fields.push(`  ${fieldName}: ${config.name}WherePayloadInput`);

    childChain[`${config.name}WherePayloadInput`] = config;

    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  filterFields.forEach(({ name: fieldName, array }) => {
    fields.push(`  ${fieldName}: String
  ${fieldName}_in: [String!]
  ${fieldName}_nin: [String!]
  ${fieldName}_ne: String
  ${fieldName}_gt: String
  ${fieldName}_gte: String
  ${fieldName}_lt: String
  ${fieldName}_lte: String
  ${fieldName}_re: [RegExp!]`);
    if (!array) {
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
    if (array) {
      fields.push(`  ${fieldName}_size: Int
  ${fieldName}_notsize: Int`);
    }
  });

  return fields.join('\n'); // embeddedFields
};

const createEntityWherePayloadInputType: InputCreator = (entityConfig) => {
  const { name, type: entityType } = entityConfig;

  const inputName = `${name}WherePayloadInput`;
  const preChildChain: Record<string, any> = {};

  const fields = composeInputFields(entityConfig, preChildChain);

  const result =
    entityType === 'tangible'
      ? [
          `input ${name}WherePayloadInput {`,
          fields,
          `  AND: [${name}WherePayloadInput!]
  NOR: [${name}WherePayloadInput!]
  OR: [${name}WherePayloadInput!]
}`,
        ]
      : [`input ${name}WherePayloadInput {`, fields, '}'];

  const inputDefinition = result.join('\n');

  const childChain = Object.keys(preChildChain).reduce<Record<string, any>>((prev, inputName2) => {
    prev[inputName2] = [createEntityWherePayloadInputType, preChildChain[inputName2]];
    return prev;
  }, {});

  return [inputName, inputDefinition, childChain];
};

export default createEntityWherePayloadInputType;
