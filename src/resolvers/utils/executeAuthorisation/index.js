// @flow

import type { ServersideConfig, ThreeSegmentInventoryChain } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';

const errMsg = (attr) =>
  `"inventoryByRights" & "getCredentials" must be mutually setted, but "${attr}" is undefined!`;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<null | Array<Object>> => {
  const { inventoryByRights, getCredentials } = serversideConfig;
  if (!inventoryByRights && !getCredentials) return [];

  if (!inventoryByRights) {
    throw new TypeError(errMsg('inventoryByRights'));
  }
  if (!getCredentials) {
    throw new TypeError(errMsg('getCredentials'));
  }
  if (!inventoryByRights['']) {
    throw new TypeError(errMsg('Check for no rights have to be!'));
  }

  if (checkInventory(inventoryChain, inventoryByRights[''])) return [];

  const { rights } = await getCredentials(context);

  const allRights = Object.keys(inventoryByRights);
  rights.forEach((compositeRight) => {
    const [right] = compositeRight.split(':');
    if (!allRights.includes(right)) {
      throw new Error(`Got unused in "inventoryByRights" right: "${right}"!`);
    }
  });

  let authResult = null;
  rights.forEach((compositeRight) => {
    const [right, thingName, ...stringifiedFilter] = compositeRight.split(':');

    if (
      checkInventory(inventoryChain, inventoryByRights[right]) &&
      (!thingName || thingName === inventoryChain[2])
    ) {
      if (!authResult) authResult = [];
      if (stringifiedFilter.length) {
        const filter = JSON.parse(stringifiedFilter.join(':'));
        authResult.push(filter);
      }
    }
  });

  const [methodType, methodName, configName] = inventoryChain;

  if (!authResult && methodType === 'Mutation') {
    throw new TypeError(`Tried to execute prohibited mutation "${methodName}" on "${configName}"!`);
  }

  return authResult;
};

export default executeAuthorisation;
