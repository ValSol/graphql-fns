// @flow

import type { Inventory, ThingConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import fillDic from './inputs/fillDic';
import childThings from './actionAttributes/childThingsQueryAttributes';

const composeChildActionSignature = (
  thingConfig: ThingConfig,
  dic: { [inputName: string]: string },
  inventory?: Inventory,
): string => {
  const {
    actionAllowed,
    actionGeneralName,
    actionName,
    actionType,
    inputCreators,
    argNames,
    argTypes,
    actionReturnString,
  } = childThings;
  const { name: configName } = thingConfig;

  if (!actionAllowed(thingConfig)) return '';

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
    const [inputName, inputDefinition, childChain] = inputCreator(thingConfig);
    toShow.push(Boolean(inputDefinition));
    if (inputName && !dic[inputName] && inputDefinition) {
      dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillDic(childChain, dic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString('')(thingConfig);

  if (!filteredArgNames.length) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](configName)}`)
    .join(', ');

  return args;
};

export default composeChildActionSignature;
