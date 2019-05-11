// @flow

import type { GeneralConfig } from '../flowTypes';

const checkInventory = require('../utils/checkInventory');
const createThingType = require('./createThingType');
const createThingCreateInputType = require('./inputs/createThingCreateInputType');
const createThingPaginationInputType = require('./inputs/createThingPaginationInputType');
const createThingUpdateInputType = require('./inputs/createThingUpdateInputType');
const createThingNearInputType = require('./inputs/createThingNearInputType');
const createThingSortInputType = require('./inputs/createThingSortInputType');
const createThingWhereInputType = require('./inputs/createThingWhereInputType');
const createThingWhereOneInputType = require('./inputs/createThingWhereOneInputType');
const createThingQueryType = require('./queries/createThingQueryType');
const createThingsQueryType = require('./queries/createThingsQueryType');
const createCreateThingMutationType = require('./mutations/createCreateThingMutationType');
const createUpdateThingMutationType = require('./mutations/createUpdateThingMutationType');
const createDeleteThingMutationType = require('./mutations/createDeleteThingMutationType');
const createThingSubscriptionType = require('./subscriptions/createThingSubscriptionType');
const createThingSubscriptionPayloadType = require('./subscriptions/createThingSubscriptionPayloadType');

const composeEnumTypes = require('./specialized/composeEnumTypes');
const composeGeospatialTypes = require('./specialized/composeGeospatialTypes');

const composeGqlTypes = (generalConfig: GeneralConfig): string => {
  const { thingConfigs, inventory } = generalConfig;

  const allowQueries = checkInventory(['Query'], inventory);
  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

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
      if (checkInventory(['Query', 'things', name], inventory)) {
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

  const thingQueryTypes = allowQueries
    ? thingConfigs
        .filter(({ embedded }) => !embedded)
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          if (checkInventory(['Query', 'thing', name], inventory)) {
            prev.push(createThingQueryType(thingConfig));
          }
          if (checkInventory(['Query', 'things', name], inventory)) {
            prev.push(createThingsQueryType(thingConfig));
          }
          return prev;
        }, [])
        .join('\n')
    : '';
  const thingQueryTypes2 = allowQueries
    ? `type Query {
${thingQueryTypes}
}`
    : '';

  const thingMutationTypes = allowMutations
    ? thingConfigs
        .filter(({ embedded }) => !embedded)
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          if (checkInventory(['Mutation', 'createThing', name], inventory)) {
            prev.push(createCreateThingMutationType(thingConfig));
          }
          if (checkInventory(['Mutation', 'updateThing', name], inventory)) {
            prev.push(createUpdateThingMutationType(thingConfig));
          }
          if (checkInventory(['Mutation', 'deleteThing', name], inventory)) {
            prev.push(createDeleteThingMutationType(thingConfig));
          }
          return prev;
        }, [])
        .join('\n')
    : '';
  const thingMutationTypes2 = allowMutations
    ? `type Mutation {
${thingMutationTypes}
}`
    : '';

  const thingSubscriptionPayloadTypes = allowSubscriptions
    ? thingConfigs
        .filter(({ embedded }) => !embedded)
        .reduce((prev, thingConfig) => {
          const { name } = thingConfig;
          if (
            checkInventory(['Subscription', 'thingSubscription', name], inventory) &&
            (checkInventory(['Mutation', 'createThing', name], inventory) ||
              checkInventory(['Mutation', 'updateThing', name], inventory) ||
              checkInventory(['Mutation', 'deleteThing', name], inventory))
          ) {
            prev.push(createThingSubscriptionPayloadType(thingConfig));
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
            checkInventory(['Subscription', 'thingSubscription', name], inventory) &&
            (checkInventory(['Mutation', 'createThing', name], inventory) ||
              checkInventory(['Mutation', 'updateThing', name], inventory) ||
              checkInventory(['Mutation', 'deleteThing', name], inventory))
          ) {
            prev.push(createThingSubscriptionType(thingConfig));
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

  resultArray.push(thingTypes);

  if (thingInputTypes) resultArray.push(thingInputTypes);
  if (thingInputTypes2) resultArray.push(thingInputTypes2);
  if (thingSubscriptionPayloadTypes) resultArray.push(thingSubscriptionPayloadTypes);
  if (thingQueryTypes2) resultArray.push(thingQueryTypes2);
  if (thingMutationTypes2) resultArray.push(thingMutationTypes2);
  if (thingSubscriptionTypes2) resultArray.push(thingSubscriptionTypes2);

  return resultArray.join('\n');
};

module.exports = composeGqlTypes;
