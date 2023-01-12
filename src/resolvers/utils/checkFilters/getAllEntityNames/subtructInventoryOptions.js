// @flow

import type { SimplifiedInventoryOptions } from '../../../../flowTypes';

const subtructInventoryOptions = (
  include: SimplifiedInventoryOptions,
  exclude: SimplifiedInventoryOptions,
): SimplifiedInventoryOptions => {
  const { Query: includeQueries, Mutation: includeMutations } = include;
  const { Query: excludeQueries, Mutation: excludeMutations } = exclude;

  const Query = Object.keys(includeQueries).reduce((prev, actionName) => {
    if (excludeQueries?.[actionName]) {
      const rest = includeQueries[actionName].filter(
        (entityName) => !excludeQueries[actionName].includes(entityName),
      );

      if (rest.length) {
        prev[actionName] = rest; // eslint-disable-line no-param-reassign
      }
    } else {
      prev[actionName] = includeQueries[actionName]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  const Mutation = Object.keys(includeMutations).reduce((prev, actionName) => {
    if (excludeMutations?.[actionName]) {
      const rest = includeMutations[actionName].filter(
        (entityName) => !excludeMutations[actionName].includes(entityName),
      );

      if (rest.length) {
        prev[actionName] = rest; // eslint-disable-line no-param-reassign
      }
    } else {
      prev[actionName] = includeMutations[actionName]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  return { Query, Mutation };
};
export default subtructInventoryOptions;
