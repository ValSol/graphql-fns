// @flow

import type { GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import mergeDerivativeIntoCustom from '../utils/mergeDerivativeIntoCustom';
import composeCustomActionSignature from './composeCustomActionSignature';

import { mutationAttributes, queryAttributes } from './actionAttributes';

import createCreatedEntitySubscriptionType from './subscriptions/createCreatedEntitySubscriptionType';
import createDeletedEntitySubscriptionType from './subscriptions/createDeletedEntitySubscriptionType';
import createUpdatedEntitySubscriptionType from './subscriptions/createUpdatedEntitySubscriptionType';
import createUpdatedEntityPayloadType from './subscriptions/createUpdatedEntityPayloadType';

import composeEnumTypes from './specialized/composeEnumTypes';
import composeCommonUseTypes from './specialized/composeCommonUseTypes';
import composeGeospatialTypes from './specialized/composeGeospatialTypes';
import composeActionSignature from './composeActionSignature';

const composeGqlTypes = (
  generalConfig: GeneralConfig,
): { typeDefs: string, entityTypeDic: { [entityName: string]: string } } => {
  const { allEntityConfigs, inventory } = generalConfig;

  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = allowMutations && checkInventory(['Subscription'], inventory);

  const entityNames = Object.keys(allEntityConfigs);

  const inputDic = {};
  const entityTypeDic = {};

  // 1. generate standard actions' signatures AND add ...
  // ... to "entityTypeDic" standard entity types ...
  // ... to "inputDic" standard inputs

  const queryTypes = Object.keys(queryAttributes).reduce((prev, actionName) => {
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

  const mutationTypes = Object.keys(mutationAttributes).reduce((prev, actionName) => {
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

  // 2. generate custom actions signatures AND add ...
  // ... to "entityTypeDic" entity types ...
  // ... to "inputDic" inputs

  const { Query, Mutation } = mergeDerivativeIntoCustom(generalConfig, 'forCustomResolver') || {
    Query: {},
    Mutation: {},
  };

  entityNames.forEach((entityName) => {
    const { type: entityType } = allEntityConfigs[entityName];
    if (entityType !== 'tangible' && entityType !== 'tangibleFile') return;

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
  });

  const queryTypes2 = `type Query {
  node(id: ID!): Node${['', ...queryTypes].join('\n')}
}`;

  const mutationTypes2 = mutationTypes.length
    ? `type Mutation {
${mutationTypes.join('\n')}
}`
    : '';

  // 3. generaqte entity types

  const entityTypes = Object.keys(entityTypeDic)
    .map((key) => entityTypeDic[key])
    .join('\n');

  // 4. generate inputs

  const inputs = Object.keys(inputDic)
    .filter((inputName) => !inputName.startsWith('!'))
    .map((inputName) => inputDic[inputName])
    .join('\n');

  // 5. prepare subscriptions

  const updatedEntityPayloadTypes = allowSubscriptions
    ? Object.keys(allEntityConfigs)
        .map((entityName) => allEntityConfigs[entityName])
        .filter(({ type: configType }) => configType === 'tangible')
        .reduce((prev, entityConfig) => {
          const { name } = entityConfig;
          if (
            checkInventory(['Subscription', 'updatedEntity', name], inventory) &&
            checkInventory(['Mutation', 'updateEntity', name], inventory)
          ) {
            prev.push(createUpdatedEntityPayloadType(entityConfig));
          }
          return prev;
        }, [])
        .join('\n')
    : '';

  const entitySubscriptionTypes = allowSubscriptions
    ? Object.keys(allEntityConfigs)
        .map((entityName) => allEntityConfigs[entityName])
        .filter(({ type: configType }) => configType === 'tangible')
        .reduce((prev, entityConfig) => {
          const { name } = entityConfig;
          if (
            checkInventory(['Subscription', 'createdEntity', name], inventory) &&
            checkInventory(['Mutation', 'createEntity', name], inventory)
          ) {
            prev.push(createCreatedEntitySubscriptionType(entityConfig));
          }
          if (
            checkInventory(['Subscription', 'updatedEntity', name], inventory) &&
            checkInventory(['Mutation', 'updateEntity', name], inventory)
          ) {
            prev.push(createUpdatedEntitySubscriptionType(entityConfig));
          }
          if (
            checkInventory(['Subscription', 'deletedEntity', name], inventory) &&
            checkInventory(['Mutation', 'deleteEntity', name], inventory)
          ) {
            prev.push(createDeletedEntitySubscriptionType(entityConfig));
          }
          return prev;
        }, [])
        .join('\n')
    : '';
  const entitySubscriptionTypes2 = allowSubscriptions
    ? `type Subscription {
${entitySubscriptionTypes}
}`
    : '';

  const resultArray = composeCommonUseTypes();

  const enumTypes = composeEnumTypes(generalConfig);
  if (enumTypes) resultArray.push(enumTypes);

  const geospatialTypes = composeGeospatialTypes(generalConfig);
  if (geospatialTypes) resultArray.push(geospatialTypes);

  resultArray.push(entityTypes);

  if (inputs) resultArray.push(inputs);
  if (updatedEntityPayloadTypes) resultArray.push(updatedEntityPayloadTypes);
  if (queryTypes2) resultArray.push(queryTypes2);
  if (mutationTypes2) resultArray.push(mutationTypes2);
  if (entitySubscriptionTypes2) resultArray.push(entitySubscriptionTypes2);

  return { typeDefs: resultArray.join('\n'), entityTypeDic };
};

export default composeGqlTypes;
