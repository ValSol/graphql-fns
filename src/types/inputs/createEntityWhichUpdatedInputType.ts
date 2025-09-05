import type { InputCreator } from '@/tsTypes';

import composeFieldsObject, { WITHOUT_CALCULATED_WITH_ASYNC } from '@/utils/composeFieldsObject';

const createEntityWhichUpdatedInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}WhichUpdatedInput`;

  const lines = Object.keys(
    composeFieldsObject(entityConfig, WITHOUT_CALCULATED_WITH_ASYNC).fieldsObject,
  ).map((line) => `  ${line}`);

  if (lines.length === 0) {
    return [inputName, '', {}];
  }

  const enumName = `${name}WhichUpdatedEnum`;

  const inputDefinition = `enum ${enumName} {
${lines.join('\n')}
}
input ${inputName} {
  updatedFields: ${enumName}
  updatedFields_ne: ${enumName}
  updatedFields_in: [${enumName}!]
  updatedFields_nin: [${enumName}!]
}`;

  return [inputName, inputDefinition, {}];
};

export default createEntityWhichUpdatedInputType;
