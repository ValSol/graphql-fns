// @flow

import type { InventoryByRoles } from '../../flowTypes';

const moveThingsToArray = (
  inventoryByRoles: Object, // InventoryByRoles,
): InventoryByRoles => {
  const result = {};

  Object.keys(inventoryByRoles).forEach((permission) => {
    if (!inventoryByRoles[permission].include) {
      result[permission] = { name: permission };
      return;
    }
    const { Query, Mutation } = inventoryByRoles[permission].include;

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
