import type { InputCreator, TangibleEntityConfig } from '@/tsTypes';

const createEntityDistinctValuesOptionsInputType: InputCreator = (entityConfig) => {
  const {
    name,
    enumFields = [],
    textFields = [],
    relationalFields = [],
    duplexFields = [],
  } = entityConfig as TangibleEntityConfig;

  const inputName = `${name}DistinctValuesOptionsInput`;

  const fieldLines = [...enumFields, ...textFields].map(({ name: fieldName }) => `  ${fieldName}`);

  const inputDefinition =
    fieldLines.length > 0
      ? `enum ${name}TextNamesEnum {
${fieldLines.join('\n')}
}
input ${name}DistinctValuesOptionsInput {
  target: ${name}TextNamesEnum!
}`
      : '';

  return [inputName, inputDefinition, {}];
};

export default createEntityDistinctValuesOptionsInputType;
