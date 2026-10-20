import type { InputCreator } from '../../tsTypes';

import getSortableFieldNames from '../../utils/getSortableFieldNames';

const createEntitySortInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

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

  const inputDefinition = `enum ${name}SortEnum {
${fieldLines.join('\n')}
}
input ${name}SortInput {
  sortBy: [${name}SortEnum]
}`;

  return [inputName, inputDefinition, {}];
};

export default createEntitySortInputType;
