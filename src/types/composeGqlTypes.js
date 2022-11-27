// @flow

import type { GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import composeDerivativeConfig from '../utils/composeDerivativeConfig';
import mergeDerivativeIntoCustom from '../utils/mergeDerivativeIntoCustom';
import collectDerivativeInputs from './collectDerivativeInputs';
import composeActionSignature from './composeActionSignature';
import composeObjectSignature from './composeObjectSignature';
import createEntityType from './createEntityType';

import { mutationAttributes, queryAttributes } from './actionAttributes';

import createCreatedEntitySubscriptionType from './subscriptions/createCreatedEntitySubscriptionType';
import createDeletedEntitySubscriptionType from './subscriptions/createDeletedEntitySubscriptionType';
import createUpdatedEntitySubscriptionType from './subscriptions/createUpdatedEntitySubscriptionType';
import createUpdatedEntityPayloadType from './subscriptions/createUpdatedEntityPayloadType';

import composeEnumTypes from './specialized/composeEnumTypes';
import composeCommonUseTypes from './specialized/composeCommonUseTypes';
import composeGeospatialTypes from './specialized/composeGeospatialTypes';
import composeStandardActionSignature from './composeStandardActionSignature';

const composeGqlTypes = (generalConfig: GeneralConfig): string => {
  const { entityConfigs, derivative: preDerivative, inventory } = generalConfig;

  const custom = mergeDerivativeIntoCustom(generalConfig);

  // eslint-disable-next-line no-nested-ternary
  const customInputObject = custom ? (custom.Input ? custom.Input : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customQuery = custom ? (custom.Query ? custom.Query : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom ? (custom.Mutation ? custom.Mutation : {}) : {};
  const derivative = preDerivative || {};

  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = allowMutations && checkInventory(['Subscription'], inventory);

  const entityNames = Object.keys(entityConfigs);

  const inputDic = {};

  // 1. generate standard objects' signatures

  const entityTypesArray = Object.keys(entityConfigs).map((entityName) =>
    createEntityType(entityConfigs[entityName], inputDic),
  );

  // 2. generate derivative objects' signatures

  Object.keys(derivative || {}).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    Object.keys(allow).forEach((entityName) => {
      const derivativeConfig = composeDerivativeConfig(
        derivative[suffix],
        entityConfigs[entityName],
        generalConfig,
      );
      if (derivativeConfig) prev.push(createEntityType(derivativeConfig, inputDic));
    });

    return prev;
  }, entityTypesArray);

  const entityTypes = entityTypesArray.join('\n');

  // 3. generate standard actions' signatures ...
  // ... AND add to "input dic" standard inputs

  const entityQueryTypes = Object.keys(queryAttributes).reduce((prev, actionName) => {
    entityNames.forEach((entityName) => {
      const action = composeStandardActionSignature(
        entityConfigs[entityName],
        queryAttributes[actionName],
        inputDic,
        inventory,
      );
      if (action) prev.push(action);
    });
    return prev;
  }, []);

  const entityMutationTypes = Object.keys(mutationAttributes).reduce((prev, actionName) => {
    entityNames.forEach((entityName) => {
      const action = composeStandardActionSignature(
        entityConfigs[entityName],
        mutationAttributes[actionName],
        inputDic,
        inventory,
      );
      if (action) prev.push(action);
    });
    return prev;
  }, []);

  // 4. generate custom actions' signatures

  entityNames.forEach((entityName) => {
    Object.keys(customQuery).forEach((customName) => {
      if (checkInventory(['Query', customName, entityName], inventory)) {
        const action = composeActionSignature(
          customQuery[customName],
          entityConfigs[entityName],
          generalConfig,
        );
        if (action) {
          entityQueryTypes.push(`  ${action}`);
        }
      }
    });

    Object.keys(customMutation).forEach((customName) => {
      if (checkInventory(['Mutation', customName, entityName], inventory)) {
        const action = composeActionSignature(
          customMutation[customName],
          entityConfigs[entityName],
          generalConfig,
        );
        if (action) {
          entityMutationTypes.push(`  ${action}`);
        }
      }
    });
  });

  const entityQueryTypes2 = entityQueryTypes.length
    ? `type Query {
  node(id: ID!): Node
${entityQueryTypes.join('\n')}
}`
    : '';

  const entityMutationTypes2 = entityMutationTypes.length
    ? `type Mutation {
${entityMutationTypes.join('\n')}
}`
    : '';

  // 5. add to "input dic" derivative inputs

  collectDerivativeInputs(generalConfig, inputDic);

  // 6. add to "input dic" custom inputs

  const customInputObjectNames = Object.keys(customInputObject);
  const input = true;
  entityNames.reduce((prev, entityName) => {
    customInputObjectNames.forEach((customName) => {
      const customInputType = composeObjectSignature(
        customInputObject[customName],
        entityConfigs[entityName],
        generalConfig,
        input,
      );
      if (customInputType) {
        const key = customInputObject[customName].specificName(
          entityConfigs[entityName],
          generalConfig,
        );
        prev[key] = customInputType; // eslint-disable-line no-param-reassign
      }
    });

    return prev;
  }, inputDic);

  const inputs = Object.keys(inputDic)
    .map((inputName) => inputDic[inputName])
    .join('\n');

  // prepare subscriptions

  const updatedEntityPayloadTypes = allowSubscriptions
    ? Object.keys(entityConfigs)
        .map((entityName) => entityConfigs[entityName])
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
    ? Object.keys(entityConfigs)
        .map((entityName) => entityConfigs[entityName])
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
  if (entityQueryTypes2) resultArray.push(entityQueryTypes2);
  if (entityMutationTypes2) resultArray.push(entityMutationTypes2);
  if (entitySubscriptionTypes2) resultArray.push(entitySubscriptionTypes2);

  return resultArray.join('\n');
};

export default composeGqlTypes;
