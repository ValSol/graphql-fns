import type { InputCreator } from '../../tsTypes';

import getMatchingFields from '../../utils/getMatchingFields';

const createCopyEntityOptionsInputType: InputCreator = (entityConfig) => {
  const { type: entityType, name } = entityConfig;

  const inputName = `copy${name}OptionsInput`;

  if (entityType !== 'tangible') {
    return [inputName, '', {}];
  }

  const { duplexFields } = entityConfig;

  if (!duplexFields || duplexFields.length === 0) {
    return [inputName, '', {}];
  }

  const enumLines: Array<string> = [];
  const inputLines: Array<string> = [];
  const fieldLines: Array<string> = [];

  duplexFields.forEach(({ config, name: fieldName }) => {
    const matchingFields = getMatchingFields(entityConfig, config).filter(
      (matchingField) => matchingField !== fieldName,
    );
    if (matchingFields.length > 0) {
      enumLines.push(`enum copy${name}Through${fieldName}OptionsEnum {
${matchingFields.map((enumItem) => `  ${enumItem}`).join('\n')}
}`);

      inputLines.push(`input copy${name}Through${fieldName}OptionInput {
  fieldsToCopy: [copy${name}Through${fieldName}OptionsEnum!]
  fieldsForbiddenToCopy: [copy${name}Through${fieldName}OptionsEnum!]
}`);
      fieldLines.push(`  ${fieldName}: copy${name}Through${fieldName}OptionInput`);
    }
  });

  if (fieldLines.length === 0) {
    return [inputName, '', {}];
  }

  const inputDefinition = `${enumLines.join('\n')}
${inputLines.join('\n')}
input ${inputName} {
${fieldLines.join('\n')}
}`;

  return [inputName, inputDefinition, {}];
};

export default createCopyEntityOptionsInputType;
