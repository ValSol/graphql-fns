// @flow
import type { GeneralConfig } from '../../../flowTypes';

import createThingQueryResolver from '../../queries/createThingQueryResolver';
import createThingsQueryResolver from '../../queries/createThingsQueryResolver';

import createCreateThingMutationResolver from '../../mutations/createCreateThingMutationResolver';
import createCreateManyThingsMutationResolver from '../../mutations/createCreateManyThingsMutationResolver';
import createImportThingsMutationResolver from '../../mutations/createImportThingsMutationResolver';
import createPushIntoThingMutationResolver from '../../mutations/createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from '../../mutations/createUpdateThingMutationResolver';
import createUploadFilesToThingMutationResolver from '../../mutations/createUploadFilesToThingMutationResolver';

import createResolverCreator from './createResolverCreator';

const store = {};

const getAllowedMethods = (allow) =>
  Object.keys(allow).reduce((prev, thingName) => {
    allow[thingName].forEach((methodName) => {
      prev[methodName] = true; // eslint-disable-line no-param-reassign
    });
    return prev;
  }, {});

const generateDerivativeResolvers = (
  generalConfig: GeneralConfig,
): null | {
  Query: { [queryResolverCreator: string]: Function },
  Mutation: { [mutationResolverCreator: string]: Function },
} => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.cache) return store.cache;

  const { derivative } = generalConfig;

  if (!derivative) return null;

  const Query = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);
    if (allowedMethods.thing) {
      // eslint-disable-next-line no-param-reassign
      prev[`thing${suffix}`] = createResolverCreator('thing', createThingQueryResolver);
    }
    if (allowedMethods.things) {
      // eslint-disable-next-line no-param-reassign
      prev[`things${suffix}`] = createResolverCreator('things', createThingsQueryResolver);
    }

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);
    if (allowedMethods.createThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`createThing${suffix}`] = createResolverCreator(
        'createThing',
        createCreateThingMutationResolver,
      );
    }
    if (allowedMethods.createManyThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`createManyThings${suffix}`] = createResolverCreator(
        'createManyThings',
        createCreateManyThingsMutationResolver,
      );
    }
    if (allowedMethods.importThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`importThings${suffix}`] = createResolverCreator(
        'importThings',
        createImportThingsMutationResolver,
      );
    }
    if (allowedMethods.pushIntoThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`pushIntoThing${suffix}`] = createResolverCreator(
        'pushIntoThing',
        createPushIntoThingMutationResolver,
      );
    }
    if (allowedMethods.updateThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`updateThing${suffix}`] = createResolverCreator(
        'updateThing',
        createUpdateThingMutationResolver,
      );
    }
    if (allowedMethods.uploadFilesToThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`uploadFilesToThing${suffix}`] = createResolverCreator(
        'uploadFilesToThing',
        createUploadFilesToThingMutationResolver,
      );
    }
    return prev;
  }, {});

  store.cache = { Query, Mutation };

  return store.cache;
};

export default generateDerivativeResolvers;
