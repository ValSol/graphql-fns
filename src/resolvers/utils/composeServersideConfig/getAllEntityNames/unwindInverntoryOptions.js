// @flow

import type {
  GeneralConfig,
  InventoryOptions,
  SimplifiedInventoryOptions,
} from '../../../../flowTypes';

import mergeDerivativeIntoCustom from '../../../../utils/mergeDerivativeIntoCustom';
import { mutationAttributes, queryAttributes } from '../../../../types/actionAttributes';

const mutationNames = Object.keys(mutationAttributes);
const queryNames = Object.keys(queryAttributes);

const childQueryNames = Object.keys(queryAttributes).filter(
  (actionName) => queryAttributes[actionName].actionIsChild,
);

const tangibleTypes = ['tangible', 'tangibleFile'];

const unwindInverntoryOptions = (
  inventoryOptions: InventoryOptions,
  generalConfig: GeneralConfig,
  inventoryName?: string = '',
): SimplifiedInventoryOptions => {
  const { allEntityConfigs } = generalConfig;

  const amendedInventoryOptions =
    inventoryOptions && !inventoryOptions.Query && !inventoryOptions.Mutation
      ? { Query: true, Mutation: true }
      : inventoryOptions;

  const { Query: queryInventoryOptions = {}, Mutation: mutationInventoryOptions = {} } =
    amendedInventoryOptions;

  const rootEntityNames = Object.keys(allEntityConfigs).filter((name) =>
    tangibleTypes.includes(allEntityConfigs[name].type),
  );

  const { Query: customQueries = {}, Mutation: customMutations = {} } =
    mergeDerivativeIntoCustom(generalConfig, 'forCustomResolver') || {};

  // *** process child queries

  const allQueries = rootEntityNames.reduce((prev, entityName) => {
    const { duplexFields = [], relationalFields = [] } = allEntityConfigs[entityName];

    [...duplexFields, ...relationalFields].forEach(({ array, config: { name } }) => {
      childQueryNames.forEach((childQueryName) => {
        const { actionIsChild } = queryAttributes[childQueryName];

        if (
          (array && actionIsChild === 'Scalar') ||
          (!array && actionIsChild === 'Array') ||
          !queryAttributes[childQueryName].actionAllowed(allEntityConfigs[name])
        ) {
          return;
        }

        if (!prev[childQueryName]) {
          prev[childQueryName] = []; // eslint-disable-line no-param-reassign
        }

        if (!prev[childQueryName].includes(name)) {
          prev[childQueryName].push(name);
        }
      });
    });

    return prev;
  }, {});

  // ***

  // *** almost the same as below for the "Mutation"

  queryNames.reduce((prev, actionName) => {
    const actionNames = [];

    rootEntityNames.forEach((rootEntityName) => {
      if (
        !queryAttributes[actionName].actionIsChild &&
        queryAttributes[actionName].actionAllowed(allEntityConfigs[rootEntityName])
      ) {
        actionNames.push(rootEntityName);
      }
    });

    if (actionNames.length) {
      prev[actionName] = actionNames; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, allQueries);

  Object.keys(customQueries).reduce((prev, actionName) => {
    const actionNames = [];

    rootEntityNames.forEach((rootEntityName) => {
      if (customQueries[actionName].specificName(allEntityConfigs[rootEntityName], generalConfig)) {
        actionNames.push(rootEntityName);
      }
    });

    if (actionNames.length) {
      prev[actionName] = actionNames; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, allQueries);

  const Query =
    queryInventoryOptions === true
      ? allQueries
      : Object.keys(queryInventoryOptions).reduce((prev, actionName) => {
          if (!allQueries[actionName]) {
            throw new TypeError(
              `Incorrect inventory query name: ${actionName} of inventoryOptions: "${inventoryName}"!`,
            );
          }

          const allActionEntities = allQueries[actionName];

          if (queryInventoryOptions[actionName] === true) {
            prev[actionName] = allActionEntities; // eslint-disable-line no-param-reassign
          } else {
            queryInventoryOptions[actionName].forEach((entityName) => {
              if (!allActionEntities.includes(entityName)) {
                throw new TypeError(
                  `Incorrect entity name: "${entityName}" in inventory Query: "${actionName}" of inventoryOptions: "${inventoryName}"!`,
                );
              }
            });

            prev[actionName] = queryInventoryOptions[actionName]; // eslint-disable-line no-param-reassign
          }

          return prev;
        }, {});

  // ***

  // *** almost the same as above for the "Query"

  const allMutations = mutationNames.reduce((prev, actionName) => {
    const actionNames = [];

    rootEntityNames.forEach((rootEntityName) => {
      if (mutationAttributes[actionName].actionAllowed(allEntityConfigs[rootEntityName])) {
        actionNames.push(rootEntityName);
      }
    });

    if (actionNames.length) {
      prev[actionName] = actionNames; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  Object.keys(customMutations).reduce((prev, actionName) => {
    const actionNames = [];

    rootEntityNames.forEach((rootEntityName) => {
      if (
        customMutations[actionName].specificName(allEntityConfigs[rootEntityName], generalConfig)
      ) {
        actionNames.push(rootEntityName);
      }
    });

    if (actionNames.length) {
      prev[actionName] = actionNames; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, allMutations);

  const Mutation =
    mutationInventoryOptions === true
      ? allMutations
      : Object.keys(mutationInventoryOptions).reduce((prev, actionName) => {
          if (!allMutations[actionName]) {
            throw new TypeError(
              `Incorrect inventory mutation name: "${actionName}" of inventoryOptions: "${inventoryName}"!`,
            );
          }

          const allActionEntities = allMutations[actionName];

          if (mutationInventoryOptions[actionName] === true) {
            prev[actionName] = allActionEntities; // eslint-disable-line no-param-reassign
          } else {
            mutationInventoryOptions[actionName].forEach((entityName) => {
              if (!allActionEntities.includes(entityName)) {
                throw new TypeError(
                  `Incorrect entity name: "${entityName}" in inventory Mutation: "${actionName}" of inventoryOptions: "${inventoryName}"!`,
                );
              }
            });

            prev[actionName] = mutationInventoryOptions[actionName]; // eslint-disable-line no-param-reassign
          }

          return prev;
        }, {});

  // ***

  return { Query, Mutation };
};
export default unwindInverntoryOptions;
