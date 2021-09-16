// @flow

import type { InventoryByPermissions } from '../../flowTypes';

const moveThingsToArray = (
  inventoryByPermissions: Object, // InventoryByPermissions,
): InventoryByPermissions => {
  const result = {};

  Object.keys(inventoryByPermissions).forEach((permission) => {
    if (!inventoryByPermissions[permission].include) {
      result[permission] = { name: permission };
      return;
    }
    const { Query, Mutation } = inventoryByPermissions[permission].include;

    if (Query) {
      Object.keys(Query).forEach((action) => {
        if (!result[permission]) {
          result[permission] = { name: permission, include: {} };
        }

        if (!result[permission].include.Query) {
          result[permission].include.Query = {};
        }

        result[permission].include.Query[action] = Object.keys(Query[action]);
      });
    }

    if (Mutation) {
      Object.keys(Mutation).forEach((action) => {
        if (!result[permission]) {
          result[permission] = { name: permission, include: {} };
        }

        if (!result[permission].include.Mutation) {
          result[permission].include.Mutation = {};
        }

        result[permission].include.Mutation[action] = Object.keys(Mutation[action]);
      });
    }
  });

  return result;
};

export default moveThingsToArray;
