// @flow
import type { Custom, GeneralConfig } from '../../flowTypes';

import composeDerivativeThingCountQuery from './composeDerivativeThingCountQuery';
import composeDerivativeThingDistinctValuesQuery from './composeDerivativeThingDistinctValuesQuery';
import composeDerivativeThingQuery from './composeDerivativeThingQuery';
import composeDerivativeThingsQuery from './composeDerivativeThingsQuery';

import composeDerivativeCreateManyThingsMutation from './composeDerivativeCreateManyThingsMutation';
import composeDerivativeCreateThingMutation from './composeDerivativeCreateThingMutation';
import composeDerivativeDeleteThingsMutation from './composeDerivativeDeleteThingsMutation';
import composeDerivativeImportThingsMutation from './composeDerivativeImportThingsMutation';
import composeDerivativePushIntoThingMutation from './composeDerivativePushIntoThingMutation';
import composeDerivativeUpdateThingMutation from './composeDerivativeUpdateThingMutation';
import composeDerivativeUploadFilesToThing from './composeDerivativeUploadFilesToThing';

const store = {};

const mergeDerivativeIntoCustom = (generalConfig: GeneralConfig): null | Custom => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.cache) return store.cache;

  const { custom, derivative } = generalConfig;

  if (!derivative) return custom || null;

  const getAllowedMethods = (allow) =>
    Object.keys(allow).reduce((prev, thingName) => {
      allow[thingName].forEach((methodName) => {
        prev[methodName] = true; // eslint-disable-line no-param-reassign
      });
      return prev;
    }, {});

  const Query = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);

    if (allowedMethods.thing) {
      // eslint-disable-next-line no-param-reassign
      prev[`thing${suffix}`] = composeDerivativeThingQuery(derivative[suffix]);
    }
    if (allowedMethods.things) {
      // eslint-disable-next-line no-param-reassign
      prev[`things${suffix}`] = composeDerivativeThingsQuery(derivative[suffix]);
    }
    if (allowedMethods.thingCount) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingCount${suffix}`] = composeDerivativeThingCountQuery(derivative[suffix]);
    }
    if (allowedMethods.thingCount) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingDistinctValues${suffix}`] = composeDerivativeThingDistinctValuesQuery(
        derivative[suffix],
      );
    }

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);

    if (allowedMethods.createManyThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`createManyThings${suffix}`] = composeDerivativeCreateManyThingsMutation(
        derivative[suffix],
      );
    }
    if (allowedMethods.createThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`createThing${suffix}`] = composeDerivativeCreateThingMutation(derivative[suffix]);
    }
    if (allowedMethods.deleteThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`deleteThing${suffix}`] = composeDerivativeDeleteThingsMutation(derivative[suffix]);
    }
    if (allowedMethods.importThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`importThings${suffix}`] = composeDerivativeImportThingsMutation(derivative[suffix]);
    }
    if (allowedMethods.pushIntoThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`pushIntoThing${suffix}`] = composeDerivativePushIntoThingMutation(derivative[suffix]);
    }
    if (allowedMethods.updateThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`updateThing${suffix}`] = composeDerivativeUpdateThingMutation(derivative[suffix]);
    }
    if (allowedMethods.uploadFilesToThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`uploadFilesToThing${suffix}`] = composeDerivativeUploadFilesToThing(derivative[suffix]);
    }
    return prev;
  }, {});

  // TODO Input that take into account the changes in derivative config
  // ----
  // const Input = Object.keys(derivative).reduce((prev, suffix) => {
  //   const { allow } = derivative[suffix];
  //   if (allow.pushIntoThing) {
  //     // eslint-disable-next-line no-param-reassign
  //     prev[`PushIntoThing${suffix}Input`] = composeDerivativePushIntoThingInput(derivative[suffix]);
  //   }
  //   return prev;
  // }, {});

  if (!custom) {
    store.cache = { Query, Mutation /* Input */ };
  } else {
    store.cache = {
      ...custom,
      Query: { ...Query, ...custom.Query },
      Mutation: { ...Mutation, ...custom.Mutation },
      // Input: { ...Input, ...custom.Input },
    };
  }

  return store.cache;
};

export default mergeDerivativeIntoCustom;
