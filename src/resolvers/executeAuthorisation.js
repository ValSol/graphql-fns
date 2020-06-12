// @flow
import type { ServersideConfig, ThreeSegmentInventoryChain } from '../flowTypes';

import checkInventory from '../utils/checkInventory';

const errMsg = (attr) =>
  `"authData" & "getCredentials" must be mutually setted, but "${attr}" is undefined!`;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
) => {
  const { authData, getCredentials } = serversideConfig;
  if (!authData && !getCredentials) return true;

  if (!authData) {
    throw new TypeError(errMsg('authData'));
  }
  if (!getCredentials) {
    throw new TypeError(errMsg('getCredentials'));
  }
  if (!authData['']) {
    throw new TypeError(errMsg('Check for no roles have to be!'));
  }

  if (checkInventory(inventoryChain, authData[''])) return true;

  const { roles } = await getCredentials(context);

  return roles.some((role) => checkInventory(inventoryChain, authData[role]));
};

export default executeAuthorisation;
