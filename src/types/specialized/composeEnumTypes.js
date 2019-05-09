// @flow

import type { GeneralConfig } from '../../flowTypes';

const composeEnumTypes = (generalConfig: GeneralConfig): string => {
  const { enums } = generalConfig;
  const linesArray = enums
    ? enums.reduce(
        (prev, { name, enum: enumValue }) => {
          prev.push(`enum ${name}Enumeration {`);
          enumValue.forEach(item => prev.push(`  ${item}`));
          prev.push('}');
          return prev;
        },
        [''],
      )
    : [''];

  return linesArray.join('\n');
};

module.exports = composeEnumTypes;
