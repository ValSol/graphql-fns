import type { InventoryByRoles } from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

const actionToInventory = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  // InventoryByRoles,
  inventoryByRoles: any,
  descendantKeyToPermission: {
    [descendantKey: string]: string;
  },
): InventoryByRoles => {
  const { actionType, actionName, entityName } = actionToParse;
  const { descendantKey } = parsedAction;

  const permission = descendantKeyToPermission[descendantKey];

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
