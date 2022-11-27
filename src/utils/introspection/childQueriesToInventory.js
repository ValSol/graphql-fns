// @flow

import type { InventoryByPermissions } from '../../flowTypes';
import type { ChildQueries, ParsedAction } from './flowTypes';

const childQueriesToInventory = (
  childQueries: ChildQueries,
  parsedAction: ParsedAction,
  inventoryByPermissions: Object, // InventoryByPermissions,
  suffixToPermission: { [suffix: string]: string },
): InventoryByPermissions => {
  const { suffix: defaultSuffix } = parsedAction;

  childQueries.forEach(({ actionName, suffix, entityName }) => {
    const permission = suffix ? suffixToPermission[suffix] : suffixToPermission[defaultSuffix];

    const inventory1 = inventoryByPermissions[permission];
    if (!inventory1) {
      inventoryByPermissions[permission] = { name: permission }; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByPermissions[permission].include) {
      inventoryByPermissions[permission].include = {}; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByPermissions[permission].include.Query) {
      inventoryByPermissions[permission].include.Query = {}; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByPermissions[permission].include.Query[actionName]) {
      inventoryByPermissions[permission].include.Query[actionName] = []; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByPermissions[permission].include.Query[actionName].includes(entityName)) {
      inventoryByPermissions[permission].include.Query[actionName].push(entityName); // eslint-disable-line no-param-reassign
    }
  });

  return inventoryByPermissions;
};

export default childQueriesToInventory;
