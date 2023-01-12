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

const addEntityNames = (
  inventory: Inventory,
  generalConfig: GeneralConfig,
  result: Array<string>,
  baseInventory?: SimplifiedInventoryOptions,
) => {
  const { allEntityConfigs } = generalConfig;

  const { Query: customQueries = {}, Mutation: customMutations = {} } =
    mergeDerivativeIntoCustom(generalConfig, 'forCustomResolver') || {};

  const { include, exclude } = inventory || {
    include: { Query: true, Mutation: true },
    exclude: undefined,
  };

  const amendedInclude = typeof include === 'object' ? include : { Query: true, Mutation: true };

  const unwindedInclude = unwindInverntoryOptions(amendedInclude, generalConfig);

  const unwindedExclude =
    exclude && exclude !== true
      ? unwindInverntoryOptions(exclude, generalConfig)
      : { Query: {}, Mutation: {} };

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

        if (!prev.includes(mainEntity)) {
          prev.push(mainEntity);
        }
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

        if (!prev.includes(mainEntity)) {
          prev.push(mainEntity);
        }
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
        if (!prev.includes(mainEntity)) {
          prev.push(mainEntity);
        }
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
        if (!prev.includes(mainEntity)) {
          prev.push(mainEntity);
        }
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
): Array<string> => {
  const { inventory } = generalConfig;

  const { inventoryByRoles } = serversideConfig;

  const result = [];

  const amendedInventory = inventory || {
    name: '',
    include: { Query: true, Mutation: true },
    exclude: undefined,
  };

  const baseInventory = addEntityNames(amendedInventory, generalConfig, result);

  if (inventoryByRoles) {
    Object.keys(inventoryByRoles).forEach((role) => {
      const roleInventory = inventoryByRoles[role];

      addEntityNames(roleInventory, generalConfig, result, baseInventory);
    });
  }

  return result;
};
export default getAllEntityNames;
