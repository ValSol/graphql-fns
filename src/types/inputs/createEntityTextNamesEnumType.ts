import type { InputCreator, TangibleEntityConfig } from '@/tsTypes';

// targets of "XDistinctValues" and "XManyDistinctValues"
const createEntityTextNamesEnumType: InputCreator = (entityConfig) => {
  const { name, enumFields = [], textFields = [] } = entityConfig as TangibleEntityConfig;

  const inputName = `${name}TextNamesEnum`;

  // only indexed fields (unique field is indexed too) to not execute "distinct" on the whole collection
  const fieldLines = [
    ...enumFields.filter(({ index }) => index),
    ...textFields.filter(({ index, unique }) => index || unique),
  ].map(({ name: fieldName }) => `  ${fieldName}`);

  const inputDefinition =
    fieldLines.length > 0
      ? `enum ${inputName} {
${fieldLines.join('\n')}
}`
      : '';

  return [inputName, inputDefinition, {}];
};

export default createEntityTextNamesEnumType;
