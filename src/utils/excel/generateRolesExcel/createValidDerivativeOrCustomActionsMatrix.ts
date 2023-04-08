import type { Inventory, ThreeSegmentInventoryChain } from '../../../tsTypes';

import checkInventory from '../../inventory/checkInventory';

type Arg = {
  actionNames: Array<string>;
  actionTypes: {
    [actionName: string]: string; // 'CustomQuery' | 'CustomMutation' | 'DerivativeQuery' | 'DerivativeMutation',
  };
  inventory?: Inventory;
  inventory2?: Inventory;
  thingNames: Array<string>;
  thingNamesByActions: {
    [actionName: string]: Array<string>;
  };
};

type Result = Array<Array<null | [number, number]>>;

const createValidDerivativeOrCustomActionsMatrix = (arg: Arg): Result => {
  const { actionNames, actionTypes, inventory, inventory2, thingNames, thingNamesByActions } = arg;

  const result: Array<Array<null | [number, number]>> = [];

  for (let i = 0; i < thingNames.length; i += 1) {
    result.push([]);
    const entityName = thingNames[i];
    for (let j = 0; j < actionNames.length; j += 1) {
      const actionName = actionNames[j];
      const actionType = actionTypes[actionName].startsWith('Custom')
        ? (actionTypes[actionName].slice(6) as 'Query' | 'Mutation')
        : (actionTypes[actionName].slice(10) as 'Query' | 'Mutation');
      const inventoryСhain: ThreeSegmentInventoryChain = [actionType, actionName, entityName];

      if (
        checkInventory(inventoryСhain, inventory) &&
        checkInventory(inventoryСhain, inventory2) &&
        thingNamesByActions[actionName].includes(entityName)
      ) {
        result[i][j] = [i, j];
      } else {
        result[i][j] = null;
      }
    }
  }

  return result;
};

export default createValidDerivativeOrCustomActionsMatrix;
