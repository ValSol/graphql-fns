// @flow

import type { GeneralConfig } from '../../flowTypes';
import type { ParseActionArgs, ParseActionResult } from './flowTypes';

import actionToDerivative from './actionToDerivative';
import actionToInventory from './actionToInventory';
import childQueriesToDerivative from './childQueriesToDerivative';
import childQueriesToInventory from './childQueriesToInventory';
import getChildQueries from './getChildQueries';
import parseActionName from './parseActionName';

type Arg1 = {
  ...ParseActionArgs,
  generalConfig: GeneralConfig,
  suffixToPermission: { [suffix: string]: string },
};

const parseAction = (
  { actionType, actionName, generalConfig, options, suffix, suffixToPermission, thingName }: Arg1,
  { derivativeAttributes, inventoryByPermissions, maxShift }: ParseActionResult,
): ParseActionResult => {
  const actionToParse = { actionType, actionName, thingName, suffix };

  const parsedAction = parseActionName(actionToParse, generalConfig);

  actionToDerivative(actionToParse, parsedAction, derivativeAttributes, generalConfig);

  actionToInventory(actionToParse, parsedAction, inventoryByPermissions, suffixToPermission);

  if (!parsedAction.thingConfig) {
    return { inventoryByPermissions, derivativeAttributes, maxShift };
  }

  const { childQueries, maxShift: newMaxShift } = getChildQueries(
    parsedAction.thingConfig,
    generalConfig,
    options,
  );

  childQueriesToDerivative(childQueries, derivativeAttributes);

  childQueriesToInventory(childQueries, parsedAction, inventoryByPermissions, suffixToPermission);

  return {
    inventoryByPermissions,
    derivativeAttributes,
    maxShift: newMaxShift > maxShift ? newMaxShift : maxShift,
  };
};

export default parseAction;
