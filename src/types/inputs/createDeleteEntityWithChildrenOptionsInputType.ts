import type { InputCreator } from '../../tsTypes';

import getChildDuplexFields from '../../utils/getChildDuplexFields';

const createDeleteEntityWithChildrenOptionsInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `delete${name}WithChildrenOptionsInput`;

  // the same "children" fields that are deleted by "delete…WithChildren" mutations
  const lines = getChildDuplexFields(entityConfig).map(([{ name: fieldName }]) => `  ${fieldName}`);

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
