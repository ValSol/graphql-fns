import type { LookupMongoDB, NearForAggregateMongodb } from '@/tsTypes';

import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';

// selects the ids of the documents that match "where" (with "lookups"), "geoNear" and "search";
// "$geoNear" and "$text" can't be in one pipeline, so with both "search" selects the ids first
// and "$geoNear" is applied to these ids
const aggregateFilteredIds = async (
  Entity: any,
  {
    where,
    lookups,
    geoNear,
    search,
  }: {
    where: Record<string, any>;
    lookups: LookupMongoDB[];
    geoNear?: NearForAggregateMongodb;
    search?: string;
  },
  session?: any,
): Promise<any[] | null> => {
  const aggregate = async (pipeline: Record<string, any>[]) => {
    pipeline.push({ $project: { _id: 1 } });

    const entities = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    return entities ? entities.map(({ _id }) => _id) : null;
  };

  if (geoNear && search) {
    const ids = await aggregate(composeAggregateHead({ where, lookups, search }));

    if (!ids?.length) return ids;

    return aggregate([{ $geoNear: { ...geoNear, query: { _id: { $in: ids } } } }]);
  }

  return aggregate(composeAggregateHead({ where, lookups, geoNear, search }));
};

export default aggregateFilteredIds;
