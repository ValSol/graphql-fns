// @flow

import type { GeneralConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import composeSignature from './composeSignature';
import createThingType from './createThingType';
import createThingCreateInputType from './inputs/createThingCreateInputType';
import createThingPaginationInputType from './inputs/createThingPaginationInputType';
import createThingUpdateInputType from './inputs/createThingUpdateInputType';
import createThingNearInputType from './inputs/createThingNearInputType';
import createThingSortInputType from './inputs/createThingSortInputType';
import createThingWhereInputType from './inputs/createThingWhereInputType';
import createThingWhereOneInputType from './inputs/createThingWhereOneInputType';
import createThingCountQueryType from './queries/createThingCountQueryType';
import createThingQueryType from './queries/createThingQueryType';
import createThingsQueryType from './queries/createThingsQueryType';
import createCreateManyThingsMutationType from './mutations/createCreateManyThingsMutationType';
import createCreateThingMutationType from './mutations/createCreateThingMutationType';
import createImportThingsMutationType from './mutations/createImportThingsMutationType';
import createUpdateThingMutationType from './mutations/createUpdateThingMutationType';
import createDeleteThingMutationType from './mutations/createDeleteThingMutationType';
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
  const customQuery = custom ? (custom.Query ? custom.Query : {}) : {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom ? (custom.Mutation ? custom.Mutation : {}) : {};

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = allowMutations && checkInventory(['Subscription'], inventory);

  const thingTypes = thingConfigs.map(thingConfig => createThingType(thingConfig)).join('\n');

  const thingInputTypes = allowMutations
    ? thingConfigs
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          // use ['Mutation', 'createThing'] not ['Mutation', 'updateThing', name] ...
          // ... to let creation of children things of other types
          if (checkInventory(['Mutation', 'createThing'], inventory)) {
            const thingCreateInputType = createThingCreateInputType(thingConfig);
            prev.push(thingCreateInputType);
          }
          if (checkInventory(['Mutation', 'updateThing', name], inventory)) {
            const thingUpdateInputType = createThingUpdateInputType(thingConfig);
            prev.push(thingUpdateInputType);
          }
          return prev;
        }, [])
        .join('\n')
    : '';

  const thingInputTypes2 = thingConfigs
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
        const thingWhereInputType = createThingWhereInputType(thingConfig);
        if (thingWhereInputType) prev.push(thingWhereInputType);
        const thingSortInputType = createThingSortInputType(thingConfig);
        if (thingSortInputType) prev.push(thingSortInputType);
        const thingPaginationInputType = createThingPaginationInputType(thingConfig);
        if (thingPaginationInputType) prev.push(thingPaginationInputType);
        const thingNearInputType = createThingNearInputType(thingConfig);
        if (thingNearInputType) prev.push(thingNearInputType);
      }
      return prev;
    }, [])
    .join('\n');

  const thingQueryTypes = [];
  if (allowQueries) {
    const customQueryNames = Object.keys(customQuery);

    thingConfigs
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

        customQueryNames.forEach(customName => {
          if (checkInventory(['Query', customName, name], inventory)) {
            prev.push(`  ${composeSignature(customQuery[customName], thingConfig, generalConfig)}`);
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

    thingConfigs
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
        if (checkInventory(['Mutation', 'updateThing', name], inventory)) {
          prev.push(createUpdateThingMutationType(thingConfig));
        }
        if (checkInventory(['Mutation', 'deleteThing', name], inventory)) {
          prev.push(createDeleteThingMutationType(thingConfig));
        }

        customMutationNames.forEach(customName => {
          if (checkInventory(['Mutation', customName, name], inventory)) {
            prev.push(
              `  ${composeSignature(customMutation[customName], thingConfig, generalConfig)}`,
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
    ? thingConfigs
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
    ? thingConfigs
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
