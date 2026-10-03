import type { EntityConfig, InputCreator } from '../../tsTypes';

import createEntityUpdateInputType from './createEntityUpdateInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

// item of the "whereOneAndData" arg: "whereOne" & "data" are paired in one object instead of...
// ... two parallel arrays that have to be equal in length
const createEntityWhereOneAndDataInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}WhereOneAndDataInput`;

  // without fields to update there is nothing to pair with "whereOne"
  if (!createEntityUpdateInputType(entityConfig)[1]) {
    return [inputName, '', {}];
  }

  const inputDefinition = `input ${inputName} {
  whereOne: ${name}WhereOneInput!
  data: ${name}UpdateInput!
}`;

  const childChain: Record<string, [InputCreator, EntityConfig]> = {
    [`${name}WhereOneInput`]: [createEntityWhereOneInputType, entityConfig],
    [`${name}UpdateInput`]: [createEntityUpdateInputType, entityConfig],
  };

  return [inputName, inputDefinition, childChain];
};

export default createEntityWhereOneAndDataInputType;
