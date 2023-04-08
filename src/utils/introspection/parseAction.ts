import type {GeneralConfig} from '../../tsTypes';
import type { ParseActionArgs, ParseActionResult } from './tsTypes';

import actionToDerivative from './actionToDerivative';
import actionToInventory from './actionToInventory';
import childQueriesToDerivative from './childQueriesToDerivative';
import childQueriesToInventory from './childQueriesToInventory';
import getChildQueries from './getChildQueries';
import parseActionName from './parseActionName';

type Arg1 = (ParseActionArgs) & {
  generalConfig: GeneralConfig,
  derivativeKeyToPermission: {
    [derivativeKey: string]: string
  }
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
  {
    derivativeAttributes,
    inventoryByRoles,
    maxShift,
  }: ParseActionResult,
): ParseActionResult => {
  const actionToParse = { actionType, actionName, entityName, derivativeKey } as const;

  const parsedAction = parseActionName(actionToParse, generalConfig);

  actionToDerivative(actionToParse, parsedAction, derivativeAttributes, generalConfig);

  actionToInventory(actionToParse, parsedAction, inventoryByRoles, derivativeKeyToPermission);

  if (!parsedAction.entityConfig) {
    return { inventoryByRoles, derivativeAttributes, maxShift };
  }

  const { childQueries, maxShift: newMaxShift } = getChildQueries(
    parsedAction.entityConfig,
    generalConfig,
    options,
  );

  childQueriesToDerivative(childQueries, derivativeAttributes);

  childQueriesToInventory(childQueries, parsedAction, inventoryByRoles, derivativeKeyToPermission);

  return {
    inventoryByRoles,
    derivativeAttributes,
    maxShift: newMaxShift > maxShift ? newMaxShift : maxShift,
  };
};

export default parseAction;
