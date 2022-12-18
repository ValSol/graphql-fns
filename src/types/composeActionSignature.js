// @flow

import type {
  ActionAttributes,
  EntityConfig,
  GeneralConfig,
  ThreeSegmentInventoryChain,
} from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import fillInputDic from './inputs/fillInputDic';
import fillEntityTypeDic from './fillEntityTypeDic';

const composeActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
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
  const inventoryChain: ThreeSegmentInventoryChain = [actionType, actionGeneralName(), configName];

  if (inventory && !checkInventory(inventoryChain, inventory)) {
    return '';
  }

  const specificName = actionName(configName);

  const toShow = [];

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfig);
    toShow.push(Boolean(inputDefinition));
    if (inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString('')(entityConfig);

  if (!filteredArgNames.length) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](configName)}`)
    .join(', ');

  const returnConfig = actionReturnConfig(entityConfig, generalConfig);

  if (returnConfig) {
    fillEntityTypeDic(returnConfig, entityTypeDic, inputDic);
  }

  return `  ${specificName}(${args}): ${returnString}`;
};

export default composeActionSignature;
