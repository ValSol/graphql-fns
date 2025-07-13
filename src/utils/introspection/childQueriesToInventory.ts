import type { InventoryByRoles } from '../../tsTypes';
import type { ChildQueries, ParsedAction } from './tsTypes';

const childQueriesToInventory = (
  childQueries: ChildQueries,
  parsedAction: ParsedAction,
  // InventoryByRoles,
  inventoryByRoles: any,
  descendantKeyToPermission: {
    [descendantKey: string]: string;
  },
): InventoryByRoles => {
  const { descendantKey: defaultDescendantKey } = parsedAction;

  childQueries.forEach(({ actionName, descendantKey, entityName }) => {
    const permission = descendantKey
      ? descendantKeyToPermission[descendantKey]
      : descendantKeyToPermission[defaultDescendantKey];

    const inventory1 = inventoryByRoles[permission];
    if (!inventory1) {
      inventoryByRoles[permission] = { name: permission };
    }

    if (!inventoryByRoles[permission].include) {
      inventoryByRoles[permission].include = {};
    }

    if (!inventoryByRoles[permission].include.Query) {
      inventoryByRoles[permission].include.Query = {};
    }

    if (!inventoryByRoles[permission].include.Query[actionName]) {
      inventoryByRoles[permission].include.Query[actionName] = [];
    }

    if (!inventoryByRoles[permission].include.Query[actionName].includes(entityName)) {
      inventoryByRoles[permission].include.Query[actionName].push(entityName);
    }
  });

  return inventoryByRoles;
};

export default childQueriesToInventory;
