import type { InputCreator, TangibleEntityConfig } from '../../tsTypes';

const createEntityWhereCompoundOneInputType: InputCreator = (entityConfig) => {
  const { name, uniqueCompoundIndexes } = entityConfig as TangibleEntityConfig;

  const inputName = `${name}WhereCompoundOneInput`;

  if (!uniqueCompoundIndexes) {
    return [inputName, '', {}];
  }

  const compoundNameSet = (uniqueCompoundIndexes as string[][]).reduce((prev, arr) => {
    arr.forEach((fieldName) => {
      prev.add(fieldName);
    });

    return prev;
  }, new Set<string>());

  const { dateTimeFields = [], intFields = [], floatFields = [], textFields = [] } = entityConfig;

  const fields = [];

  textFields.forEach(({ name: fieldName }) => {
    if (compoundNameSet.has(fieldName)) {
      fields.push(`  ${fieldName}: String`);
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
  });

  intFields.forEach(({ name: fieldName }) => {
    if (compoundNameSet.has(fieldName)) {
      fields.push(`  ${fieldName}: Int`);
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
  });

  floatFields.forEach(({ name: fieldName }) => {
    if (compoundNameSet.has(fieldName)) {
      fields.push(`  ${fieldName}: Float`);
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
  });

  dateTimeFields.forEach(({ name: fieldName }) => {
    if (compoundNameSet.has(fieldName)) {
      fields.push(`  ${fieldName}: DateTime`);
      fields.push(`  ${fieldName}_exists: Boolean`);
    }
  });

  if (entityConfig.type === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    relationalFields.forEach(({ name: fieldName, parent }) => {
      if (!parent && compoundNameSet.has(fieldName)) {
        fields.push(`  ${fieldName}: ID`);
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
    });

    duplexFields.forEach(({ name: fieldName }) => {
      if (compoundNameSet.has(fieldName)) {
        fields.push(`  ${fieldName}: ID`);
        fields.push(`  ${fieldName}_exists: Boolean`);
      }
    });
  }

  const inputDefinition = [`input ${inputName} {`, ...fields, '}'].join('\n');

  return [inputName, inputDefinition, {}];
};

export default createEntityWhereCompoundOneInputType;
