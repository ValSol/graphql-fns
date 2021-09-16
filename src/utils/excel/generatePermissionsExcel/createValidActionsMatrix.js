// @flow

import type { Inventory, ThreeSegmentInventoryChain } from '../../../flowTypes';

import checkInventory from '../../inventory/checkInventory';

type Arg = {
  actionNames: Array<string>,
  actionTypes: { [actionName: string]: 'Query' | 'Mutation' | 'Subscription' },
  inventory?: Inventory,
  inventory2?: Inventory,
  thingNames: Array<string>,
};

type Result = Array<Array<null | [number, number]>>;

const extractDataFromDerivative = (arg: Arg): Result => {
  const { actionNames, actionTypes, inventory, inventory2, thingNames } = arg;

  const result = [];

  for (let i = 0; i < thingNames.length; i += 1) {
    result.push([]);
    const thingName = thingNames[i];
    for (let j = 0; j < actionNames.length; j += 1) {
      const actionName = actionNames[j];
      const actionType = actionTypes[actionName];
      // $FlowFixMe
      const inventoryСhain: ThreeSegmentInventoryChain = [actionType, actionName, thingName];

      if (checkInventory(inventoryСhain, inventory) && checkInventory(inventoryСhain, inventory2)) {
        result[i][j] = [i, j];
      } else {
        result[i][j] = null;
      }
    }
  }

  return result;
};

export default extractDataFromDerivative;
