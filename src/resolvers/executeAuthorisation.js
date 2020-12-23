// @flow

import type { ServersideConfig, ThreeSegmentInventoryChain } from '../flowTypes';

import checkInventory from '../utils/checkInventory';

const errMsg = (attr) =>
  `"inventoryByRoles" & "getCredentials" must be mutually setted, but "${attr}" is undefined!`;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<null | Array<Object>> => {
  const { inventoryByRoles, getCredentials } = serversideConfig;
  if (!inventoryByRoles && !getCredentials) return [];

  if (!inventoryByRoles) {
    throw new TypeError(errMsg('inventoryByRoles'));
  }
  if (!getCredentials) {
    throw new TypeError(errMsg('getCredentials'));
  }
  if (!inventoryByRoles['']) {
    throw new TypeError(errMsg('Check for no roles have to be!'));
  }

  if (checkInventory(inventoryChain, inventoryByRoles[''])) return [];

  const { roles } = await getCredentials(context);

  const allRoles = Object.keys(inventoryByRoles);
  roles.forEach((compositeRole) => {
    const [role] = compositeRole.split(':');
    if (!allRoles.includes(role)) {
      throw new Error(`Got unused in "inventoryByRoles" role: "${role}"!`);
    }
  });

  let authResult = null;
  roles.forEach((compositeRole) => {
    const [role, thingName, ...stringifiedFilter] = compositeRole.split(':');

    if (
      checkInventory(inventoryChain, inventoryByRoles[role]) &&
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
