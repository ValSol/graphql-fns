import type { LookupMongoDB, NearForAggregateMongodb } from '@/tsTypes';

import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';

// "$geoNear" sorts only by the distance so documents at the same distance come in no definite order
// and the page is sorted again by the distance & "_id"; to keep this sort bounded, "maxDistance" is
// narrowed to the distance of the document that ends the page in the "$geoNear" order: the documents
// not farther than it are enough to compose the page, the ones that are farther come after the page
const narrowGeoNearToPage = async (
  Entity: any,
  {
    where,
    lookups,
    geoNear,
    stages = [],
  }: {
    where: Record<string, any>;
    lookups: LookupMongoDB[];
    geoNear: NearForAggregateMongodb;
    stages?: Record<string, any>[]; // that follow the head of the aggregate (a keyset condition)
  },
  end: number, // the number of the documents up to the end of the page
  session?: any,
): Promise<NearForAggregateMongodb> => {
  const { distanceField } = geoNear;

  const pipeline = [...composeAggregateHead({ where, lookups, geoNear }), ...stages];

  if (end > 1) pipeline.push({ $skip: end - 1 });

  pipeline.push({ $limit: 1 }, { $project: { _id: 0, [distanceField]: 1 } });

  const [last] = await (session
    ? Entity.aggregate(pipeline).session(session).exec()
    : Entity.aggregate(pipeline).exec());

  // fewer documents than the page needs: all of them are sorted
  if (!last) return geoNear;

  const distance = last[distanceField] as number;

  // the margin only adds documents that come after the page
  return { ...geoNear, maxDistance: distance * (1 + 1e-9) + 1e-9 };
};

export default narrowGeoNearToPage;
