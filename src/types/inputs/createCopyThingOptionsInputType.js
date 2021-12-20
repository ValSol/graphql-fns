//  @flow

import type { InputCreator } from '../../flowTypes';

import getMatchingFields from '../../utils/getMatchingFields';

const createCopyThingOptionsInputType: InputCreator = (thingConfig) => {
  const { name, duplexFields } = thingConfig;

  const inputName = `copy${name}OptionsInput`;

  if (!duplexFields || !duplexFields.length) {
    return [inputName, '', {}];
  }

  const enumLines = [];
  const inputLines = [];
  const fieldLines = [];

  duplexFields.forEach(({ config, name: fieldName }) => {
    const matchingFields = getMatchingFields(thingConfig, config).filter(
      (matchingField) => matchingField !== fieldName,
    );
    if (matchingFields.length) {
      enumLines.push(`enum copy${name}Through${fieldName}OptionsEnum {
${matchingFields.map((enumItem) => `  ${enumItem}`).join('\n')}
}`);

      inputLines.push(`input copy${name}Through${fieldName}OptionInput {
  fieldsToCopy: [copy${name}Through${fieldName}OptionsEnum!]!
}`);
      fieldLines.push(`  ${fieldName}: copy${name}Through${fieldName}OptionInput`);
    }
  });

  if (!fieldLines.length) {
    return [inputName, '', {}];
  }

  const inputDefinition = `${enumLines.join('\n')}
${inputLines.join('\n')}
input ${inputName} {
${fieldLines.join('\n')}
}`;

  return [inputName, inputDefinition, {}];
};

export default createCopyThingOptionsInputType;
