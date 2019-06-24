// @flow
import type { Inventory, InventoryСhain } from '../flowTypes';

const checkInventory = (inventoryСhain: InventoryСhain, inventory: Inventory = {}): boolean => {
  const { include, exclude } = inventory;

  let level = 0;
  let currentInclude: Object = include;
  let currentExclude: Object = exclude;
  while (level < inventoryСhain.length) {
    if (currentInclude) {
      const keys = Array.isArray(currentInclude) ? currentInclude : Object.keys(currentInclude);
      if (!keys.includes(inventoryСhain[level])) return false;
      if (level + 1 < inventoryСhain.length) {
        currentInclude = currentInclude[inventoryСhain[level]];
      }
    }

    if (currentExclude) {
      const keys = Array.isArray(currentExclude) ? currentExclude : Object.keys(currentExclude);
      if (keys.includes(inventoryСhain[level])) {
        currentExclude = Array.isArray(currentExclude)
          ? null
          : currentExclude[inventoryСhain[level]];
        if (currentExclude === null) return false;
      } else {
        currentExclude = null;
      }
    }

    level += 1;
  }
  return true;
};

export default checkInventory;
