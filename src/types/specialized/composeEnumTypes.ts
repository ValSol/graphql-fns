import type {GeneralConfig} from '../../tsTypes';

const composeEnumTypes = (generalConfig: GeneralConfig): string => {
  const { enums } = generalConfig;

  const linesArray = enums
    ? Object.keys(enums).reduce<Array<any>>((prev, name) => {
        const enumValue = enums[name];

        prev.push(`enum ${name}Enumeration {`);
        enumValue.forEach((item) => prev.push(`  ${item}`));
        prev.push('}');
        return prev;
      }, [])
    : [''];

  return linesArray.join('\n');
};

export default composeEnumTypes;
