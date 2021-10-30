//  @flow

import type { InputCreator } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';

const createDeleteThingWithChildrenOptionsInputType: InputCreator = (thingConfig) => {
  const { name } = thingConfig;

  const inputName = `delete${name}WithChildrenOptionsInput`;

  const lines = getOppositeFields(thingConfig)
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

export default createDeleteThingWithChildrenOptionsInputType;
