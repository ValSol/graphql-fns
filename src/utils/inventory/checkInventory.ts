import type { Inventory, InventoryChain } from '@/tsTypes';

const store = Object.create(null);

const checkInventory = (
  inventoryChain: InventoryChain,
  inventory: Inventory = { name: 'undefined' },
): boolean => {
  const { include, exclude, name } = inventory;

  const signature = `${JSON.stringify(inventoryChain)} ${name}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[signature]) return store[signature];

  let level = 0;
  let currentInclude: any = include;
  let currentExclude: any = exclude;
  while (level < inventoryChain.length) {
    if (currentInclude && currentInclude !== true) {
      const keys = Array.isArray(currentInclude) ? currentInclude : Object.keys(currentInclude);
      if (!keys.includes(inventoryChain[level])) {
        store[signature] = false;
        return store[signature];
      }
      if (level + 1 < inventoryChain.length) {
        currentInclude = currentInclude[inventoryChain[level]];
      }
    }

    if (currentExclude && currentExclude !== true) {
      const keys = Array.isArray(currentExclude) ? currentExclude : Object.keys(currentExclude);
      if (keys.includes(inventoryChain[level])) {
        currentExclude = Array.isArray(currentExclude)
          ? true
          : currentExclude[inventoryChain[level]];
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
