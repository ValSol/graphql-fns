import type { InventoryByRoles, InventoryOptions } from '../../tsTypes';

const mergeInventories = (inventoryByRoles: InventoryByRoles): InventoryByRoles => {
  const result = {};

  Object.keys(inventoryByRoles).forEach((permission) => {
    if (!inventoryByRoles[permission].include) {
      result[permission] = { name: permission };
      return;
    }

    if (inventoryByRoles[permission].include === true) {
      throw new TypeError(
        `Inventory by Roles "include" attribute for role "${permission}" equal to "true"!`,
      );
    }

    const { Query, Mutation } = inventoryByRoles[permission].include as InventoryOptions;

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
