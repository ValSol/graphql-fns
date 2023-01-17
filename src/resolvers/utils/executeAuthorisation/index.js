// @flow

import type {
  GeneralConfig,
  ServersideConfig,
  ThreeSegmentInventoryChain,
} from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import injectStaticFilter from './injectStaticFilter';

const amendInventoryChain = (inventoryChain, key) => {
  const [, , entityName] = inventoryChain;

  switch (key) {
    case 'subscribeCreatedEntity':
      return ['Subscription', 'createdEntity', entityName];

    case 'subscribeDeletedEntity':
      return ['Subscription', 'deletedEntity', entityName];

    case 'subscribeUpdatedEntity':
      return ['Subscription', 'updatedEntity', entityName];

    default:
      return inventoryChain;
  }
};

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  involvedEntityNames: { [key: string]: string },
  context: Object,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Promise<{ [key: string]: null | Array<Object> }> => {
  const { inventory } = generalConfig;
  const {
    containedRoles,
    filters,
    getUserAttributes,
    inventoryByRoles,
    staticFilters = {},
  } = serversideConfig;

  const involvedEntityNamesKeys = Object.keys(involvedEntityNames);

  if (!inventoryByRoles && !filters) {
    return involvedEntityNamesKeys.reduce((prev, involvedEntityNamesKey) => {
      const amendedInventoryChain = amendInventoryChain(inventoryChain, involvedEntityNamesKey);

      // eslint-disable-next-line no-param-reassign
      prev[involvedEntityNamesKey] = checkInventory(amendedInventoryChain, inventory)
        ? [staticFilters[involvedEntityNames[involvedEntityNamesKey]]] || []
        : null;

      return prev;
    }, {});
  }

  if (!getUserAttributes) {
    throw new TypeError('Not found "getUserAttributes" callback!');
  }

  const userAttributes = await getUserAttributes(context);

  const { roles } = userAttributes;

  const result = {};

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const amendedInventoryChain = amendInventoryChain(inventoryChain, involvedEntityNamesKey);

    result[involvedEntityNamesKey] = null;

    if (inventoryByRoles) {
      if (!containedRoles) {
        throw new TypeError(
          'Not found "containedRoles" dictionary, to use it with "inventoryByRoles"!',
        );
      }

      const allRoles = roles.reduce((prev, role) => {
        [...containedRoles[role], role].forEach((role2) => {
          if (!prev.includes(role2)) {
            prev.push(role2);
          }
        });

        return prev;
      }, []);

      for (let j = 0; j < allRoles.length; j += 1) {
        const inventoryByRole = inventoryByRoles[allRoles[j]];

        if (checkInventory(amendedInventoryChain, inventoryByRole)) {
          result[involvedEntityNamesKey] = [];
          break;
        }
      }
    }

    if (!filters || !result[involvedEntityNamesKey]) continue; // eslint-disable-line no-continue

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    for (let j = 0; j < roles.length; j += 1) {
      const role = roles[j];

      const filter = filters[entityName][1]({ ...userAttributes, role });

      if (filter) {
        if (!filter.length) {
          result[involvedEntityNamesKey] = [];
          break;
        }

        result[involvedEntityNamesKey].push(...filter);
      } else {
        result[involvedEntityNamesKey] = null;
      }
    }
  }

  return Object.keys(result).reduce((prev, key) => {
    // eslint-disable-next-line no-param-reassign
    prev[key] =
      staticFilters[involvedEntityNames[key]] && result[key]
        ? injectStaticFilter(staticFilters[involvedEntityNames[key]], result[key])
        : result[key];

    return prev;
  }, {});
};

export default executeAuthorisation;
