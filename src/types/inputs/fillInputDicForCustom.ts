import type { GeneralConfig } from '../../tsTypes';

import composeDescendantConfig from '../../utils/composeDescendantConfig';
import fillInputDic from './fillInputDic';
import inputs from './index';

const commonInputTypes = [
  'Boolean',
  'Float',
  'ID',
  'Int',
  'String',
  'DateTime',
  'Upload',
  'RegExp',
  'SliceInput',
  // geospatial types
  'GeospatialPointInput',
  'GeospatialPolygonRingInput',
  'GeospatialPolygonInput',
];

const regExp = /[\[\]\!]/g;

const fillInputDicForCustom = (
  rawArgType: string,
  generalConfig: GeneralConfig,
  inputDic: {
    /** inputDefinition */
    [inputName: string]: string;
  },
) => {
  const argType = rawArgType.replace(regExp, '');

  if (inputDic[argType] || inputDic[`!${argType}`]) {
    return;
  }

  if (commonInputTypes.includes(argType)) {
    return;
  }

  const { custom = {}, allEntityConfigs, descendant = {}, enums = {} } = generalConfig;

  const allEntityNames = Object.keys(allEntityConfigs).map((name) => name);

  const descendantKeys = ['', ...Object.keys(descendant)];

  const { Input: customInput = {} } = custom;

  const customInputNames = Object.keys(customInput);

  if (argType.endsWith('Enumeration')) {
    const enumeration = enums[argType.slice(0, -'Enumeration'.length)];

    if (enumeration) return;
  }

  for (let i = 0; i < allEntityNames.length; i += 1) {
    const entityName = allEntityNames[i];

    if (argType.endsWith('Input') || argType.endsWith('Enum')) {
      for (let j = 0; j < descendantKeys.length; j += 1) {
        const descendantKey = descendantKeys[j];

        const entityConfig = descendantKey
          ? composeDescendantConfig(
              descendant[descendantKey],
              allEntityConfigs[entityName],
              generalConfig,
            )
          : allEntityConfigs[entityName];

        for (let k = 0; k < inputs.length; k += 1) {
          const inputCreator = inputs[k];

          // const entityConfig = descendantKey
          //   ? composeDescendantConfig(
          //       descendant[descendantKey],
          //       allEntityConfigs[entityName],
          //       generalConfig,
          //     )
          //   : allEntityConfigs[entityName];

          if (!entityConfig) continue;

          const [inputName, inputDefinition, childChain] = inputCreator(entityConfig);

          const re = argType.endsWith('Input')
            ? new RegExp(`^input ${argType} {$`, 'm')
            : new RegExp(`^enum ${argType} {$`, 'm');

          if (re.test(inputDefinition)) {
            inputDic[inputName] = inputDefinition;
            fillInputDic(childChain, inputDic);

            if (inputName !== argType) {
              inputDic[`!${argType}`] = 'defined';
            }

            return;
          }
        }
      }
    }

    for (let j = 0; j < customInputNames.length; j += 1) {
      const {
        specificName: composeSpecificName,
        fieldNames: composeFieldNames,
        fieldTypes: composeFieldTypes,
      } = customInput[customInputNames[j]];

      const specificName = composeSpecificName(allEntityConfigs[entityName], generalConfig);

      if (specificName !== argType) continue;

      const fieldNames = composeFieldNames(allEntityConfigs[entityName], generalConfig);
      const fieldTypes = composeFieldTypes(allEntityConfigs[entityName], generalConfig);

      const inputDefinition = [
        ...fieldNames.reduce(
          (prev, fieldName, k) => {
            prev.push(`  ${fieldName}: ${fieldTypes[k]}`);

            return prev;
          },
          [`input ${specificName} {`],
        ),
        '}',
      ].join('\n');

      inputDic[specificName] = inputDefinition;

      fieldTypes.forEach((rawfieldType) => {
        const fieldType = rawfieldType.replace(regExp, '');

        if (!inputDic[fieldType]) {
          fillInputDicForCustom(fieldType, generalConfig, inputDic);
        }
      });

      return;
    }
  }

  throw new TypeError(`Not found type definition for type: "${argType}"!`);
};

export default fillInputDicForCustom;
