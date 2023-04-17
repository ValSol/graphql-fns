import type {
  FilterArg,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  ThreeSegmentInventoryChain,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import injectStaticFilter from './injectStaticFilter';

const amendInventoryChain = (inventoryChain: ThreeSegmentInventoryChain, key: string) => {
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
  involvedEntityNames: {
    [key: string]: string;
  },
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Promise<{
  [key: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
}> => {
  const { inventory } = generalConfig;
  const {
    containedRoles,
    filters,
    getUserAttributes,
    inventoryByRoles,
    staticFilters = {},
    staticLimits = {},
  } = serversideConfig;

  const involvedEntityNamesKeys = Object.keys(involvedEntityNames);

  if (!inventoryByRoles && !filters) {
    const involvedFilters = involvedEntityNamesKeys.reduce((prev, involvedEntityNamesKey) => {
      const amendedInventoryChain = amendInventoryChain(inventoryChain, involvedEntityNamesKey);

      const staticFilter = staticFilters[involvedEntityNames[involvedEntityNamesKey]];
      const staticLimit = staticLimits[involvedEntityNames[involvedEntityNamesKey]];

      // eslint-disable-next-line no-param-reassign
      prev[involvedEntityNamesKey] = checkInventory(
        amendedInventoryChain as InventoryСhain,
        inventory,
      )
        ? staticFilter
          ? [[staticFilter]]
          : [[]]
        : null;

      if (staticLimit && prev[involvedEntityNamesKey]) {
        prev[involvedEntityNamesKey].push(staticLimit);
      }

      return prev;
    }, {});

    return involvedFilters;
  }

  if (!getUserAttributes) {
    throw new TypeError('Not found "getUserAttributes" callback!');
  }

  const userAttributes = await getUserAttributes(context);

  const { roles, ...userAttributesRest } = userAttributes;

  const result: Record<string, InvolvedFilter[]> = {};

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

      const allRoles = roles.reduce<Array<string>>((prev, role) => {
        [...containedRoles[role], role].forEach((role2) => {
          if (!prev.includes(role2)) {
            prev.push(role2);
          }
        });

        return prev;
      }, []);

      for (let j = 0; j < allRoles.length; j += 1) {
        const inventoryByRole = inventoryByRoles[allRoles[j]];

        if (checkInventory(amendedInventoryChain as InventoryСhain, inventoryByRole)) {
          result[involvedEntityNamesKey] = [];
          break;
        }
      }
    }

    if (!filters || !result[involvedEntityNamesKey]) continue; // eslint-disable-line no-continue

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    for (let j = 0; j < roles.length; j += 1) {
      const role = roles[j];

      const arg = { ...userAttributesRest, role } as FilterArg;

      const filter = filters[entityName][1](arg);

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

  const involvedFilters = Object.keys(result).reduce((prev, key) => {
    const staticFilter = staticFilters[involvedEntityNames[key]];
    const staticLimit = staticLimits[involvedEntityNames[key]];

    // eslint-disable-next-line no-param-reassign
    prev[key] =
      staticFilter && result[key]
        ? [injectStaticFilter(staticFilter, result[key])]
        : result[key] && [result[key]];

    if (staticLimit && prev[key]) {
      prev[key].push(staticLimit);
    }

    return prev;
  }, {});

  return involvedFilters;
};

export default executeAuthorisation;
