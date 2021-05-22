// @flow
import type { GeneralConfig } from '../../../flowTypes';

import queries from '../../queries';
import mutations from '../../mutations';
import createResolverCreator from './createResolverCreator';

const store = Object.create(null);

const getAllowedActions = (allow) =>
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
    const allowedActions = getAllowedActions(allow);

    Object.keys(queries).forEach((actionName) => {
      if (allowedActions[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[`${actionName}${suffix}`] = createResolverCreator(actionName, queries[actionName]);
      }
    });

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    const allowedActions = getAllowedActions(allow);

    Object.keys(mutations).forEach((actionName) => {
      if (allowedActions[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[`${actionName}${suffix}`] = createResolverCreator(actionName, mutations[actionName]);
      }
    });

    return prev;
  }, {});

  store.cache = { Query, Mutation };

  return store.cache;
};

export default generateDerivativeResolvers;
