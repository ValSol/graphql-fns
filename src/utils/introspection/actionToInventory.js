// @flow

import type { InventoryByRoles } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

const actionToInventory = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  inventoryByRoles: Object, // InventoryByRoles,
  derivativeKeyToPermission: { [derivativeKey: string]: string },
): InventoryByRoles => {
  const { actionType, actionName, entityName } = actionToParse;
  const { derivativeKey } = parsedAction;

  const permission = derivativeKeyToPermission[derivativeKey];

  if (!inventoryByRoles[permission]) {
    inventoryByRoles[permission] = { name: permission }; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByRoles[permission].include) {
    inventoryByRoles[permission].include = {}; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByRoles[permission].include[actionType]) {
    inventoryByRoles[permission].include[actionType] = {}; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByRoles[permission].include[actionType][actionName]) {
    inventoryByRoles[permission].include[actionType][actionName] = []; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByRoles[permission].include[actionType][actionName].includes(entityName)) {
    inventoryByRoles[permission].include[actionType][actionName].push(entityName); // eslint-disable-line no-param-reassign
  }

  return inventoryByRoles;
};

export default actionToInventory;
