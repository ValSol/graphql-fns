import type { LookupMongoDB, NearForAggregateMongodb } from '@/tsTypes';

import composePreMatch from './composePreMatch';

// composes the stages that begin an aggregate: "$text" / "$geoNear" (have to be first), the part of
// "where" that doesn't depend on the lookups (lets MongoDB use indexes before the lookups), the lookups
// and the whole "where"
const composeAggregateHead = ({
  where,
  lookups,
  geoNear,
  search,
  sortByTextScore,
}: {
  where: Record<string, any>;
  lookups: LookupMongoDB[];
  geoNear?: NearForAggregateMongodb;
  search?: string;
  sortByTextScore?: boolean;
}): Record<string, any>[] => {
  const preMatch = composePreMatch(where, lookups);

  const pipeline: Record<string, any>[] = [];

  let preMatchUsed = false;

  if (search) {
    pipeline.push({ $match: { $text: { $search: search }, ...preMatch } });

    preMatchUsed = true;

    if (sortByTextScore) {
      pipeline.push({ $sort: { score: { $meta: 'textScore' } } });
    }
  }

  if (geoNear) {
    pipeline.push({
      $geoNear: preMatch && !preMatchUsed ? { ...geoNear, query: preMatch } : geoNear,
    });

    preMatchUsed = true;
  }

  if (preMatch && !preMatchUsed) {
    pipeline.push({ $match: preMatch });
  }

  pipeline.push(...lookups);

  if (Object.keys(where).length > 0) {
    pipeline.push({ $match: where });
  }

  return pipeline;
};

export default composeAggregateHead;
