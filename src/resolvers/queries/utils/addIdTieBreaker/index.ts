import type { NearInput } from '@/tsTypes';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  search?: string;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  // "objectIds_from_parent" used only to process the call from createChildEntitiesThroughConnectionQueryResolver
  objectIds_from_parent?: Array<any>;
};

// a connection pages by the values of the sort keys ("getKeysetConnection") or by "skip" (with "near" or
// "search" without "sort"), so documents with equal sort values must come in the same order on every page:
// "id" is added as the last sort key in the direction of the previous key (so the index of a sortable field
// with "_id" serves the sort in the both directions), and is the sort when no order is given at all;
// "near" without "sort" is ordered by the distance & "_id" in the list resolver, "search" without "sort"
// and the order of the parent ids keep their own order
const addIdTieBreaker = (args: Args): Args => {
  const { near, search, sort, objectIds_from_parent: objectIdsFromParent } = args;

  if (objectIdsFromParent) return args;

  if (sort?.sortBy.length) {
    if (sort.sortBy.some((sortKey) => sortKey.startsWith('id_'))) return args;

    const direction = sort.sortBy[sort.sortBy.length - 1].endsWith('_DESC') ? 'DESC' : 'ASC';

    return { ...args, sort: { ...sort, sortBy: [...sort.sortBy, `id_${direction}`] } };
  }

  if (near || search) return args;

  return { ...args, sort: { sortBy: ['id_ASC'] } };
};

export default addIdTieBreaker;
