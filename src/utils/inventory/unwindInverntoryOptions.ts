import type {
  Custom,
  GeneralConfig,
  InventoryOptions,
  SimplifiedInventoryOptions,
} from '@/tsTypes';

import mergeRepresentationIntoCustom from '@/utils/mergeRepresentationIntoCustom';
import {
  mutationAttributes,
  queryAttributes,
  subscriptionAttributes,
} from '@/types/actionAttributes';

type ActionType = 'Query' | 'Mutation' | 'Subscription';

type AllActions = { [actionGeneralName: string]: string[] };

const actionTypes: ActionType[] = ['Query', 'Mutation', 'Subscription'];

const standardAttributes = {
  Query: queryAttributes,
  Mutation: mutationAttributes,
  Subscription: subscriptionAttributes,
};

const actionNameExamples = {
  Query: 'entities',
  Mutation: 'createEntity',
  Subscription: 'createdEntity',
};

const childQueryNames = Object.keys(queryAttributes).filter(
  (actionName) => queryAttributes[actionName].actionIsChild,
);

const isPlainObject = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// collect actions that may be used for every tangible entity: { actionGeneralName: [entityName, ...] }
const composeAllActions = (
  actionType: ActionType,
  generalConfig: GeneralConfig,
  customActions: Custom[ActionType],
): AllActions => {
  const { allEntityConfigs } = generalConfig;

  const rootEntityNames = Object.keys(allEntityConfigs).filter(
    (name) => allEntityConfigs[name].type === 'tangible',
  );

  const result: AllActions = {};

  const push = (actionName: string, entityName: string) => {
    if (!result[actionName]) {
      result[actionName] = [];
    }

    if (!result[actionName].includes(entityName)) {
      result[actionName].push(entityName);
    }
  };

  // child queries are applied to the entities referenced by fields of any other entity...
  // ... (the same fields as in "createEntityType")
  if (actionType === 'Query') {
    Object.keys(allEntityConfigs).forEach((entityName) => {
      const {
        duplexFields = [],
        relationalFields = [],
        filterFields = [],
        calculatedFields = [],
      } = allEntityConfigs[entityName] as any;

      [
        ...relationalFields,
        ...duplexFields,
        ...filterFields.filter(({ variants }) => variants.includes('plain')),
        ...calculatedFields.filter(({ calculatedType }) => calculatedType === 'filterFields'),
      ].forEach(({ array, config: { name } }) => {
        childQueryNames.forEach((childQueryName) => {
          const { actionIsChild, actionAllowed } = queryAttributes[childQueryName];

          if (
            (array && actionIsChild === 'Scalar') ||
            (!array && actionIsChild === 'Array') ||
            !actionAllowed(allEntityConfigs[name])
          ) {
            return;
          }

          push(childQueryName, name);
        });
      });
    });
  }

  const attributes = standardAttributes[actionType];

  Object.keys(attributes).forEach((actionName) => {
    const { actionIsChild, actionAllowed } = attributes[actionName];

    if (actionIsChild) return;

    rootEntityNames.forEach((rootEntityName) => {
      if (actionAllowed(allEntityConfigs[rootEntityName])) {
        push(actionName, rootEntityName);
      }
    });
  });

  Object.keys(customActions).forEach((actionName) => {
    rootEntityNames.forEach((rootEntityName) => {
      if (customActions[actionName].specificName(allEntityConfigs[rootEntityName], generalConfig)) {
        push(actionName, rootEntityName);
      }
    });
  });

  return result;
};

// explain the most frequent mistakes: a generated action name or an entity name instead of general action name
const composeUnknownActionHint = (
  actionType: ActionType,
  actionName: string,
  allActions: AllActions,
  generalConfig: GeneralConfig,
  customActions: Custom[ActionType],
): string => {
  const { allEntityConfigs } = generalConfig;

  if (allEntityConfigs[actionName]) {
    return ` "${actionName}" is an entity name: use general action names (e.g. "${actionNameExamples[actionType]}") as keys and entity names in their arrays!`;
  }

  const attributes = standardAttributes[actionType];

  for (const generalName of Object.keys(allActions)) {
    for (const entityName of allActions[generalName]) {
      const specificName = attributes[generalName]
        ? !attributes[generalName].actionIsChild && attributes[generalName].actionName(entityName)
        : customActions[generalName].specificName(allEntityConfigs[entityName], generalConfig);

      if (specificName === actionName) {
        return ` "${actionName}" is a generated name, use general action name instead: { ${actionType}: { ${generalName}: ["${entityName}"] } }!`;
      }
    }
  }

  return '';
};

const pickActions = (
  actionType: ActionType,
  typeOptions: InventoryOptions[ActionType],
  generalConfig: GeneralConfig,
  customActions: Custom[ActionType],
  inventoryTitle: string,
): SimplifiedInventoryOptions[ActionType] => {
  const allActions = composeAllActions(actionType, generalConfig, customActions);

  if (typeOptions === true) {
    return allActions;
  }

  if (!isPlainObject(typeOptions)) {
    throw new TypeError(
      `Incorrect value of "${actionType}" in ${inventoryTitle}: expected "true" or object with action names as keys!`,
    );
  }

  return Object.keys(typeOptions as object).reduce<SimplifiedInventoryOptions[ActionType]>(
    (prev, actionName) => {
      const allActionEntities = allActions[actionName];

      if (!allActionEntities) {
        throw new TypeError(
          `Incorrect action name: "${actionName}" in "${actionType}" of ${inventoryTitle}!${composeUnknownActionHint(
            actionType,
            actionName,
            allActions,
            generalConfig,
            customActions,
          )}`,
        );
      }

      const entityNames = (typeOptions as object)[actionName];

      if (entityNames === true) {
        prev[actionName] = allActionEntities;

        return prev;
      }

      if (!Array.isArray(entityNames)) {
        throw new TypeError(
          `Incorrect value of "${actionType}": "${actionName}" in ${inventoryTitle}: expected "true" or array of entity names!`,
        );
      }

      entityNames.forEach((entityName) => {
        if (!allActionEntities.includes(entityName)) {
          throw new TypeError(
            `Incorrect entity name: "${entityName}" in "${actionType}": "${actionName}" of ${inventoryTitle}: ${
              generalConfig.allEntityConfigs[entityName]
                ? `action is not available for the entity (available for: ${allActionEntities
                    .map((name) => `"${name}"`)
                    .join(', ')})`
                : 'entity not found'
            }!`,
          );
        }
      });

      prev[actionName] = entityNames;

      return prev;
    },
    {},
  );
};

const unwindInverntoryOptions = (
  inventoryOptions: InventoryOptions,
  generalConfig: GeneralConfig,
  inventoryName = '',
  optionsKey?: 'include' | 'exclude',
): SimplifiedInventoryOptions => {
  const inventoryTitle = `inventory "${inventoryName}"${optionsKey ? ` (${optionsKey})` : ''}`;

  if (!isPlainObject(inventoryOptions)) {
    throw new TypeError(
      `Incorrect ${inventoryTitle}: expected "true" or object with "Query", "Mutation" or "Subscription" keys!`,
    );
  }

  Object.keys(inventoryOptions).forEach((key) => {
    if (!actionTypes.includes(key as ActionType)) {
      throw new TypeError(
        `Incorrect action type: "${key}" in ${inventoryTitle}: expected "Query", "Mutation" or "Subscription"!`,
      );
    }
  });

  const amendedInventoryOptions =
    !inventoryOptions.Query && !inventoryOptions.Mutation && !inventoryOptions.Subscription
      ? { Query: true, Mutation: true, Subscription: true }
      : inventoryOptions;

  const customActions = mergeRepresentationIntoCustom(generalConfig, 'forCustomResolver') || {};

  return actionTypes.reduce<SimplifiedInventoryOptions>(
    (prev, actionType) => {
      prev[actionType] = pickActions(
        actionType,
        amendedInventoryOptions[actionType] || {},
        generalConfig,
        customActions[actionType] || {},
        inventoryTitle,
      );

      return prev;
    },
    { Query: {}, Mutation: {}, Subscription: {} },
  );
};

export default unwindInverntoryOptions;
