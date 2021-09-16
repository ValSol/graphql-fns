// @flow

import lodashMerge from 'lodash.merge';

import moveThingsToArray from './moveThingsToArray';
import moveThingsToObject from './moveThingsToObject';

import type { InventoryByPermissions } from '../../flowTypes';

const mergeInventories = (
  inventoryByPermissions: Object, // InventoryByPermissions,
  additionalInventoryByPermissions: Object, // InventoryByPermissions,
): InventoryByPermissions =>
  moveThingsToArray(
    lodashMerge(
      moveThingsToObject(inventoryByPermissions),
      moveThingsToObject(additionalInventoryByPermissions),
    ),
  );

export default mergeInventories;
