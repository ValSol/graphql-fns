import type { EntityConfig, InputCreator } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';

// item of the "whereCompoundOneAndData" arg of "getOrCreateEntities" (alternative to "whereOneAndData")
const createEntityWhereCompoundOneAndCreateDataInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}WhereCompoundOneAndCreateDataInput`;

  if (!createEntityWhereCompoundOneInputType(entityConfig)[1]) {
    return [inputName, '', {}];
  }

  const inputDefinition = `input ${inputName} {
  whereCompoundOne: ${name}WhereCompoundOneInput!
  data: ${name}CreateInput!
}`;

  const childChain: Record<string, [InputCreator, EntityConfig]> = {
    [`${name}WhereCompoundOneInput`]: [createEntityWhereCompoundOneInputType, entityConfig],
    [`${name}CreateInput`]: [createEntityCreateInputType, entityConfig],
  };

  return [inputName, inputDefinition, childChain];
};

export default createEntityWhereCompoundOneAndCreateDataInputType;
