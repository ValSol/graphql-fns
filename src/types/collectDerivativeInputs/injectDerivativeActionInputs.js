// @flow

import type { ActionAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import fillInputDic from '../inputs/fillInputDic';

const injectDerivativeActionInputs = (
  derivativeKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  inputDic: { [inputName: string]: string },
): void => {
  const { actionAllowed, actionGeneralName, actionName, actionType, inputCreators } =
    actionAttributes;
  const { inventory } = generalConfig;

  const { name: configName } = entityConfig;

  if (!actionAllowed(entityConfig)) return;

  if (
    inventory &&
    // $FlowFixMe
    !checkInventory([actionType, actionGeneralName(derivativeKey), configName], inventory)
  ) {
    return;
  }
  // const specificName = actionName(configName, derivativeKey); ???? useles code

  // if (!specificName) return; ?????

  const derivativeConfig = composeDerivativeConfigByName(
    derivativeKey,
    entityConfig,
    generalConfig,
  );

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(derivativeConfig);
    if (inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillInputDic(childChain, inputDic);
    }
  });
};

export default injectDerivativeActionInputs;
