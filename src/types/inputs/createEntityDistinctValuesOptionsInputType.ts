import type { InputCreator, TangibleEntityConfig } from '@/tsTypes';

const createEntityDistinctValuesOptionsInputType: InputCreator = (entityConfig) => {
  const { name, enumFields = [], textFields = [] } = entityConfig as TangibleEntityConfig;

  const inputName = `${name}DistinctValuesOptionsInput`;

  // only indexed fields (unique field is indexed too) to not execute "distinct" on the whole collection
  const fieldLines = [
    ...enumFields.filter(({ index }) => index),
    ...textFields.filter(({ index, unique }) => index || unique),
  ].map(({ name: fieldName }) => `  ${fieldName}`);

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
