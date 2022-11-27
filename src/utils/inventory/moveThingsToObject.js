// @flow

import type { InventoryByPermissions } from '../../flowTypes';

const mergeInventories = (
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

        result[permission].include.Query[action] = Query[action].reduce((prev, entityName) => {
          prev[entityName] = true; // eslint-disable-line no-param-reassign
          return prev;
        }, {});
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

        result[permission].include.Mutation[action] = Mutation[action].reduce(
          (prev, entityName) => {
            prev[entityName] = true; // eslint-disable-line no-param-reassign
            return prev;
          },
          {},
        );
      });
    }
  });

  return result;
};

export default mergeInventories;
