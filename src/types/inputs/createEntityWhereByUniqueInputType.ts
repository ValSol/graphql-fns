import type { InputCreator } from '../../tsTypes';

const defaultFields = '  id_in: [ID!]';

const createEntityWhereByUniqueInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}WhereByUniqueInput`;

  const { dateTimeFields = [], intFields = [], floatFields = [], textFields = [] } = entityConfig;

  const fields = [defaultFields];

  textFields.forEach(({ name: fieldName, unique }) => {
    if (unique) {
      fields.push(`  ${fieldName}_in: [String!]`);
    }
  });

  intFields.forEach(({ name: fieldName, unique }) => {
    if (unique) {
      fields.push(`  ${fieldName}_in: [Int!]`);
    }
  });

  floatFields.forEach(({ name: fieldName, unique }) => {
    if (unique) {
      fields.push(`  ${fieldName}_in: [Float!]`);
    }
  });

  dateTimeFields.forEach(({ name: fieldName, unique }) => {
    if (unique) {
      fields.push(`  ${fieldName}_in: [DateTime!]`);
    }
  });

  if (entityConfig.type === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    relationalFields.forEach(({ name: fieldName, parent, unique }) => {
      if (!parent && unique) {
        fields.push(`  ${fieldName}_in: [ID!]`);
      }
    });

    duplexFields.forEach(({ name: fieldName, unique }) => {
      if (unique) {
        fields.push(`  ${fieldName}_in: [ID!]`);
      }
    });
  }

  const inputDefinition = [`input ${name}WhereByUniqueInput {`, ...fields, '}'].join('\n');

  return [inputName, inputDefinition, {}];
};

export default createEntityWhereByUniqueInputType;
