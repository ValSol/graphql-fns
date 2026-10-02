import type { EntityConfig, InputCreator } from '../../tsTypes';

import createEntityWhereInputType from './createEntityWhereInputType';

const createEntityWhereAndSearchInputType: InputCreator = (entityConfig) => {
  const { name, textFields = [] } = entityConfig;

  const inputName = `${name}WhereAndSearchInput`;

  const fields = [`  where: ${name}WhereInput = {}`];

  // "search" is added on the same condition as the "search" arg of "XCount" ...
  // ... (see "createStringInputTypeForSearch")
  if (textFields.some(({ weight }) => weight)) {
    fields.push('  search: String');
  }

  const inputDefinition = [`input ${inputName} {`, ...fields, '}'].join('\n');

  const childChain: Record<string, [InputCreator, EntityConfig]> = {
    [`${name}WhereInput`]: [createEntityWhereInputType, entityConfig],
  };

  return [inputName, inputDefinition, childChain];
};

export default createEntityWhereAndSearchInputType;
