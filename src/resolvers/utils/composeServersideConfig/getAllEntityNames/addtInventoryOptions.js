// @flow

import type { SimplifiedInventoryOptions } from '../../../../flowTypes';

const add = (obj, obj2, result) =>
  Object.keys(obj).forEach((key) => {
    if (result[key]) {
      return;
    }

    result[key] = obj[key]; // eslint-disable-line no-param-reassign

    obj2[key]?.forEach((name) => {
      if (!result[key].includes(name)) {
        result[key].push(name);
      }
    });
  });

const addtInventoryOptions = (
  include: SimplifiedInventoryOptions,
  include2: SimplifiedInventoryOptions,
): SimplifiedInventoryOptions => {
  const { Query: includeQueries, Mutation: includeMutations } = include;
  const { Query: include2Queries, Mutation: include2Mutations } = include2;

  const Query = {};
  add(includeQueries, include2Queries, Query);
  add(include2Queries, includeQueries, Query);

  const Mutation = {};
  add(includeMutations, include2Mutations, Mutation);
  add(include2Mutations, includeMutations, Mutation);

  return { Query, Mutation };
};
export default addtInventoryOptions;
