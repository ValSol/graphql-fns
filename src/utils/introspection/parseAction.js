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
  derivativeKeyToPermission: { [derivativeKey: string]: string },
};

const parseAction = (
  {
    actionType,
    actionName,
    generalConfig,
    options,
    derivativeKey,
    derivativeKeyToPermission,
    entityName,
  }: Arg1,
  { derivativeAttributes, inventoryByPermissions, maxShift }: ParseActionResult,
): ParseActionResult => {
  const actionToParse = { actionType, actionName, entityName, derivativeKey };

  const parsedAction = parseActionName(actionToParse, generalConfig);

  actionToDerivative(actionToParse, parsedAction, derivativeAttributes, generalConfig);

  actionToInventory(actionToParse, parsedAction, inventoryByPermissions, derivativeKeyToPermission);

  if (!parsedAction.entityConfig) {
    return { inventoryByPermissions, derivativeAttributes, maxShift };
  }

  const { childQueries, maxShift: newMaxShift } = getChildQueries(
    parsedAction.entityConfig,
    generalConfig,
    options,
  );

  childQueriesToDerivative(childQueries, derivativeAttributes);

  childQueriesToInventory(
    childQueries,
    parsedAction,
    inventoryByPermissions,
    derivativeKeyToPermission,
  );

  return {
    inventoryByPermissions,
    derivativeAttributes,
    maxShift: newMaxShift > maxShift ? newMaxShift : maxShift,
  };
};

export default parseAction;
