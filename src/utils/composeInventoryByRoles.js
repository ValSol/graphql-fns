// @flow

import type { Inventory } from '../flowTypes';

type Result = { [roleName: string]: Inventory };

const composeInventoryByRoles = (inventories: Array<Inventory>): Result => {
  const result = inventories.reduce((prev, inventory) => {
    const { name } = inventory;
    if (typeof name === 'undefined') {
      throw new TypeError('Inventory of role must have name!');
    }
    if (prev[name]) {
      throw new TypeError(`Unique role name: "${name}" is used twice!`);
    }

    prev[name] = inventory; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  return result;
};

export default composeInventoryByRoles;
