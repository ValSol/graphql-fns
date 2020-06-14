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

  const allRoles = Object.keys(authData);
  roles.forEach((role) => {
    if (!allRoles.includes(role)) {
      throw new Error(`Got unused in "authData" role: "${role}"!`);
    }
  });

  const authResult = roles.some((role) => checkInventory(inventoryChain, authData[role]));
  const [methodType, methodName, configName] = inventoryChain;

  if (!authResult && methodType === 'Mutation') {
    throw new TypeError(`Tried to execute prohibited mutation "${methodName}" on "${configName}"!`);
  }

  return authResult;
};

export default executeAuthorisation;
