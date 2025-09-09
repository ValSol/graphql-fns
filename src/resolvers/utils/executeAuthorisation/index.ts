import type {
  ActionInvolvedEntityNames,
  GeneralConfig,
  InventoryChain,
  ServersideConfig,
  ThreeSegmentInventoryChain,
  InvolvedFilter,
  GraphqlObject,
  SubscriptionInvolvedEntityNames,
  EntityConfig,
  TangibleEntityConfig,
  EntityFilters,
  UserAttributes,
} from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import parseEntityName from '@/utils/parseEntityName';
import composePersonalFilter from './composePersonalFilter';
import composeUserFilter from './composeUserFilter';
import injectStaticOrPersonalFilter from './injectStaticOrPersonalFilter';
import mergeWhereAndFilter from '../mergeWhereAndFilter';
import composeSubscriptionDummyEntityConfig from '../composeSubscriptionDummyEntityConfig';
import composeSubscriptionUpdatedFields from './composeSubscriptionUpdatedFields';

const SUBSCRIPTION = 'subscription';

const composeInvolvedFilterName = (key: keyof ActionInvolvedEntityNames) =>
  key.startsWith(SUBSCRIPTION) ? `${key}Name` : `${key.slice(0, -'Entity'.length)}FilterAndLimit`;

type SubscriptionInvolvedKey =
  | 'subscriptionCreatedEntity'
  | 'subscriptionDeletedEntity'
  | 'subscriptionUpdatedEntity';

const composeSubscriptionInventoryChains = (
  key: SubscriptionInvolvedKey,
  entityName: string,
  generalConfig: GeneralConfig,
) => {
  const { descendant = {} } = generalConfig;
  const descendantKeys = ['', ...Object.keys(descendant)];

  const { root, descendantKey } = parseEntityName(entityName, generalConfig);

  if (descendantKey) {
    throw new TypeError(
      `Value for key: "${key}" has to be original name: "${root}" but got descendantKey name "${entityName}"!`,
    );
  }

  const {
    allEntityConfigs: {
      [root]: { descendantNameSlicePosition },
    },
  } = generalConfig;

  switch (key) {
    case 'subscriptionCreatedEntity':
      return descendantKeys.map((descendantKey) => [
        'Subscription',
        `createdEntity${descendantKey}`,
        root,
      ]);

    case 'subscriptionDeletedEntity':
      return descendantKeys.map((descendantKey) => [
        'Subscription',
        `deletedEntity${descendantKey}`,
        root,
      ]);

    case 'subscriptionUpdatedEntity':
      return descendantKeys.map((descendantKey) => [
        'Subscription',
        `updatedEntity${descendantKey}`,
        root,
      ]);

    default:
      throw TypeError(`Got incorrect involvedEntityNamesKey: "${key}"!`);
  }
};

export const composeSubscribePayloadMongoFilter = (
  subscribePayloadFilters: EntityFilters,
  involvedEntityNames: ActionInvolvedEntityNames,
  userAttributes: UserAttributes,
  entityConfig: EntityConfig,
) =>
  mergeWhereAndFilter(
    composeUserFilter(
      involvedEntityNames.inputOutputEntity || involvedEntityNames.outputEntity,
      userAttributes,
      subscribePayloadFilters,
    ),
    {},
    composeSubscriptionDummyEntityConfig(entityConfig),
  ).where;

const executeAuthorisation = async (
  inventoryChain: ThreeSegmentInventoryChain,
  involvedEntityNames: ActionInvolvedEntityNames,
  args: GraphqlObject,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Promise<{
  involvedFilters: { [key: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number] };
  subscriptionEntityNames?: Record<SubscriptionInvolvedEntityNames, string>;
  subscribePayloadMongoFilter?: Record<string, any>;
  subscriptionUpdatedFields?: string[];
}> => {
  const { allEntityConfigs, inventory } = generalConfig;
  const {
    containedRoles,
    filters,
    getUserAttributes,
    inventoryByRoles,
    personalFilters = {},
    staticFilters = {},
    staticLimits = {},
    subscribePayloadFilters,
  } = serversideConfig;
  const [actionType, actionName, entityName] = inventoryChain;

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

  // *** compose subscriptionUpdatedFields

  const subscriptionUpdatedFields =
    actionName.startsWith('updatedEntity') && actionType === 'Subscription'
      ? composeSubscriptionUpdatedFields(inventoryChain, generalConfig)
      : null;

  // ***

  if (!inventoryByRoles && !filters) {
    const { involvedFilters, subscriptionEntityNames } = involvedEntityNamesKeys.reduce(
      (prev, involvedEntityNamesKey) => {
        const entityName = involvedEntityNames[involvedEntityNamesKey];

        const involvedFilterName = composeInvolvedFilterName(involvedEntityNamesKey);

        if (involvedEntityNamesKey.startsWith(SUBSCRIPTION)) {
          const amendedInventoryChains = composeSubscriptionInventoryChains(
            involvedEntityNamesKey as SubscriptionInvolvedKey,
            entityName,
            generalConfig,
          );

          if (
            amendedInventoryChains.some((amendedInventoryChain) =>
              checkInventory(amendedInventoryChain as InventoryChain, inventory),
            )
          ) {
            prev.subscriptionEntityNames[involvedFilterName] = entityName;
          }
        } else {
          const personalFilter = personalCalculatedFilters[entityName];

          if (personalFilter === null) {
            prev.involvedFilters[involvedFilterName] = null;

            return prev;
          }

          const staticFilter = staticFilters[entityName];

          const staticLimit = staticLimits[entityName];

          const filter = checkInventory(inventoryChain as InventoryChain, inventory)
            ? staticFilter
              ? [staticFilter]
              : []
            : null;

          if (!filter) {
            prev.involvedFilters[involvedFilterName] = null;

            return prev;
          }

          prev.involvedFilters[involvedFilterName] = personalFilter
            ? [injectStaticOrPersonalFilter(personalFilter, filter)]
            : [filter];

          if (staticLimit && prev.involvedFilters[involvedFilterName]) {
            prev.involvedFilters[involvedFilterName].push(staticLimit);
          }
        }

        return prev;
      },

      {
        involvedFilters: {},
        subscriptionEntityNames: {} as Record<SubscriptionInvolvedEntityNames, string>,
      },
    );

    if (actionType !== 'Subscription') {
      return Object.keys(subscriptionEntityNames).length === 0
        ? { involvedFilters }
        : { involvedFilters, subscriptionEntityNames }; // return
    }

    if (!subscribePayloadFilters) {
      return subscriptionUpdatedFields
        ? { involvedFilters, subscribePayloadMongoFilter: {}, subscriptionUpdatedFields }
        : { involvedFilters, subscribePayloadMongoFilter: {} }; // return
    }

    if (!userAttributes) {
      throw new TypeError(
        `Not found ${getUserAttributes ? '"getUserAttributes" callback' : '"userAttributes"'} to process: "subscribePayloadFilters!`,
      );
    }

    const subscribePayloadMongoFilter = composeSubscribePayloadMongoFilter(
      subscribePayloadFilters,
      involvedEntityNames,
      userAttributes,
      allEntityConfigs[entityName],
    );

    return subscriptionUpdatedFields
      ? { involvedFilters, subscribePayloadMongoFilter, subscriptionUpdatedFields }
      : { involvedFilters, subscribePayloadMongoFilter }; // return
  }

  if (!userAttributes) {
    throw new TypeError(
      `Not found ${getUserAttributes ? '"getUserAttributes" callback' : '"userAttributes" to process: "filters"'}!`,
    );
  }

  const { roles } = userAttributes;

  const result: Record<string, InvolvedFilter[] | null | string> = {};

  for (let i = 0; i < involvedEntityNamesKeys.length; i += 1) {
    const involvedEntityNamesKey = involvedEntityNamesKeys[i];

    const entityName = involvedEntityNames[involvedEntityNamesKey];

    if (involvedEntityNamesKey.startsWith(SUBSCRIPTION)) {
      const amendedInventoryChains = composeSubscriptionInventoryChains(
        involvedEntityNamesKey as SubscriptionInvolvedKey,
        entityName,
        generalConfig,
      );

      if (
        amendedInventoryChains.some((amendedInventoryChain) =>
          checkInventory(amendedInventoryChain as InventoryChain, inventory),
        )
      ) {
        result[involvedEntityNamesKey] = entityName;
      }
    } else {
      result[involvedEntityNamesKey] = null;

      if (!checkInventory(inventoryChain as InventoryChain, inventory)) {
        continue;
      }

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

          if (checkInventory(inventoryChain as InventoryChain, inventoryByRole)) {
            result[involvedEntityNamesKey] = [];
            break;
          }
        }
      }

      if (!filters || !result[involvedEntityNamesKey]) continue;

      result[involvedEntityNamesKey] = composeUserFilter(entityName, userAttributes, filters);
    }
  }

  const { involvedFilters, subscriptionEntityNames } = Object.keys(result).reduce(
    (prev, key) => {
      const involvedFilterName = composeInvolvedFilterName(key as keyof ActionInvolvedEntityNames);

      if (key.startsWith(SUBSCRIPTION)) {
        prev.subscriptionEntityNames[involvedFilterName] = result[key];
      } else {
        const entityName = involvedEntityNames[key];

        const personalFilter = personalCalculatedFilters[entityName];

        if (personalFilter === null) {
          prev.involvedFilters[involvedFilterName] = null;

          return prev;
        }

        const staticFilter = staticFilters[entityName];
        const staticLimit = staticLimits[entityName];

        if (!result[key]) {
          prev.involvedFilters[involvedFilterName] = null;

          return prev;
        }

        const filter = staticFilter
          ? injectStaticOrPersonalFilter(staticFilter, result[key] as InvolvedFilter[])
          : (result[key] as InvolvedFilter[]);

        prev.involvedFilters[involvedFilterName] = personalFilter
          ? [injectStaticOrPersonalFilter(personalFilter, filter)]
          : [filter];

        if (staticLimit && prev.involvedFilters[involvedFilterName]) {
          prev.involvedFilters[involvedFilterName].push(staticLimit);
        }
      }

      return prev;
    },
    {
      involvedFilters: {},
      subscriptionEntityNames: {} as Record<SubscriptionInvolvedEntityNames, string>,
    },
  );

  if (actionType !== 'Subscription') {
    return Object.keys(subscriptionEntityNames).length === 0
      ? { involvedFilters }
      : { involvedFilters, subscriptionEntityNames }; // return
  }

  if (!subscribePayloadFilters) {
    return subscriptionUpdatedFields
      ? { involvedFilters, subscribePayloadMongoFilter: {}, subscriptionUpdatedFields }
      : { involvedFilters, subscribePayloadMongoFilter: {} }; // return
  }

  const subscribePayloadMongoFilter = composeSubscribePayloadMongoFilter(
    subscribePayloadFilters,
    involvedEntityNames,
    userAttributes,
    allEntityConfigs[entityName],
  );

  return subscriptionUpdatedFields
    ? { involvedFilters, subscribePayloadMongoFilter, subscriptionUpdatedFields }
    : { involvedFilters, subscribePayloadMongoFilter }; // return
};

export default executeAuthorisation;
