import mingo from 'mingo';

import { EntityConfig, EntityFilters, TangibleEntityConfig } from '@/tsTypes';
import composeSubscriptionDummyEntityConfig from '@/resolvers/utils/composeSubscriptionDummyEntityConfig';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';

const toDate = (value: unknown) => (typeof value === 'string' ? new Date(value) : value);

// brings the node to the types the filters compare with:
// - the filters treat relational & duplex fields as text fields (see "composeSubscriptionDummyEntityConfig"),
//   while an in-memory PubSub publishes their ids as ObjectIds that never equal strings;
// - the filters get Dates from the "DateTime" scalar, while a serializing PubSub (JSON, Redis) publishes
//   the dates as strings that never compare with Dates
const normalizeNode = (
  node: Record<string, any>,
  entityConfig: EntityConfig,
  embedded?: boolean,
): Record<string, any> => {
  const {
    calculatedFields = [],
    dateTimeFields = [],
    duplexFields = [],
    embeddedFields = [],
    relationalFields = [],
  } = entityConfig as TangibleEntityConfig;

  const result = { ...node };

  // absent and empty values stay as they are: "$exists" filters depend on them
  const convert = (name: string, fn: (item: any) => any) => {
    const value = node[name];

    if (value !== null && value !== undefined) {
      result[name] = Array.isArray(value) ? value.map(fn) : fn(value);
    }
  };

  [...relationalFields, ...duplexFields].forEach(({ name }) => convert(name, String));

  const dateNames = [
    ...(embedded ? [] : ['createdAt', 'updatedAt']),
    ...dateTimeFields.map(({ name }) => name),
    ...calculatedFields
      .filter(({ calculatedType }) => calculatedType === 'dateTimeFields')
      .map(({ name }) => name),
  ];

  dateNames.forEach((name) => convert(name, toDate));

  [
    ...embeddedFields,
    ...calculatedFields.filter(({ calculatedType }) => calculatedType === 'embeddedFields'),
  ].forEach(({ name, config }: any) =>
    convert(name, (item) =>
      item && typeof item === 'object' ? normalizeNode(item, config, true) : item,
    ),
  );

  return result;
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

  return nodes.every((node) => query.test(normalizeNode(node, entityConfig)));
};

export default testSubscriptionNode;
