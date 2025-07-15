import type { InventoryByRoles } from '../../tsTypes';

const compressInventory = (
  // InventoryByRoles,
  inventoryByRoles: any,
  umbrellaInventory: {
    [permissionName: string]: Array<string>;
  },
): InventoryByRoles => {
  const result: Record<string, any> = {};

  Object.keys(umbrellaInventory).forEach((permission) => {
    if (!inventoryByRoles[permission]) return;

    if (!inventoryByRoles[permission].include) {
      result[permission] = { name: permission };
      return;
    }

    const { Query, Mutation } = inventoryByRoles[permission].include;

    if (Query) {
      Object.keys(Query).forEach((action) => {
        const correspondingValues = umbrellaInventory[permission].map(
          (umbrellaPermission) =>
            inventoryByRoles?.[umbrellaPermission]?.include?.Query?.[action] ?? [], // replace for "lodash.get"
        );
        Query[action].forEach((entityName) => {
          const skip = correspondingValues.some((thingNames) => thingNames.includes(entityName));
          if (skip) return;

          if (!result[permission]) {
            result[permission] = { name: permission, include: {} };
          }

          if (!result[permission].include.Query) {
            result[permission].include.Query = {};
          }

          if (!result[permission].include.Query[action]) {
            result[permission].include.Query[action] = [];
          }

          result[permission].include.Query[action].push(entityName);
        });
      });
    }

    if (Mutation) {
      Object.keys(Mutation).forEach((action) => {
        const correspondingValues = umbrellaInventory[permission].map(
          (umbrellaPermission) =>
            inventoryByRoles?.[umbrellaPermission]?.include?.Mutation?.[action] ?? [], // replace for "lodash.get"
        );
        Mutation[action].forEach((entityName) => {
          const skip = correspondingValues.some((thingNames) => thingNames.includes(entityName));
          if (skip) return;

          if (!result[permission]) {
            result[permission] = { name: permission, include: {} };
          }

          if (!result[permission].include.Mutation) {
            result[permission].include.Mutation = {};
          }

          if (!result[permission].include.Mutation[action]) {
            result[permission].include.Mutation[action] = [];
          }

          result[permission].include.Mutation[action].push(entityName);
        });
      });
    }
  });

  return result;
};

export default compressInventory;
