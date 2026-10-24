import type { InputCreator } from '../../tsTypes';

import getSortableFieldNames from '../../utils/getSortableFieldNames';

const createEntitySortInputType: InputCreator = (entityConfig) => {
  const { name, textFields = [] } = entityConfig;

  const inputName = `${name}SortInput`;

  const fieldLines = [
    '  id_ASC',
    '  id_DESC',
    '  createdAt_ASC',
    '  createdAt_DESC',
    '  updatedAt_ASC',
    '  updatedAt_DESC',
  ];

  getSortableFieldNames(entityConfig).forEach((fieldName) => {
    fieldLines.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
  });

  // the text score of "search" (an entity has "search" if a text field has "weight"), from the most
  // relevant; ignored without "search"
  if (textFields.some(({ weight }) => weight)) {
    fieldLines.push('  relevance_DESC');
  }

  const inputDefinition = `enum ${name}SortEnum {
${fieldLines.join('\n')}
}
input ${name}SortInput {
  sortBy: [${name}SortEnum]
}`;

  return [inputName, inputDefinition, {}];
};

export default createEntitySortInputType;
