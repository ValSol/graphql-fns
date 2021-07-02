// @flow

import type { ServersideConfig, ThreeSegmentInventoryChain } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';

const errMsg = (attr) =>
  `"inventoryByRights" & "getActionFilter" must be mutually setted, but "${attr}" is undefined!`;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<null | Array<Object>> => {
  const { inventoryByRights, getActionFilter } = serversideConfig;
  if (!inventoryByRights && !getActionFilter) return [];

  if (!inventoryByRights) {
    throw new TypeError(errMsg('inventoryByRights'));
  }
  if (!getActionFilter) {
    throw new TypeError(errMsg('getActionFilter'));
  }
  if (!inventoryByRights['']) {
    throw new TypeError(errMsg('Check for no rights have to be!'));
  }

  if (checkInventory(inventoryChain, inventoryByRights[''])) return [];

  const [, , thingName] = inventoryChain;

  const filterObject = await getActionFilter(thingName, context);

  const allRights = Object.keys(inventoryByRights);
  const rights = Object.keys(filterObject);

  if (!rights.length) return null;

  rights.forEach((right) => {
    if (!allRights.includes(right)) {
      throw new Error(`Got unused in "inventoryByRights" right: "${right}"!`);
    }
  });

  let authResult = null;

  for (let i = 0; i < rights.length; i += 1) {
    const right = rights[i];

    if (checkInventory(inventoryChain, inventoryByRights[right])) {
      if (!filterObject[right].length) {
        return [];
      }

      if (!authResult) authResult = [];

      authResult.push(...filterObject[right]);
    }
  }

  const [methodType, methodName, configName] = inventoryChain;

  if (!authResult && methodType === 'Mutation') {
    throw new TypeError(`Tried to execute prohibited mutation "${methodName}" on "${configName}"!`);
  }

  return authResult;
};

export default executeAuthorisation;
