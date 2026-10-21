import type { NearInput } from '@/tsTypes';

import parseSortKey from '../parseSortKey';

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

// a field repeated in "sortBy" takes the position of its first key and the direction of its last key:
// the same order MongoDB uses (a repeated key of a sort object only changes its value)
const normalizeSortBy = (sortBy: string[]): string[] => {
  const directions = sortBy.reduce<Map<string, string>>((prev, sortKey) => {
    const [fieldName, direction] = parseSortKey(sortKey);

    prev.set(fieldName === '_id' ? 'id' : fieldName, direction === 1 ? 'ASC' : 'DESC');

    return prev;
  }, new Map());

  return [...directions].map(([fieldName, direction]) => `${fieldName}_${direction}`);
};

// a connection pages by the values of the sort keys ("getKeysetConnection") or by "skip" ("search" without
// "sort"), so documents with equal sort values must come in the same order on every page: "id" is added as
// the last sort key in the direction of the previous key (so the index of a sortable field with "_id" serves
// the sort in the both directions), and is the sort when no order is given at all; "near" without "sort" is
// sorted by the distance ("<geospatialField>_distance", added by "$geoNear" of the list resolver) & "id";
// "search" without "sort" and the order of the parent ids keep their own order
const addIdTieBreaker = (args: Args): Args => {
  const { near, search, sort, objectIds_from_parent: objectIdsFromParent } = args;

  if (objectIdsFromParent) return args;

  if (sort?.sortBy.length) {
    const sortBy = normalizeSortBy(sort.sortBy);

    if (sortBy.some((sortKey) => parseSortKey(sortKey)[0] === '_id')) {
      return sortBy.length === sort.sortBy.length ? args : { ...args, sort: { ...sort, sortBy } };
    }

    const direction = sortBy[sortBy.length - 1].endsWith('_DESC') ? 'DESC' : 'ASC';

    return { ...args, sort: { ...sort, sortBy: [...sortBy, `id_${direction}`] } };
  }

  if (near) {
    return { ...args, sort: { sortBy: [`${near.geospatialField}_distance_ASC`, 'id_ASC'] } };
  }

  if (search) return args;

  return { ...args, sort: { sortBy: ['id_ASC'] } };
};

export default addIdTieBreaker;
