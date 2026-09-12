import type { InventoryByRoles } from '../../tsTypes';
import type { ChildQueries, ParsedAction } from './tsTypes';

const childQueriesToInventory = (
  childQueries: ChildQueries,
  parsedAction: ParsedAction,
  // InventoryByRoles,
  inventoryByRoles: any,
  representationKeyToPermission: {
    [representationKey: string]: string;
  },
): InventoryByRoles => {
  const { representationKey: defaultRepresentationKey } = parsedAction;

  childQueries.forEach(({ actionName, representationKey, entityName }) => {
    const permission = representationKey
      ? representationKeyToPermission[representationKey]
      : representationKeyToPermission[defaultRepresentationKey];

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
