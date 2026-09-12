import type { GeneralConfig } from '../../../tsTypes';

import queries from '../../queries';
import mutations from '../../mutations';
import createResolverCreator from './createResolverCreator';

const store = Object.create(null);

const getAllowedActions = (allow) =>
  Object.keys(allow).reduce<Record<string, any>>((prev, entityName) => {
    allow[entityName].forEach((methodName) => {
      prev[methodName] = true;
    });
    return prev;
  }, {});

const generateRepresentationResolvers = (
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

  const { representation } = generalConfig;

  if (!representation) return null;

  const Query = Object.keys(representation).reduce<Record<string, any>>(
    (prev, representationKey) => {
      const { allow } = representation[representationKey];
      const allowedActions = getAllowedActions(allow);

      Object.keys(queries).forEach((actionName) => {
        if (allowedActions[actionName]) {
          prev[`${actionName}${representationKey}`] = createResolverCreator(
            actionName,
            queries[actionName],
          );
        }
      });

      return prev;
    },
    {},
  );

  const Mutation = Object.keys(representation).reduce<Record<string, any>>(
    (prev, representationKey) => {
      const { allow } = representation[representationKey];
      const allowedActions = getAllowedActions(allow);

      Object.keys(mutations).forEach((actionName) => {
        if (allowedActions[actionName]) {
          prev[`${actionName}${representationKey}`] = createResolverCreator(
            actionName,
            mutations[actionName],
          );
        }
      });

      return prev;
    },
    {},
  );

  store.cache = { Query, Mutation };

  return store.cache;
};

export default generateRepresentationResolvers;
