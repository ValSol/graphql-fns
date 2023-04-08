import lodashMerge from 'lodash.merge';

import moveThingsToArray from './moveThingsToArray';
import moveThingsToObject from './moveThingsToObject';

import type { InventoryByRoles } from '../../tsTypes';

const mergeInventories = (
  // InventoryByRoles,
  inventoryByRoles: any,
  // InventoryByRoles,
  additionalInventoryByRoles: any,
): InventoryByRoles =>
  moveThingsToArray(
    lodashMerge(
      moveThingsToObject(inventoryByRoles),
      moveThingsToObject(additionalInventoryByRoles),
    ),
  );

export default mergeInventories;
