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
      inventoryByRoles[permission] = { name: permission }; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByRoles[permission].include) {
      inventoryByRoles[permission].include = {}; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByRoles[permission].include.Query) {
      inventoryByRoles[permission].include.Query = {}; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByRoles[permission].include.Query[actionName]) {
      inventoryByRoles[permission].include.Query[actionName] = []; // eslint-disable-line no-param-reassign
    }

    if (!inventoryByRoles[permission].include.Query[actionName].includes(entityName)) {
      inventoryByRoles[permission].include.Query[actionName].push(entityName); // eslint-disable-line no-param-reassign
    }
  });

  return inventoryByRoles;
};

export default childQueriesToInventory;
