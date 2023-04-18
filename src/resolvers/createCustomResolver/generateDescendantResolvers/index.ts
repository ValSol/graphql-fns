import type { GeneralConfig } from '../../../tsTypes';

import queries from '../../queries';
import mutations from '../../mutations';
import createResolverCreator from './createResolverCreator';

const store = Object.create(null);

const getAllowedActions = (allow) =>
  Object.keys(allow).reduce<Record<string, any>>((prev, entityName) => {
    allow[entityName].forEach((methodName) => {
      prev[methodName] = true; // eslint-disable-line no-param-reassign
    });
    return prev;
  }, {});

const generateDescendantResolvers = (
  generalConfig: GeneralConfig,
): null | {
  Query: {
    [queryResolverCreator: string]: any;
  };
  Mutation: {
    [mutationResolverCreator: string]: any;
  };
} => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.cache) return store.cache;

  const { descendant } = generalConfig;

  if (!descendant) return null;

  const Query = Object.keys(descendant).reduce<Record<string, any>>((prev, descendantKey) => {
    const { allow } = descendant[descendantKey];
    const allowedActions = getAllowedActions(allow);

    Object.keys(queries).forEach((actionName) => {
      if (allowedActions[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[`${actionName}${descendantKey}`] = createResolverCreator(
          actionName,
          queries[actionName],
        );
      }
    });

    return prev;
  }, {});

  const Mutation = Object.keys(descendant).reduce<Record<string, any>>((prev, descendantKey) => {
    const { allow } = descendant[descendantKey];
    const allowedActions = getAllowedActions(allow);

    Object.keys(mutations).forEach((actionName) => {
      if (allowedActions[actionName]) {
        // eslint-disable-next-line no-param-reassign
        prev[`${actionName}${descendantKey}`] = createResolverCreator(
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

export default generateDescendantResolvers;
