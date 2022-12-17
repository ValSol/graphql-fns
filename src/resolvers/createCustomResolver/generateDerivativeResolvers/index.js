// @flow
import type { GeneralConfig } from '../../../flowTypes';

import queries from '../../queries';
import mutations from '../../mutations';
import createResolverCreator from './createResolverCreator';

const store = Object.create(null);

const getAllowedActions = (allow) =>
  Object.keys(allow).reduce((prev, entityName) => {
    allow[entityName].forEach((methodName) => {
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

  const Query = Object.keys(derivative).reduce((prev, derivativeKey) => {
    const { allow } = derivative[derivativeKey];
    const allowedActions = getAllowedActions(allow);

    Object.keys(queries).forEach((actionName) => {
      if (allowedActions[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[`${actionName}${derivativeKey}`] = createResolverCreator(
          actionName,
          queries[actionName],
        );
      }
    });

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, derivativeKey) => {
    const { allow } = derivative[derivativeKey];
    const allowedActions = getAllowedActions(allow);

    Object.keys(mutations).forEach((actionName) => {
      if (allowedActions[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[`${actionName}${derivativeKey}`] = createResolverCreator(
          actionName,
          mutations[actionName],
        );
      }
    });

    return prev;
  }, {});

  store.cache = { Query, Mutation };

  return store.cache;
};

export default generateDerivativeResolvers;
