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
    if (allow.thing) {
      // eslint-disable-next-line no-param-reassign
      prev[`thing${suffix}`] = createResolverCreator('thing', createThingQueryResolver);
    }
    if (allow.things) {
      // eslint-disable-next-line no-param-reassign
      prev[`things${suffix}`] = createResolverCreator('things', createThingsQueryResolver);
    }

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    if (allow.createThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`createThing${suffix}`] = createResolverCreator(
        'createThing',
        createCreateThingMutationResolver,
      );
    }
    if (allow.createManyThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`createManyThings${suffix}`] = createResolverCreator(
        'createManyThings',
        createCreateManyThingsMutationResolver,
      );
    }
    if (allow.importThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`importThings${suffix}`] = createResolverCreator(
        'importThings',
        createImportThingsMutationResolver,
      );
    }
    if (allow.pushIntoThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`pushIntoThing${suffix}`] = createResolverCreator(
        'pushIntoThing',
        createPushIntoThingMutationResolver,
      );
    }
    if (allow.updateThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`updateThing${suffix}`] = createResolverCreator(
        'updateThing',
        createUpdateThingMutationResolver,
      );
    }
    if (allow.uploadFilesToThing) {
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
