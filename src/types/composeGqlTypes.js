// @flow

import type { GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import composeDerivativeConfig from '../utils/composeDerivativeConfig';
import mergeDerivativeIntoCustom from '../utils/mergeDerivativeIntoCustom';
import collectDerivativeInputs from './collectDerivativeInputs';
import composeActionSignature from './composeActionSignature';
import composeObjectSignature from './composeObjectSignature';
import createThingType from './createThingType';

import { mutationAttributes, queryAttributes } from './actionAttributes';

import createCreatedThingSubscriptionType from './subscriptions/createCreatedThingSubscriptionType';
import createDeletedThingSubscriptionType from './subscriptions/createDeletedThingSubscriptionType';
import createUpdatedThingSubscriptionType from './subscriptions/createUpdatedThingSubscriptionType';
import createUpdatedThingPayloadType from './subscriptions/createUpdatedThingPayloadType';

import composeEnumTypes from './specialized/composeEnumTypes';
import composeCommonUseTypes from './specialized/composeCommonUseTypes';
import composeGeospatialTypes from './specialized/composeGeospatialTypes';
import composeStandardActionSignature from './composeStandardActionSignature';

const composeGqlTypes = (generalConfig: GeneralConfig): string => {
  const { thingConfigs, derivative: preDerivative, inventory } = generalConfig;

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

  const thingNames = Object.keys(thingConfigs);

  const inputDic = {};

  // 1. generate standard objects' signatures

  const thingTypesArray = Object.keys(thingConfigs).map((thingName) =>
    createThingType(thingConfigs[thingName], inputDic),
  );

  // 2. generate derivative objects' signatures

  Object.keys(derivative || {}).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    Object.keys(allow).forEach((thingName) => {
      const derivativeConfig = composeDerivativeConfig(
        derivative[suffix],
        thingConfigs[thingName],
        generalConfig,
      );
      if (derivativeConfig) prev.push(createThingType(derivativeConfig, inputDic));
    });

    return prev;
  }, thingTypesArray);

  const thingTypes = thingTypesArray.join('\n');

  // 3. generate standard actions' signatures ...
  // ... AND add to "input dic" standard inputs

  const thingQueryTypes = Object.keys(queryAttributes).reduce((prev, actionName) => {
    thingNames.forEach((thingName) => {
      const action = composeStandardActionSignature(
        thingConfigs[thingName],
        queryAttributes[actionName],
        inputDic,
        inventory,
      );
      if (action) prev.push(action);
    });
    return prev;
  }, []);

  const thingMutationTypes = Object.keys(mutationAttributes).reduce((prev, actionName) => {
    thingNames.forEach((thingName) => {
      const action = composeStandardActionSignature(
        thingConfigs[thingName],
        mutationAttributes[actionName],
        inputDic,
        inventory,
      );
      if (action) prev.push(action);
    });
    return prev;
  }, []);

  // 4. generate custom actions' signatures

  thingNames.forEach((thingName) => {
    Object.keys(customQuery).forEach((customName) => {
      if (checkInventory(['Query', customName, thingName], inventory)) {
        const action = composeActionSignature(
          customQuery[customName],
          thingConfigs[thingName],
          generalConfig,
        );
        if (action) {
          thingQueryTypes.push(`  ${action}`);
        }
      }
    });

    Object.keys(customMutation).forEach((customName) => {
      if (checkInventory(['Mutation', customName, thingName], inventory)) {
        const action = composeActionSignature(
          customMutation[customName],
          thingConfigs[thingName],
          generalConfig,
        );
        if (action) {
          thingMutationTypes.push(`  ${action}`);
        }
      }
    });
  });

  const thingQueryTypes2 = thingQueryTypes.length
    ? `type Query {
  node(id: ID!): Node
${thingQueryTypes.join('\n')}
}`
    : '';

  const thingMutationTypes2 = thingMutationTypes.length
    ? `type Mutation {
${thingMutationTypes.join('\n')}
}`
    : '';

  // 5. add to "input dic" derivative inputs

  collectDerivativeInputs(generalConfig, inputDic);

  // 6. add to "input dic" custom inputs

  const customInputObjectNames = Object.keys(customInputObject);
  const input = true;
  thingNames.reduce((prev, thingName) => {
    customInputObjectNames.forEach((customName) => {
      const customInputType = composeObjectSignature(
        customInputObject[customName],
        thingConfigs[thingName],
        generalConfig,
        input,
      );
      if (customInputType) {
        const key = customInputObject[customName].specificName(
          thingConfigs[thingName],
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

  const updatedThingPayloadTypes = allowSubscriptions
    ? Object.keys(thingConfigs)
        .map((thingName) => thingConfigs[thingName])
        .filter(({ embedded, file }) => !(embedded || file))
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          if (
            checkInventory(['Subscription', 'updatedThing', name], inventory) &&
            checkInventory(['Mutation', 'updateThing', name], inventory)
          ) {
            prev.push(createUpdatedThingPayloadType(thingConfig));
          }
          return prev;
        }, [])
        .join('\n')
    : '';

  const thingSubscriptionTypes = allowSubscriptions
    ? Object.keys(thingConfigs)
        .map((thingName) => thingConfigs[thingName])
        .filter(({ embedded, file }) => !(embedded || file))
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          if (
            checkInventory(['Subscription', 'createdThing', name], inventory) &&
            checkInventory(['Mutation', 'createThing', name], inventory)
          ) {
            prev.push(createCreatedThingSubscriptionType(thingConfig));
          }
          if (
            checkInventory(['Subscription', 'updatedThing', name], inventory) &&
            checkInventory(['Mutation', 'updateThing', name], inventory)
          ) {
            prev.push(createUpdatedThingSubscriptionType(thingConfig));
          }
          if (
            checkInventory(['Subscription', 'deletedThing', name], inventory) &&
            checkInventory(['Mutation', 'deleteThing', name], inventory)
          ) {
            prev.push(createDeletedThingSubscriptionType(thingConfig));
          }
          return prev;
        }, [])
        .join('\n')
    : '';
  const thingSubscriptionTypes2 = allowSubscriptions
    ? `type Subscription {
${thingSubscriptionTypes}
}`
    : '';

  const resultArray = composeCommonUseTypes();

  const enumTypes = composeEnumTypes(generalConfig);
  if (enumTypes) resultArray.push(enumTypes);

  const geospatialTypes = composeGeospatialTypes(generalConfig);
  if (geospatialTypes) resultArray.push(geospatialTypes);

  resultArray.push(thingTypes);

  if (inputs) resultArray.push(inputs);
  if (updatedThingPayloadTypes) resultArray.push(updatedThingPayloadTypes);
  if (thingQueryTypes2) resultArray.push(thingQueryTypes2);
  if (thingMutationTypes2) resultArray.push(thingMutationTypes2);
  if (thingSubscriptionTypes2) resultArray.push(thingSubscriptionTypes2);

  return resultArray.join('\n');
};

export default composeGqlTypes;
