// @flow

import type { Inventory, EntityConfig, GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import parseEntityName from '../utils/parseEntityName';
import fillInputDic from './inputs/fillInputDic';
import { queryAttributes } from './actionAttributes';

const composeChildActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  childQueryGeneralName: string,
  inputDic?: { [inputName: string]: string },
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
  const { allEntityConfigs } = generalConfig;

  const { root: rootName, derivativeKey } = parseEntityName(entityConfig.name, generalConfig);

  if (
    inventory &&
    // $FlowFixMe
    !checkInventory([actionType, actionGeneralName(derivativeKey), configName], inventory)
  ) {
    return '';
  }
  const specificName = actionName(rootName, derivativeKey);

  const toShow = [];

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfig);
    toShow.push(Boolean(inputDefinition));
    if (inputDic && inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString(allEntityConfigs[rootName], derivativeKey);

  if (!filteredArgNames.length) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](configName)}`)
    .join(', ');

  return args;
};

export default composeChildActionSignature;
