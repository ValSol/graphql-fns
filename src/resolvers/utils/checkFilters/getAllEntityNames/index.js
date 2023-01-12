// @flow

import type {
  GeneralConfig,
  Inventory,
  ServersideConfig,
  SimplifiedInventoryOptions,
} from '../../../../flowTypes';

import mergeDerivativeIntoCustom from '../../../../utils/mergeDerivativeIntoCustom';
import { mutationAttributes, queryAttributes } from '../../../../types/actionAttributes';
import unwindInverntoryOptions from './unwindInverntoryOptions';
import subtructInventoryOptions from './subtructInventoryOptions';

const inventoryKeys = ['Query', 'Mutation', 'Subscription'];

const addEntityNames = (
  inventory: Inventory,
  generalConfig: GeneralConfig,
  result: { [entityName: string]: Array<string> }, // { entityName: 'inventory name, action, rootEntityName' }
  baseInventory?: SimplifiedInventoryOptions,
) => {
  const { allEntityConfigs } = generalConfig;

  const { Query: customQueries = {}, Mutation: customMutations = {} } =
    mergeDerivativeIntoCustom(generalConfig, 'forCustomResolver') || {};

  const { name, include, exclude } = inventory || {
    include: { Query: true, Mutation: true },
    exclude: undefined,
    name: '',
  };

  const amendedInclude = typeof include === 'object' ? include : { Query: true, Mutation: true };

  const unwindedInclude = unwindInverntoryOptions(amendedInclude, generalConfig);

  const amendedExclude =
    typeof exclude === 'object'
      ? inventoryKeys.reduce((prev, key) => {
          if (exclude[key]) {
            prev[key] = exclude[key]; // eslint-disable-line no-param-reassign
          } else {
            prev[key] = {}; // eslint-disable-line no-param-reassign
          }

          return prev;
        }, {})
      : { Query: true, Mutation: true };

  const unwindedExclude = unwindInverntoryOptions(amendedExclude, generalConfig);

  const includeMinusExclude = subtructInventoryOptions(unwindedInclude, unwindedExclude);

  // *** almost the same as below for the "Mutation"

  Object.keys(includeMinusExclude.Query).reduce((prev, actionName) => {
    if (baseInventory && !baseInventory.Query[actionName]) {
      throw new TypeError(`Query "${actionName}" not found in general inventory!`);
    }

    if (queryAttributes[actionName]) {
      includeMinusExclude.Query[actionName].forEach((entityName) => {
        if (baseInventory && !baseInventory.Query[actionName].includes(entityName)) {
          throw new TypeError(
            `Entity name "${entityName}" of query "${actionName}" not found in general inventory!`,
          );
        }

        const { mainEntity } = queryAttributes[actionName].actionInvolvedEntityNames(entityName);

        if (!prev[mainEntity]) {
          prev[mainEntity] = []; // eslint-disable-line no-param-reassign
        }

        prev[mainEntity].push(`inventory "${name}", option item: "${actionName}": "${entityName}"`);
      });
    } else {
      includeMinusExclude.Query[actionName].forEach((entityName) => {
        if (baseInventory && !baseInventory.Query[actionName].includes(entityName)) {
          throw new TypeError(
            `Entity name "${entityName}" of query "${actionName}" not found in general inventory!`,
          );
        }

        const { mainEntity } = customQueries[actionName].involvedEntityNames(
          allEntityConfigs[entityName],
          generalConfig,
        );

        if (!prev[mainEntity]) {
          prev[mainEntity] = []; // eslint-disable-line no-param-reassign
        }

        prev[mainEntity].push(`inventory "${name}", option item: "${actionName}": "${entityName}"`);
      });
    }

    return prev;
  }, result);

  // ***

  // *** almost the same as above for the "Query"

  Object.keys(includeMinusExclude.Mutation).reduce((prev, actionName) => {
    if (baseInventory && !baseInventory.Mutation[actionName]) {
      throw new TypeError(`Mutation "${actionName}" not found in general inventory!`);
    }

    if (mutationAttributes[actionName]) {
      includeMinusExclude.Mutation[actionName].forEach((entityName) => {
        if (baseInventory && !baseInventory.Mutation[actionName].includes(entityName)) {
          throw new TypeError(
            `Entity name "${entityName}" of mutation "${actionName}" not found in general inventory!`,
          );
        }

        const { mainEntity } = mutationAttributes[actionName].actionInvolvedEntityNames(entityName);

        if (!prev[mainEntity]) {
          prev[mainEntity] = []; // eslint-disable-line no-param-reassign
        }

        prev[mainEntity].push(`inventory "${name}", option item: "${actionName}": "${entityName}"`);
      });
    } else {
      includeMinusExclude.Mutation[actionName].forEach((entityName) => {
        if (baseInventory && !baseInventory.Mutation[actionName].includes(entityName)) {
          throw new TypeError(
            `Entity name "${entityName}" of mutation "${actionName}" not found in general inventory!`,
          );
        }

        const { mainEntity } = customMutations[actionName].involvedEntityNames(
          allEntityConfigs[entityName],
          generalConfig,
        );
        if (!prev[mainEntity]) {
          prev[mainEntity] = []; // eslint-disable-line no-param-reassign
        }

        prev[mainEntity].push(`inventory "${name}", option item: "${actionName}": "${entityName}"`);
      });
    }

    return prev;
  }, result);

  return includeMinusExclude;

  // ***
};

const getAllEntityNames = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): { [entityName: string]: Array<string> } => {
  const { inventory } = generalConfig;

  const { inventoryByRoles } = serversideConfig;

  const amendedInventory = inventory || {
    name: '',
    include: { Query: true, Mutation: true },
    exclude: undefined,
  };

  const resultWithouInventoryByRoles = {};
  const baseInventory = addEntityNames(
    amendedInventory,
    generalConfig,
    resultWithouInventoryByRoles,
  );

  if (inventoryByRoles) {
    const result = {};

    Object.keys(inventoryByRoles).forEach((role) => {
      const roleInventory = inventoryByRoles[role];

      addEntityNames(roleInventory, generalConfig, result, baseInventory);
    });

    return result;
  }

  return resultWithouInventoryByRoles;
};
export default getAllEntityNames;
