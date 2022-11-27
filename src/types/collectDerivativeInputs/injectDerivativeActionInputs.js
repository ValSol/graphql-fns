// @flow

import type { ActionAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import fillDic from '../inputs/fillDic';

const injectDerivativeActionInputs = (
  suffix: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  dic: { [inputName: string]: string },
): void => {
  const { actionAllowed, actionGeneralName, actionName, actionType, inputCreators } =
    actionAttributes;
  const { inventory } = generalConfig;

  const { name: configName } = entityConfig;

  if (!actionAllowed(entityConfig)) return;

  if (
    inventory &&
    // $FlowFixMe
    !checkInventory([actionType, actionGeneralName(suffix), configName], inventory)
  ) {
    return;
  }
  const specificName = actionName(configName, suffix);

  if (!specificName) return;

  const derivativeConfig = composeDerivativeConfigByName(suffix, entityConfig, generalConfig);

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(derivativeConfig);
    if (inputName && !dic[inputName] && inputDefinition) {
      dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillDic(childChain, dic);
    }
  });
};

export default injectDerivativeActionInputs;
