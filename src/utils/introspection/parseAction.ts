import type { GeneralConfig } from '../../tsTypes';
import type { ParseActionArgs, ParseActionResult } from './tsTypes';

import actionToDescendant from './actionToDescendant';
import actionToInventory from './actionToInventory';
import childQueriesToDescendant from './childQueriesToDescendant';
import childQueriesToInventory from './childQueriesToInventory';
import getChildQueries from './getChildQueries';
import parseActionName from './parseActionName';

type Arg1 = ParseActionArgs & {
  generalConfig: GeneralConfig;
  descendantKeyToPermission: {
    [descendantKey: string]: string;
  };
};

const parseAction = (
  {
    actionType,
    actionName,
    generalConfig,
    options,
    descendantKey,
    descendantKeyToPermission,
    entityName,
  }: Arg1,
  { descendantAttributes, inventoryByRoles, maxShift }: ParseActionResult,
): ParseActionResult => {
  const actionToParse = { actionType, actionName, entityName, descendantKey } as const;

  const parsedAction = parseActionName(actionToParse, generalConfig);

  actionToDescendant(actionToParse, parsedAction, descendantAttributes, generalConfig);

  actionToInventory(actionToParse, parsedAction, inventoryByRoles, descendantKeyToPermission);

  if (!parsedAction.entityConfig) {
    return { inventoryByRoles, descendantAttributes, maxShift };
  }

  const { childQueries, maxShift: newMaxShift } = getChildQueries(
    parsedAction.entityConfig,
    generalConfig,
    options,
  );

  childQueriesToDescendant(childQueries, descendantAttributes);

  childQueriesToInventory(childQueries, parsedAction, inventoryByRoles, descendantKeyToPermission);

  return {
    inventoryByRoles,
    descendantAttributes,
    maxShift: newMaxShift > maxShift ? newMaxShift : maxShift,
  };
};

export default parseAction;
