import type { GeneralConfig } from '../../tsTypes';
import type { ParseActionArgs, ParseActionResult } from './tsTypes';

import actionToRepresentation from './actionToRepresentation';
import actionToInventory from './actionToInventory';
import childQueriesToRepresentation from './childQueriesToRepresentation';
import childQueriesToInventory from './childQueriesToInventory';
import getChildQueries from './getChildQueries';
import parseActionName from './parseActionName';

type Arg1 = ParseActionArgs & {
  generalConfig: GeneralConfig;
  representationKeyToPermission: {
    [representationKey: string]: string;
  };
};

const parseAction = (
  {
    actionType,
    actionName,
    generalConfig,
    options,
    representationKey,
    representationKeyToPermission,
    entityName,
  }: Arg1,
  { representationAttributes, inventoryByRoles, maxShift }: ParseActionResult,
): ParseActionResult => {
  const actionToParse = { actionType, actionName, entityName, representationKey } as const;

  const parsedAction = parseActionName(actionToParse, generalConfig);

  actionToRepresentation(actionToParse, parsedAction, representationAttributes, generalConfig);

  actionToInventory(actionToParse, parsedAction, inventoryByRoles, representationKeyToPermission);

  if (!parsedAction.entityConfig) {
    return { inventoryByRoles, representationAttributes, maxShift };
  }

  const { childQueries, maxShift: newMaxShift } = getChildQueries(
    parsedAction.entityConfig,
    generalConfig,
    options,
  );

  childQueriesToRepresentation(childQueries, representationAttributes);

  childQueriesToInventory(
    childQueries,
    parsedAction,
    inventoryByRoles,
    representationKeyToPermission,
  );

  return {
    inventoryByRoles,
    representationAttributes,
    maxShift: newMaxShift > maxShift ? newMaxShift : maxShift,
  };
};

export default parseAction;
