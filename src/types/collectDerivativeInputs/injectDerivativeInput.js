// @flow

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import fillDic from '../inputs/fillDic';
import inputCreators from './inputCreators';

const injectDerivativeInput = (
  inputGeneralName: string,
  suffix: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  dic: { [inputName: string]: string },
): void => {
  const derivativeConfig = suffix
    ? composeDerivativeConfigByName(suffix, thingConfig, generalConfig)
    : thingConfig;

  const inputCreator = inputCreators[inputGeneralName];

  if (!inputCreator) {
    throw new TypeError(`Incorrect inputGeneralName: "${inputGeneralName}"!`);
  }

  const [inputName, inputDefinition, childChain] = inputCreator(derivativeConfig);
  if (inputName && !dic[inputName] && inputDefinition) {
    dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
    fillDic(childChain, dic);
  }
};

export default injectDerivativeInput;
