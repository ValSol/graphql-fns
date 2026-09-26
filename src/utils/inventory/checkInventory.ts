import type { Inventory, InventoryChain } from '@/tsTypes';

type InventoryLevel = undefined | true | string[] | { [key: string]: InventoryLevel };

const defaultInventory: Inventory = { name: 'undefined' };

// cache results separately for every inventory object (not by "name" to prevent collisions)
const store = new WeakMap<Inventory, Map<string, boolean>>();

// return how deep "inventoryChain" is matched by "inventoryLevel":
// "true" - chain is fully covered (on some level got "true" or array that contains chain item)
// "false" - some chain item is absent
// "partial" - all chain items are present but inventory goes deeper than chain
const matchChain = (
  inventoryChain: InventoryChain,
  inventoryLevel: InventoryLevel,
): true | false | 'partial' => {
  let current = inventoryLevel;

  for (let level = 0; level < inventoryChain.length; level += 1) {
    if (current === true) return true;

    if (!current) return false;

    const item = inventoryChain[level];

    if (Array.isArray(current)) return current.includes(item);

    if (!Object.keys(current).includes(item)) return false;

    current = current[item];
  }

  return current === true ? true : 'partial';
};

const checkInventory = (
  inventoryChain: InventoryChain,
  inventory: Inventory = defaultInventory,
): boolean => {
  const { include, exclude } = inventory;

  const signature = JSON.stringify(inventoryChain);

  let inventoryStore = store.get(inventory);

  if (!inventoryStore) {
    inventoryStore = new Map();
    store.set(inventory, inventoryStore);
  }

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && inventoryStore.has(signature)) {
    return inventoryStore.get(signature) as boolean;
  }

  // "include" restricts on every level: chain have to be (at least partially) included
  const included =
    include === undefined || matchChain(inventoryChain, include as InventoryLevel) !== false;

  // "exclude" forbids only fully covered chains
  const excluded =
    exclude !== undefined && matchChain(inventoryChain, exclude as InventoryLevel) === true;

  const result = included && !excluded;

  inventoryStore.set(signature, result);

  return result;
};

export default checkInventory;
