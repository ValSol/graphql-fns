import type {
  GeneralConfig,
  Inventory,
  ServersideConfig,
  SimplifiedEntityFilters,
  SimplifiedInventoryOptions,
} from '@/tsTypes';

import mergeDescendantIntoCustom from '@/utils/mergeDescendantIntoCustom';
import {
  mutationAttributes,
  queryAttributes,
  subscriptionAttributes,
} from '@/types/actionAttributes';
import unwindInverntoryOptions from './unwindInverntoryOptions';
import subtructInventoryOptions from './subtructInventoryOptions';

const inventoryKeys = ['Query', 'Mutation', 'Subscription'];

const unusedInvolvedEntityKeys = [
  'subscriptionCreatedEntity',
  'subscriptionDeletedEntity',
  'subscriptionUpdatedEntity',
];

export type AllEntityNames = {
  // { entityName: { descriptions: 'inventory name, action, rootEntityName, involvedEntityKey', isOutput: boolean } }
  [entityName: string]: { descriptions: Array<string>; isOutput: boolean };
};

const processActions =
  (
    prev: { allEntityNames: AllEntityNames; subscribePayloadEntityNames: AllEntityNames },
    role: string,
    actionName: string,
    actionType: string,
    baseInventory: undefined | SimplifiedInventoryOptions,
    inventoryName: string,
    getInvolvedEntityNames,
    getConfig,
  ) =>
  (entityName: string) => {
    if (baseInventory && !baseInventory[actionType][actionName].includes(entityName)) {
      throw new TypeError(
        `Entity name "${entityName}" of ${actionType.toLowerCase()} "${actionName}" of "${role}" role not found in general inventory!`,
      );
    }

    // const involvedEntityNames = queryAttributes[actionName].actionInvolvedEntityNames(entityName);
    const involvedEntityNames = getInvolvedEntityNames(actionName, entityName);

    Object.keys(involvedEntityNames).forEach((involvedEntityKey) => {
      if (unusedInvolvedEntityKeys.includes(involvedEntityKey)) {
        return;
      }

      const involvedEntityName = involvedEntityNames[involvedEntityKey];

      if (!prev.allEntityNames[involvedEntityName]) {
        prev.allEntityNames[involvedEntityName] = { descriptions: [], isOutput: false };
      }

      prev.allEntityNames[involvedEntityName].descriptions.push(
        `inventory "${inventoryName}", option item: "${actionName}": "${entityName}", involvedEntityKey: "${involvedEntityKey}"`,
      );

      const config = getConfig(actionName, entityName);

      prev.allEntityNames[involvedEntityName].isOutput =
        prev.allEntityNames[involvedEntityName].isOutput ||
        (Boolean(config) &&
          (involvedEntityKey === 'inputOutputEntity' || involvedEntityKey.startsWith('output')));
    });

    if (actionType === 'Subscription') {
      if (!prev.subscribePayloadEntityNames[entityName]) {
        prev.subscribePayloadEntityNames[entityName] = { descriptions: [], isOutput: true };
      }

      prev.subscribePayloadEntityNames[entityName].descriptions.push(
        `inventory "${inventoryName}", option item: "${actionName}": "${entityName}", involvedEntityKey: "inputOutputEntity`,
      );
    }
  };

const addEntityNames = (
  inventory: Inventory,
  generalConfig: GeneralConfig,
  result: { allEntityNames: AllEntityNames; subscribePayloadEntityNames: AllEntityNames },
  baseInventory?: SimplifiedInventoryOptions,
  role?: string,
) => {
  const { allEntityConfigs } = generalConfig;

  const {
    Query: customQueries = {},
    Mutation: customMutations = {},
    Subscription: customSubscriptions = {},
  } = mergeDescendantIntoCustom(generalConfig, 'forCustomResolver') || {};

  const { name, include, exclude } = inventory || {
    include: { Query: true, Mutation: true, Subscription: true },
    exclude: undefined,
    name: '',
  };

  const amendedInclude =
    typeof include === 'object'
      ? include
      : ({ Query: true, Mutation: true, Subscription: true } as {
          Query: true;
          Mutation: true;
          Subscription: true;
        });

  const unwindedInclude = unwindInverntoryOptions(amendedInclude, generalConfig, name);

  const amendedExclude =
    typeof exclude === 'object'
      ? inventoryKeys.reduce<Record<string, any>>((prev, key) => {
          if (exclude[key]) {
            prev[key] = exclude[key];
          } else {
            prev[key] = {};
          }

          return prev;
        }, {})
      : {
          // "exclude" may be "true" or 'undefined"
          Query: exclude || {},
          Mutation: exclude || {},
          Subscription: exclude || {},
        };

  const unwindedExclude = unwindInverntoryOptions(amendedExclude, generalConfig, name);

  const includeMinusExclude = subtructInventoryOptions(unwindedInclude, unwindedExclude);

  // *** almost the same as below for the "Mutation"

  Object.keys(includeMinusExclude.Query).reduce((prev, actionName) => {
    if (baseInventory && !baseInventory.Query[actionName]) {
      throw new TypeError(
        `Query "${actionName}" of "${role}" role not found in general inventory!`,
      );
    }

    if (queryAttributes[actionName]) {
      includeMinusExclude.Query[actionName].forEach(
        processActions(
          prev,
          role,
          actionName,
          'Query',
          baseInventory,
          name,
          (actionName2, entityName2) =>
            queryAttributes[actionName2].actionInvolvedEntityNames(entityName2),
          (actionName2, entityName2) =>
            queryAttributes[actionName2].actionReturnConfig(
              allEntityConfigs[entityName2],
              generalConfig,
            ),
        ),
      );
    } else {
      includeMinusExclude.Query[actionName].forEach(
        processActions(
          prev,
          role,
          actionName,
          'Query',
          baseInventory,
          name,
          (actionName2, entityName2) =>
            customQueries[actionName2].involvedEntityNames(
              allEntityConfigs[entityName2],
              generalConfig,
            ),
          (actionName2, entityName2) =>
            customQueries[actionName2].config(allEntityConfigs[entityName2], generalConfig),
        ),
      );
    }

    return prev;
  }, result);

  // ***

  // *** almost the same as above for the "Query"

  Object.keys(includeMinusExclude.Mutation).reduce((prev, actionName) => {
    if (baseInventory && !baseInventory.Mutation[actionName]) {
      throw new TypeError(
        `Mutation "${actionName}" of "${role}" role not found in general inventory!`,
      );
    }

    if (mutationAttributes[actionName]) {
      includeMinusExclude.Mutation[actionName].forEach(
        processActions(
          prev,
          role,
          actionName,
          'Mutation',
          baseInventory,
          name,
          (actionName2, entityName2) =>
            mutationAttributes[actionName2].actionInvolvedEntityNames(entityName2),
          (actionName2, entityName2) =>
            mutationAttributes[actionName2].actionReturnConfig(
              allEntityConfigs[entityName2],
              generalConfig,
            ),
        ),
      );
    } else {
      includeMinusExclude.Mutation[actionName].forEach(
        processActions(
          prev,
          role,
          actionName,
          'Mutation',
          baseInventory,
          name,
          (actionName2, entityName2) =>
            customMutations[actionName2].involvedEntityNames(
              allEntityConfigs[entityName2],
              generalConfig,
            ),
          (actionName2, entityName2) =>
            customMutations[actionName2].config(allEntityConfigs[entityName2], generalConfig),
        ),
      );
    }

    return prev;
  }, result);

  // ***

  // *** almost the same as above for the "Mutation"

  Object.keys(includeMinusExclude.Subscription).reduce((prev, actionName) => {
    if (baseInventory && !baseInventory.Subscription[actionName]) {
      throw new TypeError(
        `Subscription "${actionName}" of "${role}" role not found in general inventory!`,
      );
    }

    if (subscriptionAttributes[actionName]) {
      includeMinusExclude.Subscription[actionName].forEach(
        processActions(
          prev,
          role,
          actionName,
          'Subscription',
          baseInventory,
          name,
          (actionName2, entityName2) =>
            subscriptionAttributes[actionName2].actionInvolvedEntityNames(entityName2),
          (actionName2, entityName2) =>
            subscriptionAttributes[actionName2].actionReturnConfig(
              allEntityConfigs[entityName2],
              generalConfig,
            ),
        ),
      );
    } else {
      includeMinusExclude.Subscription[actionName].forEach(
        processActions(
          prev,
          role,
          actionName,
          'Subscription',
          baseInventory,
          name,
          (actionName2, entityName2) =>
            customSubscriptions[actionName2].involvedEntityNames(
              allEntityConfigs[entityName2],
              generalConfig,
            ),
          (actionName2, entityName2) =>
            customSubscriptions[actionName2].config(allEntityConfigs[entityName2], generalConfig),
        ),
      );
    }

    return prev;
  }, result);

  // ***

  return includeMinusExclude;
};

const getAllEntityNames = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig & {
    filters?: SimplifiedEntityFilters;
  },
): { allEntityNames: AllEntityNames; subscribePayloadEntityNames: AllEntityNames } => {
  const { inventory } = generalConfig;

  const { inventoryByRoles } = serversideConfig;

  const amendedInventory = inventory || {
    name: '',
    include: { Query: true, Mutation: true, Subscription: true },
    exclude: undefined,
  };

  const generalInventoryResult: {
    allEntityNames: AllEntityNames;
    subscribePayloadEntityNames: AllEntityNames;
  } = { allEntityNames: {}, subscribePayloadEntityNames: {} };
  const baseInventory = addEntityNames(amendedInventory, generalConfig, generalInventoryResult);

  if (inventoryByRoles) {
    const result: { allEntityNames: AllEntityNames; subscribePayloadEntityNames: AllEntityNames } =
      { allEntityNames: {}, subscribePayloadEntityNames: {} };

    Object.keys(inventoryByRoles).forEach((role) => {
      const roleInventory = inventoryByRoles[role];

      addEntityNames(roleInventory, generalConfig, result, baseInventory, role);
    });

    return result;
  }

  return generalInventoryResult;
};
export default getAllEntityNames;
