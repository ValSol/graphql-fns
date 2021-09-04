// @flow

import type { InventoryByPermissions } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

const actionToInventory = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  inventoryByPermissions: Object, // InventoryByPermissions,
  suffixToPermission: { [suffix: string]: string },
): InventoryByPermissions => {
  const { actionType, actionName, thingName } = actionToParse;
  const { suffix } = parsedAction;

  const permission = suffixToPermission[suffix];

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

  if (!inventoryByPermissions[permission].include[actionType][actionName].includes(thingName)) {
    inventoryByPermissions[permission].include[actionType][actionName].push(thingName); // eslint-disable-line no-param-reassign
  }

  return inventoryByPermissions;
};

export default actionToInventory;
