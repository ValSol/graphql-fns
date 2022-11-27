// @flow

import type { ServersideConfig, ThreeSegmentInventoryChain } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';

const errMsg = (attr) =>
  `"inventoryByPermissions" & "getActionFilter" must be mutually setted, but "${attr}" is undefined!`;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<null | Array<Object>> => {
  const { inventoryByPermissions, getActionFilter } = serversideConfig;
  if (!inventoryByPermissions && !getActionFilter) return [];

  if (!inventoryByPermissions) {
    throw new TypeError(errMsg('inventoryByPermissions'));
  }
  if (!getActionFilter) {
    throw new TypeError(errMsg('getActionFilter'));
  }
  if (!inventoryByPermissions['']) {
    throw new TypeError(errMsg('Check for no permissions have to be!'));
  }

  if (checkInventory(inventoryChain, inventoryByPermissions[''])) return [];

  const [, , entityName] = inventoryChain;

  const filterObject = await getActionFilter(entityName, context);

  const allPermissions = Object.keys(inventoryByPermissions);
  const permissions = Object.keys(filterObject);

  if (!permissions.length) return null;

  permissions.forEach((permission) => {
    if (!allPermissions.includes(permission)) {
      throw new Error(`Got unused in "inventoryByPermissions" permission: "${permission}"!`);
    }
  });

  let authResult = null;

  for (let i = 0; i < permissions.length; i += 1) {
    const permission = permissions[i];

    if (checkInventory(inventoryChain, inventoryByPermissions[permission])) {
      if (!filterObject[permission].length) {
        return [];
      }

      if (!authResult) authResult = [];

      if (filterObject[permission].length) {
        authResult.push(...filterObject[permission]);
      }
    }
  }

  const [methodType, methodName, configName] = inventoryChain;

  if (!authResult && methodType === 'Mutation') {
    throw new TypeError(`Tried to execute prohibited mutation "${methodName}" on "${configName}"!`);
  }

  return authResult;
};

export default executeAuthorisation;
