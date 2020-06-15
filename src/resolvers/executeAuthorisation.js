// @flow
import type { ServersideConfig, ThreeSegmentInventoryChain } from '../flowTypes';

import checkInventory from '../utils/checkInventory';

const errMsg = (attr) =>
  `"inventoryByRoles" & "getCredentials" must be mutually setted, but "${attr}" is undefined!`;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
) => {
  const { inventoryByRoles, getCredentials } = serversideConfig;
  if (!inventoryByRoles && !getCredentials) return true;

  if (!inventoryByRoles) {
    throw new TypeError(errMsg('inventoryByRoles'));
  }
  if (!getCredentials) {
    throw new TypeError(errMsg('getCredentials'));
  }
  if (!inventoryByRoles['']) {
    throw new TypeError(errMsg('Check for no roles have to be!'));
  }

  if (checkInventory(inventoryChain, inventoryByRoles[''])) return true;

  const { roles } = await getCredentials(context);

  const allRoles = Object.keys(inventoryByRoles);
  roles.forEach((compositeRole) => {
    const [role] = compositeRole.split(':');
    if (!allRoles.includes(role)) {
      throw new Error(`Got unused in "inventoryByRoles" role: "${role}"!`);
    }
  });

  const authResult = roles.some((compositeRole) => {
    const [role, thinName] = compositeRole.split(':');

    return (
      checkInventory(inventoryChain, inventoryByRoles[role]) &&
      (!thinName || thinName === inventoryChain[2])
    );
  });
  const [methodType, methodName, configName] = inventoryChain;

  if (!authResult && methodType === 'Mutation') {
    throw new TypeError(`Tried to execute prohibited mutation "${methodName}" on "${configName}"!`);
  }

  return authResult;
};

export default executeAuthorisation;
