// @flow
import type { Custom, GeneralConfig } from '../../flowTypes';

import composeCustomAction from './composeCustomAction';

import { mutationAttributes, queryAttributes } from '../../types/actionAttributes';

const forClientActions = ['childEntity', 'childEntities'];

const store = Object.create(null);

const mergeDerivativeIntoCustom = (
  generalConfig: GeneralConfig,
  forClient?: boolean,
): null | Custom => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.cache) return store.cache;

  const { custom, derivative } = generalConfig;

  if (!derivative) return custom || null;

  const getAllowedMethods = (allow) =>
    Object.keys(allow).reduce((prev, entityName) => {
      allow[entityName].forEach((methodName) => {
        prev[methodName] = true; // eslint-disable-line no-param-reassign
      });
      return prev;
    }, {});

  const Query = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);

    Object.keys(queryAttributes).forEach((actionName) => {
      if ((!forClientActions.includes(actionName) || !forClient) && allowedMethods[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[queryAttributes[actionName].actionGeneralName(suffix)] = composeCustomAction(
          derivative[suffix],
          queryAttributes[actionName],
        );
      }
    });

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedMethods = getAllowedMethods(allow);

    Object.keys(mutationAttributes).forEach((actionName) => {
      if (allowedMethods[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[mutationAttributes[actionName].actionGeneralName(suffix)] = composeCustomAction(
          derivative[suffix],
          mutationAttributes[actionName],
        );
      }
    });

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
