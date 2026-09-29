import type { GeneralConfig } from '@/tsTypes';

import unwindInverntoryOptions from './unwindInverntoryOptions';

const inventoryKeys = ['name', 'include', 'exclude'];

// a mistake in "inventory" would silently remove actions from the schema, so it is rejected explicitly
const checkGeneralInventory = (generalConfig: GeneralConfig) => {
  const { inventory } = generalConfig;

  if (!inventory) return;

  const { name, include, exclude } = inventory;

  Object.keys(inventory).forEach((key) => {
    if (!inventoryKeys.includes(key)) {
      throw new TypeError(
        `Incorrect key: "${key}" of inventory "${name}": expected "name", "include" or "exclude"!`,
      );
    }
  });

  if (include !== undefined && include !== true) {
    unwindInverntoryOptions(include, generalConfig, name, 'include');
  }

  if (exclude !== undefined && exclude !== true) {
    unwindInverntoryOptions(exclude, generalConfig, name, 'exclude');
  }
};

export default checkGeneralInventory;
