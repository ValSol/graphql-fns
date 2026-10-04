import mingo from 'mingo';

import { EntityConfig, EntityFilters, TangibleEntityConfig } from '@/tsTypes';
import composeSubscriptionDummyEntityConfig from '@/resolvers/utils/composeSubscriptionDummyEntityConfig';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';

// the filters treat relational & duplex fields as text fields (see "composeSubscriptionDummyEntityConfig"),
// while an in-memory PubSub publishes their ids as ObjectIds that never equal strings
const stringifyIds = (node: Record<string, any>, entityConfig: EntityConfig) => {
  const { relationalFields = [], duplexFields = [] } = entityConfig as TangibleEntityConfig;

  return [...relationalFields, ...duplexFields].reduce(
    (prev, { name }) => {
      const value = node[name];

      if (value !== null && value !== undefined) {
        prev[name] = Array.isArray(value) ? value.map(String) : String(value);
      }

      return prev;
    },
    { ...node },
  );
};

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

  return nodes.every((node) => query.test(stringifyIds(node, entityConfig)));
};

export default testSubscriptionNode;
