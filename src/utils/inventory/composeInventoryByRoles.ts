import type { Inventory } from '../../tsTypes';

type Result = {
  [permissionName: string]: Inventory;
};

const composeInventoryByRoles = (inventories: Array<Inventory>): Result => {
  const result = inventories.reduce<Record<string, any>>((prev, inventory) => {
    const { name } = inventory;
    if (typeof name === 'undefined') {
      throw new TypeError('Inventory of permission must have name!');
    }
    if (prev[name]) {
      throw new TypeError(`Unique permission name: "${name}" is used twice!`);
    }

    prev[name] = inventory;

    return prev;
  }, {});

  return result;
};

export default composeInventoryByRoles;
