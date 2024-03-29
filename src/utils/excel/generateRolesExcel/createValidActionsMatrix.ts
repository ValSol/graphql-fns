import type { Inventory, ThreeSegmentInventoryChain } from '../../../tsTypes';

import checkInventory from '../../inventory/checkInventory';

type Arg = {
  actionNames: Array<string>;
  actionTypes: {
    [actionName: string]: 'Query' | 'Mutation' | 'Subscription';
  };
  inventory?: Inventory;
  inventory2?: Inventory;
  thingNames: Array<string>;
};

type Result = Array<Array<null | [number, number]>>;

const extractDataFromDescendant = (arg: Arg): Result => {
  const { actionNames, actionTypes, inventory, inventory2, thingNames } = arg;

  const result: Array<Array<null | [number, number]>> = [];

  for (let i = 0; i < thingNames.length; i += 1) {
    result.push([]);
    const entityName = thingNames[i];
    for (let j = 0; j < actionNames.length; j += 1) {
      const actionName = actionNames[j];
      const actionType = actionTypes[actionName] as 'Query' | 'Mutation';
      const inventoryСhain: ThreeSegmentInventoryChain = [actionType, actionName, entityName];

      if (checkInventory(inventoryСhain, inventory) && checkInventory(inventoryСhain, inventory2)) {
        result[i][j] = [i, j];
      } else {
        result[i][j] = null;
      }
    }
  }

  return result;
};

export default extractDataFromDescendant;
