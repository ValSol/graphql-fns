// @flow
import type { Custom, GeneralConfig } from '../../flowTypes';

import thingCountQueryAttributes from '../../types/actionAttributes/thingCountQueryAttributes';
import thingDistinctValuesQueryAttributes from '../../types/actionAttributes/thingDistinctValuesQueryAttributes';
import thingFileCountQueryAttributes from '../../types/actionAttributes/thingFileCountQueryAttributes';
import thingFileQueryAttributes from '../../types/actionAttributes/thingFileQueryAttributes';
import thingFilesQueryAttributes from '../../types/actionAttributes/thingFilesQueryAttributes';
import thingQueryAttributes from '../../types/actionAttributes/thingQueryAttributes';
import thingsQueryAttributes from '../../types/actionAttributes/thingsQueryAttributes';

import createManyThingsMutationAttributes from '../../types/actionAttributes/createManyThingsMutationAttributes';
import createThingMutationAttributes from '../../types/actionAttributes/createThingMutationAttributes';
import deleteThingMutationAttributes from '../../types/actionAttributes/deleteThingMutationAttributes';
import importThingsMutationAttributes from '../../types/actionAttributes/importThingsMutationAttributes';
import pushIntoThingMutationAttributes from '../../types/actionAttributes/pushIntoThingMutationAttributes';
import updateThingMutationAttributes from '../../types/actionAttributes/updateThingMutationAttributes';
import uploadFilesToThingMutationAttributes from '../../types/actionAttributes/uploadFilesToThingMutationAttributes';
import uploadThingFilesMutationAttributes from '../../types/actionAttributes/uploadThingFilesMutationAttributes';
import composeCustomAction from './composeCustomAction';

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
      prev[`thing${suffix}`] = composeCustomAction(derivative[suffix], thingQueryAttributes);
    }
    if (allowedMethods.things) {
      // eslint-disable-next-line no-param-reassign
      prev[`things${suffix}`] = composeCustomAction(derivative[suffix], thingsQueryAttributes);
    }
    if (allowedMethods.thingCount) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingCount${suffix}`] = composeCustomAction(
        derivative[suffix],
        thingCountQueryAttributes,
      );
    }
    if (allowedMethods.thingCount) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingDistinctValues${suffix}`] = composeCustomAction(
        derivative[suffix],
        thingDistinctValuesQueryAttributes,
      );
    }
    if (allowedMethods.thingFileCount) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingFileCount${suffix}`] = composeCustomAction(
        derivative[suffix],
        thingFileCountQueryAttributes,
      );
    }
    if (allowedMethods.thingFile) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingFile${suffix}`] = composeCustomAction(
        derivative[suffix],
        thingFileQueryAttributes,
      );
    }
    if (allowedMethods.thingFiles) {
      // eslint-disable-next-line no-param-reassign
      prev[`thingFiles${suffix}`] = composeCustomAction(
        derivative[suffix],
        thingFilesQueryAttributes,
      );
    }

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);

    if (allowedMethods.createManyThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`createManyThings${suffix}`] = composeCustomAction(
        derivative[suffix],
        createManyThingsMutationAttributes,
      );
    }
    if (allowedMethods.createThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`createThing${suffix}`] = composeCustomAction(
        derivative[suffix],
        createThingMutationAttributes,
      );
    }
    if (allowedMethods.deleteThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`deleteThing${suffix}`] = composeCustomAction(
        derivative[suffix],
        deleteThingMutationAttributes,
      );
    }
    if (allowedMethods.importThings) {
      // eslint-disable-next-line no-param-reassign
      prev[`importThings${suffix}`] = composeCustomAction(
        derivative[suffix],
        importThingsMutationAttributes,
      );
    }
    if (allowedMethods.pushIntoThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`pushIntoThing${suffix}`] = composeCustomAction(
        derivative[suffix],
        pushIntoThingMutationAttributes,
      );
    }
    if (allowedMethods.updateThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`updateThing${suffix}`] = composeCustomAction(
        derivative[suffix],
        updateThingMutationAttributes,
      );
    }
    if (allowedMethods.uploadFilesToThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`uploadFilesToThing${suffix}`] = composeCustomAction(
        derivative[suffix],
        uploadFilesToThingMutationAttributes,
      );
    }
    if (allowedMethods.uploadThingFiles) {
      // eslint-disable-next-line no-param-reassign
      prev[`uploadThingFiles${suffix}`] = composeCustomAction(
        derivative[suffix],
        uploadThingFilesMutationAttributes,
      );
    }
    return prev;
  }, {});

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
