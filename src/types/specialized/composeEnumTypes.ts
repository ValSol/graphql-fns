import type { GeneralConfig } from '../../tsTypes';
import isCommonlyAllowedTypeName from '../../utils/isCommonlyAllowedTypeName';

const composeEnumTypes = (generalConfig: GeneralConfig): string => {
  const { enums } = generalConfig;

  const linesArray = enums
    ? Object.keys(enums).reduce<Array<any>>((prev, name) => {
        const enumValues = enums[name];

        if (!isCommonlyAllowedTypeName(name)) {
          throw new TypeError(`Incorrect enum name: "${name}"!`);
        }

        prev.push(`enum ${name}Enumeration {`);
        enumValues.forEach((item) => {
          if (!isCommonlyAllowedTypeName(item)) {
            throw new TypeError(`Incorrect enum item name: "${item}"!`);
          }

          prev.push(`  ${item}`);
        });
        prev.push('}');
        return prev;
      }, [])
    : [''];

  return linesArray.join('\n');
};

export default composeEnumTypes;
