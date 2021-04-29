//  @flow

import type { InputCreator } from '../../flowTypes';

const createThingDistinctValuesOptionsInputType: InputCreator = (thingConfig) => {
  const { textFields, name } = thingConfig;

  const inputName = `${name}DistinctValuesOptionsInput`;

  const fieldLines = textFields ? textFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  const inputDefinition = fieldLines.length
    ? `enum ${name}TextNamesEnum {
${fieldLines.join('\n')}
}
input ${name}DistinctValuesOptionsInput {
  target: ${name}TextNamesEnum!
}`
    : '';

  return [inputName, inputDefinition, {}];
};

export default createThingDistinctValuesOptionsInputType;
