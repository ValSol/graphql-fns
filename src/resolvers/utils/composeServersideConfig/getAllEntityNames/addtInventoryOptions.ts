import type { SimplifiedInventoryOptions } from '@/tsTypes';

const add = (
  obj: {
    [queryName: string]: Array<string>;
  },
  obj2: {
    [queryName: string]: Array<string>;
  },
  result: Record<any, any>,
) =>
  Object.keys(obj).forEach((key) => {
    if (result[key]) {
      return;
    }

    result[key] = obj[key];

    obj2[key]?.forEach((name: string) => {
      if (!result[key].includes(name)) {
        result[key].push(name);
      }
    });
  });

const addtInventoryOptions = (
  include: SimplifiedInventoryOptions,
  include2: SimplifiedInventoryOptions,
): SimplifiedInventoryOptions => {
  const {
    Query: includeQueries,
    Mutation: includeMutations,
    Subscription: includeSubscriptions,
  } = include;
  const {
    Query: include2Queries,
    Mutation: include2Mutations,
    Subscription: include2Subscriptions,
  } = include2;

  const Query: Record<string, any> = {};
  add(includeQueries, include2Queries, Query);
  add(include2Queries, includeQueries, Query);

  const Mutation: Record<string, any> = {};
  add(includeMutations, include2Mutations, Mutation);
  add(include2Mutations, includeMutations, Mutation);

  const Subscription: Record<string, any> = {};
  add(includeSubscriptions, include2Subscriptions, Subscription);
  add(include2Subscriptions, includeSubscriptions, Subscription);

  return { Query, Mutation, Subscription };
};
export default addtInventoryOptions;
