// @flow

import type { ServersideConfig, ThreeSegmentInventoryChain } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';

const composeEmptyFilters = (involvedEntityNames) =>
  Object.keys(involvedEntityNames).reduce((prev, key) => {
    prev[key] = []; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

const composeNullFilters = (involvedEntityNames) =>
  Object.keys(involvedEntityNames).reduce((prev, key) => {
    prev[key] = null; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  involvedEntityNames: { [key: string]: string },
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<{ [key: string]: null | Array<Object> }> => {
  const { containedRoles, filters, getUserAttributes, inventoryByRoles } = serversideConfig;

  if (!inventoryByRoles && !filters) {
    return composeEmptyFilters(involvedEntityNames);
  }

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

    for (let j = 0; j < allRoles.length; j += 1) {
      const inventory = inventoryByRoles[allRoles[j]];

      if (checkInventory(inventoryChain, inventory)) {
        notAuthorised = false;
        break;
      }
    }

    if (notAuthorised) {
      return composeNullFilters(involvedEntityNames);
    }
  }

  if (!filters) {
    return composeEmptyFilters(involvedEntityNames);
  }

  const result = {};

  const involvedEntityNamesKeys = Object.keys(involvedEntityNames);

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    for (let j = 0; j < roles.length; j += 1) {
      const role = roles[j];

      const filter = filters[entityName]({ ...userAttributes, role });

      if (filter) {
        if (!filter.length) {
          result[involvedEntityNamesKey] = [];
          break;
        }

        if (!result[involvedEntityNamesKey]) {
          result[involvedEntityNamesKey] = [];
        }

        result[involvedEntityNamesKey].push(...filter);
      } else {
        result[involvedEntityNamesKey] = null;
      }
    }
  }

  return result;
};

export default executeAuthorisation;
