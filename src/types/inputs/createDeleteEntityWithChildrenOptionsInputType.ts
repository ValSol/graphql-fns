import type {InputCreator} from '../../tsTypes';

import getOppositeFields from '../../utils/getOppositeFields';

const createDeleteEntityWithChildrenOptionsInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `delete${name}WithChildrenOptionsInput`;

  const lines = getOppositeFields(entityConfig)
    .filter(([, { array, parent }]: [any, any]) => !(array || parent))
    .map(([, { oppositeName }]: [any, any]) => `  ${oppositeName}`);

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
