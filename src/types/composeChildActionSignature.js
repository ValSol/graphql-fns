// @flow

import type { Inventory, EntityConfig } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import fillDic from './inputs/fillDic';
import { queryAttributes } from './actionAttributes';

const composeChildActionSignature = (
  entityConfig: EntityConfig,
  childQueryGeneralName: string,
  dic?: { [inputName: string]: string },
  inventory?: Inventory,
): string => {
  const {
    actionGeneralName,
    actionName,
    actionType,
    inputCreators,
    argNames,
    argTypes,
    actionReturnString,
  } = queryAttributes[childQueryGeneralName];
  const { name: configName } = entityConfig;

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
    if (dic && inputName && !dic[inputName] && inputDefinition) {
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

  return args;
};

export default composeChildActionSignature;
