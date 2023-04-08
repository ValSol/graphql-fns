import type {InventoryByRoles} from '../../tsTypes';
import type { ChildQueries, ParsedAction } from './tsTypes';

const childQueriesToInventory = (
  childQueries: ChildQueries,
  parsedAction: ParsedAction,
  // InventoryByRoles,
  inventoryByRoles: any,
  derivativeKeyToPermission: {
    [derivativeKey: string]: string
  },
): InventoryByRoles => {
  const { derivativeKey: defaultDerivativeKey } = parsedAction;

  childQueries.forEach(({ actionName, derivativeKey, entityName }) => {
    const permission = derivativeKey
      ? derivativeKeyToPermission[derivativeKey]
      : derivativeKeyToPermission[defaultDerivativeKey];

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
