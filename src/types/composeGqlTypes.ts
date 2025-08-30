import type { GeneralConfig } from '../tsTypes';

import checkInventory from '../utils/inventory/checkInventory';
import mergeDescendantIntoCustom from '../utils/mergeDescendantIntoCustom';
import composeCustomActionSignature from './composeCustomActionSignature';

import { mutationAttributes, queryAttributes, subscriptionAttributes } from './actionAttributes';

import composeEnumTypes from './specialized/composeEnumTypes';
import composeCommonUseTypes from './specialized/composeCommonUseTypes';
import composeGeospatialTypes from './specialized/composeGeospatialTypes';
import composeActionSignature from './composeActionSignature';
import composeInterfaceTypeDic from './composeInterfaceTypeDic';
import processManualyUsedEntities from './processManualyUsedEntities';

const composeGqlTypes = (
  generalConfig: GeneralConfig,
): {
  typeDefs: string;
  entityTypeDic: { [entityName: string]: string };
} => {
  const { allEntityConfigs, inventory, descendant = {} } = generalConfig;

  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = allowMutations && checkInventory(['Subscription'], inventory);

  const entityNames = Object.keys(allEntityConfigs);

  const inputDic: { [inputName: string]: string } = {};
  const entityTypeDic: { [entityName: string]: string } = {};

  // 1. generate standard actions' signatures AND add ...
  // ... to "entityTypeDic" standard entity types ...
  // ... to "inputDic" standard inputs

  const queryTypes = Object.keys(queryAttributes).reduce<Array<any>>((prev, actionName) => {
    entityNames.forEach((entityName) => {
      const action = composeActionSignature(
        allEntityConfigs[entityName],
        generalConfig,
        queryAttributes[actionName],
        entityTypeDic,
        inputDic,
      );

      if (action) prev.push(action);
    });
    return prev;
  }, []);

  const mutationTypes = Object.keys(mutationAttributes).reduce<Array<any>>((prev, actionName) => {
    entityNames.forEach((entityName) => {
      const action = composeActionSignature(
        allEntityConfigs[entityName],
        generalConfig,
        mutationAttributes[actionName],
        entityTypeDic,
        inputDic,
      );

      if (action) prev.push(action);
    });
    return prev;
  }, []);

  const subscriptionTypes = Object.keys(subscriptionAttributes).reduce<Array<any>>(
    (prev, actionName) => {
      entityNames.forEach((entityName) => {
        const action = composeActionSignature(
          allEntityConfigs[entityName],
          generalConfig,
          subscriptionAttributes[actionName],
          entityTypeDic,
          inputDic,
        );

        if (action) prev.push(action);
      });
      return prev;
    },
    [],
  );

  // 2. generate custom actions signatures AND add ...
  // ... to "entityTypeDic" entity types ...
  // ... to "inputDic" inputs

  const { Query, Mutation, Subscription } = mergeDescendantIntoCustom(generalConfig) || {
    Query: {},
    Mutation: {},
    Subscription: {},
  };

  entityNames.forEach((entityName) => {
    const { type: entityType } = allEntityConfigs[entityName];
    if (entityType !== 'tangible') return;

    if (Query) {
      Object.keys(Query).forEach((customName) => {
        if (checkInventory(['Query', customName, entityName], inventory)) {
          const action = composeCustomActionSignature(
            Query[customName],
            allEntityConfigs[entityName],
            generalConfig,
            entityTypeDic,
            inputDic,
          );
          if (action) {
            queryTypes.push(`  ${action}`);
          }
        }
      });
    }

    if (Mutation) {
      Object.keys(Mutation).forEach((customName) => {
        if (checkInventory(['Mutation', customName, entityName], inventory)) {
          const action = composeCustomActionSignature(
            Mutation[customName],
            allEntityConfigs[entityName],
            generalConfig,
            entityTypeDic,
            inputDic,
          );
          if (action) {
            mutationTypes.push(`  ${action}`);
          }
        }
      });
    }

    if (Subscription) {
      Object.keys(Subscription).forEach((customName) => {
        if (checkInventory(['Subscription', customName, entityName], inventory)) {
          const action = composeCustomActionSignature(
            Subscription[customName],
            allEntityConfigs[entityName],
            generalConfig,
            entityTypeDic,
            inputDic,
          );
          if (action) {
            subscriptionTypes.push(`  ${action}`);
          }
        }
      });
    }
  });

  const queryTypes2 = `type Query {
  node(id: ID!): Node${['', ...queryTypes].join('\n')}
}`;

  const mutationTypes2 =
    mutationTypes.length > 0
      ? `type Mutation {
${mutationTypes.join('\n')}
}`
      : '';

  const subscriptionTypes2 =
    subscriptionTypes.length > 0
      ? `type Subscription {
${subscriptionTypes.join('\n')}
}`
      : '';

  // 3. generaqte entity types

  processManualyUsedEntities(generalConfig, entityTypeDic, inputDic);

  const entityTypes = Object.keys(entityTypeDic)
    .map((key) => entityTypeDic[key])
    .join('\n');

  // 4. generate interfaces

  const interfaceTypeDic = composeInterfaceTypeDic(entityTypeDic, generalConfig);
  const interfaces = Object.keys(interfaceTypeDic)
    .map((key) => interfaceTypeDic[key])
    .join('\n');

  // 5. generate inputs

  const inputs = Object.keys(inputDic)
    .filter((inputName) => !inputName.startsWith('!'))
    .map((inputName) => inputDic[inputName])
    .join('\n');

  // 6. prepare subscriptions

  const resultArray = composeCommonUseTypes();

  const enumTypes = composeEnumTypes(generalConfig);
  if (enumTypes) resultArray.push(enumTypes);

  const geospatialTypes = composeGeospatialTypes(generalConfig);
  if (geospatialTypes) resultArray.push(geospatialTypes);

  if (interfaces) resultArray.push(interfaces);

  resultArray.push(entityTypes);

  if (inputs) resultArray.push(inputs);
  if (queryTypes2) resultArray.push(queryTypes2);
  if (mutationTypes2) resultArray.push(mutationTypes2);
  if (subscriptionTypes2) resultArray.push(subscriptionTypes2);

  return { typeDefs: resultArray.join('\n'), entityTypeDic };
};

export default composeGqlTypes;
