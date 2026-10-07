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

// a connection pages by "skip", so documents with equal sort values must come in the same order on every page:
// "id_ASC" is added as the last sort key (and is the sort when no order is given at all); "near", "search"
// without "sort" and the order of the parent ids keep their own order
const addIdTieBreaker = (args: Args): Args => {
  const { near, search, sort, objectIds_from_parent: objectIdsFromParent } = args;

  if (objectIdsFromParent || near) return args;

  if (sort?.sortBy.length) {
    if (sort.sortBy.some((sortKey) => sortKey.startsWith('id_'))) return args;

    return { ...args, sort: { ...sort, sortBy: [...sort.sortBy, 'id_ASC'] } };
  }

  if (search) return args;

  return { ...args, sort: { sortBy: ['id_ASC'] } };
};

export default addIdTieBreaker;
