// @flow

import type { Inventory } from '../flowTypes';

type Result = { [rightName: string]: Inventory };

const composeInventoryByRights = (inventories: Array<Inventory>): Result => {
  const result = inventories.reduce((prev, inventory) => {
    const { name } = inventory;
    if (typeof name === 'undefined') {
      throw new TypeError('Inventory of right must have name!');
    }
    if (prev[name]) {
      throw new TypeError(`Unique right name: "${name}" is used twice!`);
    }

    prev[name] = inventory; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  return result;
};

export default composeInventoryByRights;
