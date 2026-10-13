import lodashMerge from 'lodash.merge';

import moveEntitiesToArray from './moveEntitiesToArray';
import moveEntitiesToObject from './moveEntitiesToObject';

import type { InventoryByRoles } from '../../tsTypes';

const mergeInventories = (
  // InventoryByRoles,
  inventoryByRoles: any,
  // InventoryByRoles,
  additionalInventoryByRoles: any,
): InventoryByRoles =>
  moveEntitiesToArray(
    lodashMerge(
      moveEntitiesToObject(inventoryByRoles),
      moveEntitiesToObject(additionalInventoryByRoles),
    ),
  );

export default mergeInventories;
