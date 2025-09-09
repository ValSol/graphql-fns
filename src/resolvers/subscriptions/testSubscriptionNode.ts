import mingo from 'mingo';

import { EntityConfig, EntityFilters } from '@/tsTypes';
import composeSubscriptionDummyEntityConfig from '@/resolvers/utils/composeSubscriptionDummyEntityConfig';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';

const testSubscriptionNode = (
  nodes: Record<string, any>[],
  wherePayload: Record<string, any>,
  subscribePayloadMongoFilter: EntityFilters,
  entityConfig: EntityConfig,
) => {
  const { where: wherePayloadMongo } = mergeWhereAndFilter(
    [],
    wherePayload,
    composeSubscriptionDummyEntityConfig(entityConfig),
  );

  const where =
    Object.keys(wherePayloadMongo).length === 0
      ? subscribePayloadMongoFilter
      : Object.keys(subscribePayloadMongoFilter).length === 0
        ? wherePayloadMongo
        : { $and: [wherePayloadMongo, subscribePayloadMongoFilter] };

  const query = new mingo.Query(where);

  return nodes.every((node) => query.test(node));
};

export default testSubscriptionNode;
