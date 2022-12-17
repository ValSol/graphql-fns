// @flow

import type { InventoryByPermissions } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

const actionToInventory = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  inventoryByPermissions: Object, // InventoryByPermissions,
  derivativeKeyToPermission: { [derivativeKey: string]: string },
): InventoryByPermissions => {
  const { actionType, actionName, entityName } = actionToParse;
  const { derivativeKey } = parsedAction;

  const permission = derivativeKeyToPermission[derivativeKey];

  if (!inventoryByPermissions[permission]) {
    inventoryByPermissions[permission] = { name: permission }; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByPermissions[permission].include) {
    inventoryByPermissions[permission].include = {}; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByPermissions[permission].include[actionType]) {
    inventoryByPermissions[permission].include[actionType] = {}; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByPermissions[permission].include[actionType][actionName]) {
    inventoryByPermissions[permission].include[actionType][actionName] = []; // eslint-disable-line no-param-reassign
  }

  if (!inventoryByPermissions[permission].include[actionType][actionName].includes(entityName)) {
    inventoryByPermissions[permission].include[actionType][actionName].push(entityName); // eslint-disable-line no-param-reassign
  }

  return inventoryByPermissions;
};

export default actionToInventory;
