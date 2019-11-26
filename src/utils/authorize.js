import type { AuthData, ThreeSegmentInventoryChain } from '../flowTypes';

import checkInventory from './checkInventory';

const authorize = async (
  inventoryChain: ThreeSegmentInventoryChain,
  fields: Array<string>,
  credentials: { id: string, roles: Array<string> },
  requestArgs: { parent: Object, args: Object, context: Object },
  authData: AuthData,
): Promise<Boolean> => {
  const { roles, id } = credentials;
  if (!roles || !roles.length) {
    throw new TypeError('For auth must be at least one role!');
  }

  const [boo, foo, thingName] = inventoryChain; // eslint-disable-line no-unused-vars
  const result = [];
  const promises = [];
  for (let i = 0; i < roles.length; i += 1) {
    const role = roles[i];
    const { applyCallback, callback, request, response } = authData[role];
    const allowRequest = request ? checkInventory(inventoryChain, request) : true;
    if (!allowRequest) {
      if (applyCallback && checkInventory(inventoryChain, applyCallback)) {
        promises.push(callback(inventoryChain, fields, id, requestArgs));
      }

      continue; // eslint-disable-line no-continue
    }

    if (!response && applyCallback) {
      return true;
    }

    if (!applyCallback) {
      if (response) {
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
        // if only field and it's _id implied _id key is allowed
        if (fields.includes('_id' && !result.includes('_id'))) {
          result.push('_id');
        }
      } else {
        fields.reduce((prev, field) => {
          if (!result.includes(field)) result.push(field);
          return prev;
        }, result);
      }
    }
  }

  const results = await Promise.all(promises);

  results.forEach(allowedFields => {
    fields.reduce((prev, field) => {
      if (allowedFields.includes(field) && !result.includes(field)) {
        prev.push(field);
      }
      return prev;
    }, result);
  });

  return (
    result.every(field => fields.includes(field)) && fields.every(field => result.includes(field))
  );
};

export default authorize;
