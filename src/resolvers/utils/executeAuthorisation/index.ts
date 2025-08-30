import type {
  ActionInvolvedEntityNames,
  GeneralConfig,
  InventoryChain,
  ServersideConfig,
  ThreeSegmentInventoryChain,
  InvolvedFilter,
  GraphqlObject,
} from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import parseEntityName from '@/utils/parseEntityName';
import composePersonalFilter from './composePersonalFilter';
import composeUserFilter from './composeUserFilter';
import injectStaticOrPersonalFilter from './injectStaticOrPersonalFilter';
import composeDescendantConfigName from '@/utils/composeDescendantConfig/composeDescendantConfigName';

const composeInvolvedFilterName = (key: keyof ActionInvolvedEntityNames) =>
  `${key.slice(0, -'Entity'.length)}FilterAndLimit`;

type SubscribeInvolvedKey =
  | 'subscribeCreatedEntity'
  | 'subscribeDeletedEntity'
  | 'subscribeUpdatedEntity';

const composeSubscribeInventoryChains = (
  key: SubscribeInvolvedKey,
  entityName: string,
  generalConfig: GeneralConfig,
) => {
  const { descendant = {} } = generalConfig;
  const descendantKeys = ['', ...Object.keys(descendant)];

  const { root, descendantKey } = parseEntityName(entityName, generalConfig);

  const {
    allEntityConfigs: {
      [root]: { descendantNameSlicePosition },
    },
  } = generalConfig;

  switch (key) {
    case 'subscribeCreatedEntity':
      return descendantKeys.map((descendantKey) => [
        'Subscription',
        `createdEntity${descendantKey}`,
        root,
      ]);

    case 'subscribeDeletedEntity':
      return descendantKeys.map((descendantKey) => [
        'Subscription',
        `deletedEntity${descendantKey}`,
        root,
      ]);

    case 'subscribeUpdatedEntity':
      return descendantKeys.map((descendantKey) => [
        'Subscription',
        `updatedEntity${descendantKey}`,
        root,
      ]);

    default:
      throw TypeError(`Got incorrect involvedEntityNamesKey: "${key}"!`);
  }
};

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  involvedEntityNames: ActionInvolvedEntityNames,
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

  const { token: tokenFromArgs } = args as { token: string };

  const involvedEntityNamesKeys = Object.keys(
    involvedEntityNames,
  ) as (keyof ActionInvolvedEntityNames)[];

  const userAttributes = getUserAttributes ? await getUserAttributes(context, tokenFromArgs) : null;

  // *** compose personalFilterObj

  const personalCalculatedFilters = {};

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    if (personalFilters[entityName] && !personalCalculatedFilters[entityName]) {
      personalCalculatedFilters[entityName] = await composePersonalFilter(
        entityName,
        userAttributes,
        context,
        generalConfig,
        serversideConfig,
      );
    }
  }

  // ***

  if (!inventoryByRoles && !filters) {
    const involvedFilters = involvedEntityNamesKeys.reduce((prev, involvedEntityNamesKey) => {
      const amendedInventoryChains = involvedEntityNamesKey.startsWith('subscribe')
        ? composeSubscribeInventoryChains(
            involvedEntityNamesKey as SubscribeInvolvedKey,
            involvedEntityNames[involvedEntityNamesKey],
            generalConfig,
          )
        : [inventoryChain];

      const entityName = involvedEntityNames[involvedEntityNamesKey];

      const involvedFilterName = composeInvolvedFilterName(involvedEntityNamesKey);

      const personalFilter = personalCalculatedFilters[entityName];

      if (personalFilter === null) {
        prev[involvedFilterName] = null;

        return prev;
      }

      const staticFilter = staticFilters[entityName];

      const staticLimit = staticLimits[entityName];

      const filter = amendedInventoryChains.some((amendedInventoryChain) =>
        checkInventory(amendedInventoryChain as InventoryChain, inventory),
      )
        ? staticFilter
          ? [staticFilter]
          : []
        : null;

      if (!filter) {
        prev[involvedFilterName] = null;

        return prev;
      }

      prev[involvedFilterName] = personalFilter
        ? [injectStaticOrPersonalFilter(personalFilter, filter)]
        : [filter];

      if (staticLimit && prev[involvedFilterName]) {
        prev[involvedFilterName].push(staticLimit);
      }

      return prev;
    }, {});

    return involvedFilters; // return
  }

  if (!userAttributes) {
    throw new TypeError(
      `Not found ${getUserAttributes ? '"getUserAttributes" callback' : '"userAttributes"'}!`,
    );
  }

  const { roles, ...userAttributesRest } = userAttributes;

  const result: Record<string, InvolvedFilter[] | null> = {};

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const amendedInventoryChains = involvedEntityNamesKey.startsWith('subscribe')
      ? composeSubscribeInventoryChains(
          involvedEntityNamesKey as SubscribeInvolvedKey,
          involvedEntityNames[involvedEntityNamesKey],
          generalConfig,
        )
      : [inventoryChain];

    result[involvedEntityNamesKey] = null;

    if (
      !amendedInventoryChains.some((amendedInventoryChain) =>
        checkInventory(amendedInventoryChain as InventoryChain, inventory),
      )
    )
      continue;

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

        if (
          amendedInventoryChains.some((amendedInventoryChain) =>
            checkInventory(amendedInventoryChain as InventoryChain, inventoryByRole),
          )
        ) {
          result[involvedEntityNamesKey] = [];
          break;
        }
      }
    }

    if (!filters || !result[involvedEntityNamesKey]) continue;

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    result[involvedEntityNamesKey] = composeUserFilter(entityName, userAttributes, filters);
  }

  const involvedFilters = Object.keys(result).reduce((prev, key) => {
    const entityName = involvedEntityNames[key];

    const involvedFilterName = composeInvolvedFilterName(key as keyof ActionInvolvedEntityNames);

    const personalFilter = personalCalculatedFilters[entityName];

    if (personalFilter === null) {
      prev[involvedFilterName] = null;

      return prev;
    }

    const staticFilter = staticFilters[entityName];
    const staticLimit = staticLimits[entityName];

    if (!result[key]) {
      prev[involvedFilterName] = null;

      return prev;
    }

    const filter = staticFilter
      ? injectStaticOrPersonalFilter(staticFilter, result[key])
      : result[key];

    prev[involvedFilterName] = personalFilter
      ? [injectStaticOrPersonalFilter(personalFilter, filter)]
      : [filter];

    if (staticLimit && prev[involvedFilterName]) {
      prev[involvedFilterName].push(staticLimit);
    }

    return prev;
  }, {});

  return involvedFilters; // return
};

export default executeAuthorisation;
