import type { SimplifiedInventoryOptions } from '@/tsTypes';

const subtructInventoryOptions = (
  include: SimplifiedInventoryOptions,
  exclude: SimplifiedInventoryOptions,
): SimplifiedInventoryOptions => {
  const {
    Query: includeQueries,
    Mutation: includeMutations,
    Subscription: includeSubscriptions,
  } = include;
  const {
    Query: excludeQueries,
    Mutation: excludeMutations,
    Subscription: excludeSubscriptions,
  } = exclude;

  const Query = Object.keys(includeQueries).reduce<Record<string, any>>((prev, actionName) => {
    if (excludeQueries?.[actionName]) {
      const rest = includeQueries[actionName].filter(
        (entityName) => !excludeQueries[actionName].includes(entityName),
      );

      if (rest.length) {
        prev[actionName] = rest;
      }
    } else {
      prev[actionName] = includeQueries[actionName];
    }
    return prev;
  }, {});

  const Mutation = Object.keys(includeMutations).reduce<Record<string, any>>((prev, actionName) => {
    if (excludeMutations?.[actionName]) {
      const rest = includeMutations[actionName].filter(
        (entityName) => !excludeMutations[actionName].includes(entityName),
      );

      if (rest.length) {
        prev[actionName] = rest;
      }
    } else {
      prev[actionName] = includeMutations[actionName];
    }
    return prev;
  }, {});

  const Subscription = Object.keys(includeSubscriptions).reduce<Record<string, any>>(
    (prev, actionName) => {
      if (excludeSubscriptions?.[actionName]) {
        const rest = includeSubscriptions[actionName].filter(
          (entityName) => !excludeSubscriptions[actionName].includes(entityName),
        );

        if (rest.length) {
          prev[actionName] = rest;
        }
      } else {
        prev[actionName] = includeSubscriptions[actionName];
      }
      return prev;
    },
    {},
  );

  return { Query, Mutation, Subscription };
};
export default subtructInventoryOptions;
