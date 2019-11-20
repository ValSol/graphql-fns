import type { AuthData, InventoryСhain } from '../flowTypes';

import checkInventory from './checkInventory';

const authorize = (
  inventoryChain: InventoryСhain,
  fields: Array<string>,
  roles: Array<string>,
  authData: AuthData,
): Array<string> => {
  if (!roles.length) {
    throw new TypeError('For auth must be at least one role!');
  }
  const [boo, foo, thingName] = inventoryChain; // eslint-disable-line no-unused-vars
  const result = [];
  for (let i = 0; i < roles.length; i += 1) {
    const role = roles[i];
    const { request, response } = authData[role];
    const allowRequest = request ? checkInventory(inventoryChain, request) : true;
    if (!allowRequest) continue; // eslint-disable-line no-continue
    if (!response) {
      return fields;
    }

    const { exclude, include } = response[thingName];
    fields.reduce((prev, field) => {
      // include & exclude are mutual exclusive!
      if (include && include.includes(field) && !result.includes(field)) {
        prev.push(field);
      }
      if (exclude && !exclude.includes(field) && !result.includes(field)) {
        prev.push(field);
      }
      return prev;
    }, result);
  }
  return result;
};

export default authorize;
