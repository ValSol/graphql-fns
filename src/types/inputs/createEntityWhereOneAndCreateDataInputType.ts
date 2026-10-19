import type { EntityConfig, InputCreator } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

// item of the "whereOneAndData" arg of "getOrCreateEntities": "whereOne" to get the entity is...
// ... paired with "data" to create it (if it is not found)
const createEntityWhereOneAndCreateDataInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}WhereOneAndCreateDataInput`;

  const inputDefinition = `input ${inputName} {
  whereOne: ${name}WhereOneInput!
  data: ${name}CreateInput!
}`;

  const childChain: Record<string, [InputCreator, EntityConfig]> = {
    [`${name}WhereOneInput`]: [createEntityWhereOneInputType, entityConfig],
    [`${name}CreateInput`]: [createEntityCreateInputType, entityConfig],
  };

  return [inputName, inputDefinition, childChain];
};

export default createEntityWhereOneAndCreateDataInputType;
