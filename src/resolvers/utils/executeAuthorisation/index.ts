import type {
  FilterArg,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  ThreeSegmentInventoryChain,
  InvolvedFilter,
  GraphqlObject,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import getPersonalFilter from './getPersonalFilter';
import injectStaticOrPersonalFilter from './injectStaticOrPersonalFilter';

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
  args: GraphqlObject,
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
    personalFilters = {},
    staticFilters = {},
    staticLimits = {},
  } = serversideConfig;

  const { token } = args as unknown as { token: string };

  const involvedEntityNamesKeys = Object.keys(involvedEntityNames);

  // *** compose personalFilterObj

  const personalCalculatedFilters = {};

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    if (personalFilters[entityName]) {
      personalCalculatedFilters[entityName] = await getPersonalFilter(
        personalFilters[entityName],
        context,
        generalConfig,
        serversideConfig,
        token,
      );
    }
  }

  // ***

  if (!inventoryByRoles && !filters) {
    const involvedFilters = involvedEntityNamesKeys.reduce((prev, involvedEntityNamesKey) => {
      const amendedInventoryChain = amendInventoryChain(inventoryChain, involvedEntityNamesKey);

      const entityName = involvedEntityNames[involvedEntityNamesKey];

      const personalFilter = personalCalculatedFilters[entityName];

      if (personalFilter === null) {
        prev[involvedEntityNamesKey] = null;

        return prev;
      }

      const staticFilter = staticFilters[entityName];

      const staticLimit = staticLimits[entityName];

      const filter = checkInventory(amendedInventoryChain as InventoryСhain, inventory)
        ? staticFilter
          ? [staticFilter]
          : []
        : null;

      if (!filter) {
        prev[involvedEntityNamesKey] = null;

        return prev;
      }

      prev[involvedEntityNamesKey] = personalFilter
        ? [injectStaticOrPersonalFilter(personalFilter, filter)]
        : [filter];

      if (staticLimit && prev[involvedEntityNamesKey]) {
        prev[involvedEntityNamesKey].push(staticLimit);
      }

      return prev;
    }, {});

    return involvedFilters; // return
  }

  if (!getUserAttributes) {
    throw new TypeError('Not found "getUserAttributes" callback!');
  }

  const userAttributes = await getUserAttributes(context, token);

  const { roles, ...userAttributesRest } = userAttributes;

  const result: Record<string, InvolvedFilter[] | null> = {};

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const amendedInventoryChain = amendInventoryChain(inventoryChain, involvedEntityNamesKey);

    result[involvedEntityNamesKey] = null;

    if (!checkInventory(amendedInventoryChain as InventoryСhain, inventory)) continue;

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
        if (filter.length === 0) {
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
    const entityName = involvedEntityNames[key];

    const personalFilter = personalCalculatedFilters[entityName];

    if (personalFilter === null) {
      prev[key] = null;

      return prev;
    }

    const staticFilter = staticFilters[entityName];
    const staticLimit = staticLimits[entityName];

    if (!result[key]) {
      prev[key] = null;

      return prev;
    }

    const filter = staticFilter
      ? injectStaticOrPersonalFilter(staticFilter, result[key])
      : result[key];

    prev[key] = personalFilter ? [injectStaticOrPersonalFilter(personalFilter, filter)] : [filter];

    if (staticLimit && prev[key]) {
      prev[key].push(staticLimit);
    }

    return prev;
  }, {});

  return involvedFilters; // return
};

export default executeAuthorisation;
