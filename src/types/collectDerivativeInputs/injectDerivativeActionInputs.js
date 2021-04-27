// @flow

import type { ActionAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import fillDic from '../inputs/fillDic';

const transformDic = {
  mutation: 'Mutation',
  query: 'Query',
};

const injectDerivativeActionInputs = (
  suffix: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  dic: { [inputName: string]: string },
): void => {
  const {
    actionAllowed,
    actionGeneralName,
    actionName,
    actionType,
    inputCreators,
  } = actionAttributes;
  const { inventory } = generalConfig;

  const { name: configName } = thingConfig;

  if (!actionAllowed(thingConfig)) return;

  if (
    inventory &&
    // $FlowFixMe
    !checkInventory([transformDic[actionType], actionGeneralName(suffix), configName], inventory)
  ) {
    return;
  }
  const specificName = actionName(configName, suffix);

  if (!specificName) return;

  const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(derivativeConfig);
    if (inputName && !dic[inputName] && inputDefinition) {
      dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillDic(childChain, dic);
    }
  });
};

export default injectDerivativeActionInputs;
