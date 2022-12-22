// @flow

import type {
  ActionAttributes,
  EntityConfig,
  GeneralConfig,
  ThreeSegmentInventoryChain,
} from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import composeDerivativeConfigByName from '../utils/composeDerivativeConfigByName';
import fillInputDic from './inputs/fillInputDic';
import fillEntityTypeDic from './fillEntityTypeDic';

const composeActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
  derivativeKey: string = '',
): string => {
  const {
    actionAllowed,
    actionIsChild,
    actionGeneralName,
    actionName,
    actionType,
    inputCreators,
    actionReturnConfig,
    argNames,
    argTypes,
    actionReturnString,
  } = actionAttributes;

  const { inventory } = generalConfig;

  const { name: configName } = entityConfig;

  if (actionIsChild || !actionAllowed(entityConfig)) return '';

  // $FlowFixMe
  const inventoryChain: ThreeSegmentInventoryChain = [
    actionType,
    actionGeneralName(derivativeKey),
    configName,
  ];

  if (inventory && !checkInventory(inventoryChain, inventory)) {
    return '';
  }

  const specificName = actionName(configName, derivativeKey);

  const toShow = [];

  const entityConfigForInputCreator = derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfigForInputCreator);
    toShow.push(Boolean(inputDefinition));
    if (inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString(derivativeKey)(entityConfig);

  if (!filteredArgNames.length) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](entityConfigForInputCreator.name)}`)
    .join(', ');

  const returnConfig = actionReturnConfig(entityConfig, generalConfig, derivativeKey);

  if (returnConfig) {
    fillEntityTypeDic(returnConfig, generalConfig, entityTypeDic, inputDic, inventory);
  }

  return `  ${specificName}(${args}): ${returnString}`;
};

export default composeActionSignature;
