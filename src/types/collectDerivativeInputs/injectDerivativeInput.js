// @flow

import type { GeneralConfig, EntityConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import fillInputDic from '../inputs/fillInputDic';
import inputCreators from './inputCreators';

const injectDerivativeInput = (
  inputGeneralName: string,
  derivativeKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  inputDic: { [inputName: string]: string },
): void => {
  const derivativeConfig = derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

  const inputCreator = inputCreators[inputGeneralName];

  if (!inputCreator) {
    throw new TypeError(`Incorrect inputGeneralName: "${inputGeneralName}"!`);
  }

  const [inputName, inputDefinition, childChain] = inputCreator(derivativeConfig);
  if (inputName && !inputDic[inputName] && inputDefinition) {
    inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
    fillInputDic(childChain, inputDic);
  }
};

export default injectDerivativeInput;
