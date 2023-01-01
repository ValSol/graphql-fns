// @flow

import type { ServersideConfig, ThreeSegmentInventoryChain } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  context: Object,
  serversideConfig: ServersideConfig,
  derivativeEntityName?: string,
): Promise<null | Array<Object>> => {
  const { containedRoles, filters, getUserAttributes, inventoryByRoles } = serversideConfig;
  if (!inventoryByRoles && !filters) return [];

  if (!getUserAttributes) {
    throw new TypeError('Not found "getUserAttributes" callback!');
  }

  const userAttributes = await getUserAttributes(context);

  const { roles } = userAttributes;

  if (inventoryByRoles) {
    if (!containedRoles) {
      throw new TypeError(
        'Not found "containedRoles" dictionary, to use it with "inventoryByRoles"!',
      );
    }

    let notAuthorised = true;

    const allRoles = roles.reduce((prev, role) => {
      [...containedRoles[role], role].forEach((role2) => {
        if (!prev.includes(role2)) {
          prev.push(role2);
        }
      });

      return prev;
    }, []);

    for (let i = 0; i < allRoles.length; i += 1) {
      const inventory = inventoryByRoles[allRoles[i]];

      if (checkInventory(inventoryChain, inventory)) {
        notAuthorised = false;
        break;
      }
    }

    if (notAuthorised) {
      return null;
    }
  }

  if (!filters) {
    return [];
  }

  const entityName = derivativeEntityName || inventoryChain[2];

  let result = null;

  console.log('entityName =', entityName);

  for (let i = 0; i < roles.length; i += 1) {
    const role = roles[i];
    console.log(`roles[${i}] =`, roles[i]);

    const filter = filters[entityName]({ ...userAttributes, role });

    console.log('filter =', filter);

    if (filter) {
      if (!filter.length) {
        return [];
      }

      if (!result) {
        result = [];
      }

      result.push(...filter);
    }
  }

  return result;
};

export default executeAuthorisation;
