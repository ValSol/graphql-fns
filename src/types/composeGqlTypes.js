// @flow

import type { GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import composeActionSignature from './composeActionSignature';
import composeObjectSignature from './composeObjectSignature';
import createThingType from './createThingType';
import createFilesOfThingOptionsInputType from './inputs/createFilesOfThingOptionsInputType';
import createPushIntoThingInputType from './inputs/createPushIntoThingInputType';
import createThingCreateInputType from './inputs/createThingCreateInputType';
import createThingPaginationInputType from './inputs/createThingPaginationInputType';
import createThingUpdateInputType from './inputs/createThingUpdateInputType';
import createUploadFilesToThingInputType from './inputs/createUploadFilesToThingInputType';
import createThingNearInputType from './inputs/createThingNearInputType';
import createThingSortInputType from './inputs/createThingSortInputType';
import createThingWhereInputType from './inputs/createThingWhereInputType';
import createThingWhereOneInputType from './inputs/createThingWhereOneInputType';
import createThingCountQueryType from './queries/createThingCountQueryType';
import createThingQueryType from './queries/createThingQueryType';
import createThingsQueryType from './queries/createThingsQueryType';
import createPushIntoThingMutationType from './mutations/createPushIntoThingMutationType';
import createCreateManyThingsMutationType from './mutations/createCreateManyThingsMutationType';
import createCreateThingMutationType from './mutations/createCreateThingMutationType';
import createImportThingsMutationType from './mutations/createImportThingsMutationType';
import createUpdateThingMutationType from './mutations/createUpdateThingMutationType';
import createDeleteThingMutationType from './mutations/createDeleteThingMutationType';
import createUploadFilesToThingMutationType from './mutations/createUploadFilesToThingMutationType';

import createCreatedThingSubscriptionType from './subscriptions/createCreatedThingSubscriptionType';
import createDeletedThingSubscriptionType from './subscriptions/createDeletedThingSubscriptionType';
import createUpdatedThingSubscriptionType from './subscriptions/createUpdatedThingSubscriptionType';
import createUpdatedThingPayloadType from './subscriptions/createUpdatedThingPayloadType';

import composeEnumTypes from './specialized/composeEnumTypes';
import composeGeospatialTypes from './specialized/composeGeospatialTypes';
import composeImportOptionsInputTypes from './specialized/composeImportOptionsInputTypes';

const composeGqlTypes = (generalConfig: GeneralConfig): string => {
  const { thingConfigs, custom, inventory } = generalConfig;

  // eslint-disable-next-line no-nested-ternary
  const customInputObject = custom ? (custom.Input ? custom.Input : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customReturnObject = custom ? (custom.Return ? custom.Return : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customQuery = custom ? (custom.Query ? custom.Query : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom ? (custom.Mutation ? custom.Mutation : {}) : {};

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = allowMutations && checkInventory(['Subscription'], inventory);

  const thingTypesArray = Object.keys(thingConfigs).map((thingName) =>
    createThingType(thingConfigs[thingName]),
  );

  const customReturnObjectNames = Object.keys(customReturnObject);
  Object.keys(thingConfigs)
    .map((thingName) => thingConfigs[thingName])
    .filter(({ embedded }) => !embedded)
    .reduce((prev, thingConfig) => {
      customReturnObjectNames.forEach((customName) => {
        const customReturnType = composeObjectSignature(
          customReturnObject[customName],
          thingConfig,
          generalConfig,
        );
        if (customReturnType) prev.push(customReturnType);
      });

      return prev;
    }, thingTypesArray);

  const thingTypes = thingTypesArray.join('\n');

  const thingInputTypes = allowMutations
    ? Object.keys(thingConfigs)
        .map((thingName) => thingConfigs[thingName])
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          // use ['Mutation', 'createThing'] not ['Mutation', 'updateThing', name] ...
          // ... to let creation of children things of other types
          if (checkInventory(['Mutation', 'createThing'], inventory)) {
            const thingCreateInputType = createThingCreateInputType(thingConfig);
            prev.push(thingCreateInputType);
          }
          if (checkInventory(['Mutation', 'pushIntoThing', name], inventory)) {
            const pushIntoThingInputType = createPushIntoThingInputType(thingConfig);
            if (pushIntoThingInputType) prev.push(pushIntoThingInputType);
          }
          // not check Inventory because may use not only for updateThing mutation ...
          // ... but for embedded & file fields
          const thingUpdateInputType = createThingUpdateInputType(thingConfig);
          prev.push(thingUpdateInputType);
          if (checkInventory(['Mutation', 'uploadFilesToThing', name], inventory)) {
            const filesOfThingOptionsInputType = createFilesOfThingOptionsInputType(thingConfig);
            const uploadFilesToThingInputType = createUploadFilesToThingInputType(thingConfig);
            if (filesOfThingOptionsInputType) {
              prev.push(filesOfThingOptionsInputType);
              prev.push(uploadFilesToThingInputType);
            }
          }
          return prev;
        }, [])
        .join('\n')
    : '';

  const customInputObjectNames = Object.keys(customInputObject);
  const input = true;
  const thingInputTypes2 = Object.keys(thingConfigs)
    .map((thingName) => thingConfigs[thingName])
    .filter(({ embedded }) => !embedded)
    .reduce((prev, thingConfig) => {
      const { name } = thingConfig;
      if (
        checkInventory(['Query', 'thing', name], inventory) ||
        checkInventory(['Mutation', 'updateThing', name], inventory) ||
        checkInventory(['Mutation', 'deleteThing', name], inventory)
      ) {
        const thingWhereOneInputType = createThingWhereOneInputType(thingConfig);
        prev.push(thingWhereOneInputType);
      }
      if (
        checkInventory(['Query', 'things', name], inventory) ||
        checkInventory(['Query', 'thingCount', name], inventory)
      ) {
        prev.push(createThingWhereInputType(thingConfig));
        const thingSortInputType = createThingSortInputType(thingConfig);
        if (thingSortInputType) prev.push(thingSortInputType);
        const thingPaginationInputType = createThingPaginationInputType(thingConfig);
        if (thingPaginationInputType) prev.push(thingPaginationInputType);
        const thingNearInputType = createThingNearInputType(thingConfig);
        if (thingNearInputType) prev.push(thingNearInputType);
      }

      customInputObjectNames.forEach((customName) => {
        const customInputType = composeObjectSignature(
          customInputObject[customName],
          thingConfig,
          generalConfig,
          input,
        );
        if (customInputType) prev.push(customInputType);
      });

      return prev;
    }, [])
    .join('\n');

  const thingQueryTypes = [];
  if (allowQueries) {
    const customQueryNames = Object.keys(customQuery);

    Object.keys(thingConfigs)
      .map((thingName) => thingConfigs[thingName])
      .filter(({ embedded }) => !embedded)
      .reduce((prev, thingConfig) => {
        const { name } = thingConfig;
        if (checkInventory(['Query', 'thing', name], inventory)) {
          prev.push(createThingQueryType(thingConfig));
        }
        if (checkInventory(['Query', 'things', name], inventory)) {
          prev.push(createThingsQueryType(thingConfig));
        }
        if (checkInventory(['Query', 'thingCount', name], inventory)) {
          prev.push(createThingCountQueryType(thingConfig));
        }

        customQueryNames.forEach((customName) => {
          if (checkInventory(['Query', customName, name], inventory)) {
            prev.push(
              `  ${composeActionSignature(customQuery[customName], thingConfig, generalConfig)}`,
            );
          }
        });

        return prev;
      }, thingQueryTypes);
  }

  const thingQueryTypes2 = thingQueryTypes.length
    ? `type Query {
${thingQueryTypes.join('\n')}
}`
    : '';

  const thingMutationTypes = [];
  if (allowMutations) {
    const customMutationNames = Object.keys(customMutation);

    Object.keys(thingConfigs)
      .map((thingName) => thingConfigs[thingName])
      .filter(({ embedded }) => !embedded)
      .reduce((prev, thingConfig) => {
        const { name } = thingConfig;
        if (checkInventory(['Mutation', 'createThing', name], inventory)) {
          prev.push(createCreateThingMutationType(thingConfig));

          if (checkInventory(['Mutation', 'createManyThings', name], inventory)) {
            prev.push(createCreateManyThingsMutationType(thingConfig));
          }

          if (checkInventory(['Mutation', 'importThings', name], inventory)) {
            prev.push(createImportThingsMutationType(thingConfig));
          }
        }
        if (checkInventory(['Mutation', 'pushIntoThing', name], inventory)) {
          const pushIntoThingMutationType = createPushIntoThingMutationType(thingConfig);
          if (pushIntoThingMutationType) prev.push(pushIntoThingMutationType);
        }
        if (checkInventory(['Mutation', 'updateThing', name], inventory)) {
          prev.push(createUpdateThingMutationType(thingConfig));
        }
        if (checkInventory(['Mutation', 'deleteThing', name], inventory)) {
          prev.push(createDeleteThingMutationType(thingConfig));
        }
        if (checkInventory(['Mutation', 'uploadFilesToThing', name], inventory)) {
          const uploadFilesToThingMutationType = createUploadFilesToThingMutationType(thingConfig);
          if (uploadFilesToThingMutationType) prev.push(uploadFilesToThingMutationType);
        }

        customMutationNames.forEach((customName) => {
          if (checkInventory(['Mutation', customName, name], inventory)) {
            prev.push(
              `  ${composeActionSignature(customMutation[customName], thingConfig, generalConfig)}`,
            );
          }
        });

        return prev;
      }, thingMutationTypes);
  }

  const thingMutationTypes2 = thingMutationTypes.length
    ? `type Mutation {
${thingMutationTypes.join('\n')}
}`
    : '';

  const updatedThingPayloadTypes = allowSubscriptions
    ? Object.keys(thingConfigs)
        .map((thingName) => thingConfigs[thingName])
        .filter(({ embedded }) => !embedded)
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
        .filter(({ embedded }) => !embedded)
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
  const resultArray = ['scalar DateTime'];

  const enumTypes = composeEnumTypes(generalConfig);
  if (enumTypes) resultArray.push(enumTypes);

  const geospatialTypes = composeGeospatialTypes(generalConfig);
  if (geospatialTypes) resultArray.push(geospatialTypes);

  const importOptionsInputTypes = composeImportOptionsInputTypes(generalConfig);
  if (importOptionsInputTypes) resultArray.push(importOptionsInputTypes);

  resultArray.push(thingTypes);

  if (thingInputTypes) resultArray.push(thingInputTypes);
  if (thingInputTypes2) resultArray.push(thingInputTypes2);
  if (updatedThingPayloadTypes) resultArray.push(updatedThingPayloadTypes);
  if (thingQueryTypes2) resultArray.push(thingQueryTypes2);
  if (thingMutationTypes2) resultArray.push(thingMutationTypes2);
  if (thingSubscriptionTypes2) resultArray.push(thingSubscriptionTypes2);

  return resultArray.join('\n');
};

export default composeGqlTypes;
