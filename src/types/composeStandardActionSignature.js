// @flow

import type { ActionAttributes, Inventory, EntityConfig } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import fillDic from './inputs/fillDic';

const composeStandardActionSignature = (
  entityConfig: EntityConfig,
  actionAttributes: ActionAttributes,
  dic: { [inputName: string]: string },
  inventory?: Inventory,
): string => {
  const {
    actionAllowed,
    actionIsChild,
    actionGeneralName,
    actionName,
    actionType,
    inputCreators,
    argNames,
    argTypes,
    actionReturnString,
  } = actionAttributes;
  const { name: configName } = entityConfig;

  if (actionIsChild || !actionAllowed(entityConfig)) return '';

  if (
    inventory &&
    // $FlowFixMe
    !checkInventory([actionType, actionGeneralName(), configName], inventory)
  ) {
    return '';
  }
  const specificName = actionName(configName);

  const toShow = [];

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfig);
    toShow.push(Boolean(inputDefinition));
    if (inputName && !dic[inputName] && inputDefinition) {
      dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillDic(childChain, dic);
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

  return `  ${specificName}(${args}): ${returnString}`;
};

export default composeStandardActionSignature;
