// @flow

import lodashMerge from 'lodash.merge';

import moveThingsToArray from './moveThingsToArray';
import moveThingsToObject from './moveThingsToObject';

import type { InventoryByRoles } from '../../flowTypes';

const mergeInventories = (
  inventoryByRoles: Object, // InventoryByRoles,
  additionalInventoryByRoles: Object, // InventoryByRoles,
): InventoryByRoles =>
  moveThingsToArray(
    lodashMerge(
      moveThingsToObject(inventoryByRoles),
      moveThingsToObject(additionalInventoryByRoles),
    ),
  );

export default mergeInventories;
