import type { EntityConfig, InputCreator } from '../../tsTypes';

import createEntityUpdateInputType from './createEntityUpdateInputType';
import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';

// item of the "whereCompoundOneAndData" arg (alternative to "whereOneAndData")
const createEntityWhereCompoundOneAndDataInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}WhereCompoundOneAndDataInput`;

  if (
    !createEntityWhereCompoundOneInputType(entityConfig)[1] ||
    !createEntityUpdateInputType(entityConfig)[1]
  ) {
    return [inputName, '', {}];
  }

  const inputDefinition = `input ${inputName} {
  whereCompoundOne: ${name}WhereCompoundOneInput!
  data: ${name}UpdateInput!
}`;

  const childChain: Record<string, [InputCreator, EntityConfig]> = {
    [`${name}WhereCompoundOneInput`]: [createEntityWhereCompoundOneInputType, entityConfig],
    [`${name}UpdateInput`]: [createEntityUpdateInputType, entityConfig],
  };

  return [inputName, inputDefinition, childChain];
};

export default createEntityWhereCompoundOneAndDataInputType;
