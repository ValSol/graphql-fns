import type {SimplifiedInventoryOptions} from '../../../../tsTypes';

const add = (obj: {
  [queryName: string]: Array<string>
}, obj2: {
  [queryName: string]: Array<string>
}, result: Record<any, any>) =>
  Object.keys(obj).forEach((key) => {
    if (result[key]) {
      return;
    }

    result[key] = obj[key]; // eslint-disable-line no-param-reassign

    obj2[key]?.forEach((name: string) => {
      if (!result[key].includes(name)) {
        result[key].push(name);
      }
    });
  });

const addtInventoryOptions = (include: SimplifiedInventoryOptions, include2: SimplifiedInventoryOptions): SimplifiedInventoryOptions => {
  const { Query: includeQueries, Mutation: includeMutations } = include;
  const { Query: include2Queries, Mutation: include2Mutations } = include2;

  const Query: Record<string, any> = {};
  add(includeQueries, include2Queries, Query);
  add(include2Queries, includeQueries, Query);

  const Mutation: Record<string, any> = {};
  add(includeMutations, include2Mutations, Mutation);
  add(include2Mutations, includeMutations, Mutation);

  return { Query, Mutation };
};
export default addtInventoryOptions;
