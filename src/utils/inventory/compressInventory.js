// @flow

import lodashGet from 'lodash.get';

import type { InventoryByPermissions } from '../../flowTypes';

const compressInventory = (
  inventoryByPermissions: Object, // InventoryByPermissions,
  umbrellaInventory: { [permissionName: string]: Array<string> },
): InventoryByPermissions => {
  const result = {};

  Object.keys(umbrellaInventory).forEach((permission) => {
    if (!inventoryByPermissions[permission]) return;

    if (!inventoryByPermissions[permission].include) {
      result[permission] = { name: permission };
      return;
    }

    const { Query, Mutation } = inventoryByPermissions[permission].include;

    if (Query) {
      Object.keys(Query).forEach((action) => {
        const correspondingValues = umbrellaInventory[permission].map((umbrellaPermission) =>
          lodashGet(inventoryByPermissions, `${umbrellaPermission}.include.Query.${action}`, []),
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
        const correspondingValues = umbrellaInventory[permission].map((umbrellaPermission) =>
          lodashGet(inventoryByPermissions, `${umbrellaPermission}.include.Mutation.${action}`, []),
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
