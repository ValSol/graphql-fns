//  @flow

import type { InputCreator } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';

const createDeleteEntityWithChildrenOptionsInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `delete${name}WithChildrenOptionsInput`;

  const lines = getOppositeFields(entityConfig)
    .filter(([, { array, parent }]) => !(array || parent))
    .map(([, { oppositeName }]) => `  ${oppositeName}`);

  if (!lines.length) return [inputName, '', {}];

  const inputDefinition = `enum delete${name}WithChildrenOptionsEnum {
${lines.join('\n')}
}
input delete${name}WithChildrenOptionsInput {
  fieldsToDelete: [delete${name}WithChildrenOptionsEnum]
}`;

  return [inputName, inputDefinition, {}];
};

export default createDeleteEntityWithChildrenOptionsInputType;
