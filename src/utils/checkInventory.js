// @flow
import type { Inventory, InventoryСhain } from '../flowTypes';

const store = {};

const checkInventory = (inventoryСhain: InventoryСhain, inventory: Inventory = {}): boolean => {
  const { include, exclude, name } = inventory;

  const signature = `${JSON.stringify(inventoryСhain)} ${name}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[signature]) return store[signature];

  let level = 0;
  let currentInclude: Object = include;
  let currentExclude: Object = exclude;
  while (level < inventoryСhain.length) {
    if (currentInclude && currentInclude !== true) {
      const keys = Array.isArray(currentInclude) ? currentInclude : Object.keys(currentInclude);
      if (!keys.includes(inventoryСhain[level])) {
        store[signature] = false;
        return store[signature];
      }
      if (level + 1 < inventoryСhain.length) {
        currentInclude = currentInclude[inventoryСhain[level]];
      }
    }

    if (currentExclude && currentExclude !== true) {
      const keys = Array.isArray(currentExclude) ? currentExclude : Object.keys(currentExclude);
      if (keys.includes(inventoryСhain[level])) {
        currentExclude = Array.isArray(currentExclude)
          ? true
          : currentExclude[inventoryСhain[level]];
        if (currentExclude === true) {
          store[signature] = false;
          return store[signature];
        }
      } else {
        store[signature] = true;
        return store[signature];
      }
    }

    level += 1;
  }
  store[signature] = true;
  return store[signature];
};

export default checkInventory;
