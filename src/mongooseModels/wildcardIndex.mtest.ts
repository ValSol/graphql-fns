import mongoose from 'mongoose';
import { jest } from '@jest/globals';

import type { SimplifiedEntityConfig, TangibleEntityConfig } from '@/tsTypes';

import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import toGlobalId from '@/resolvers/utils/toGlobalId';
import createEntitySchema from './createEntitySchema';
import initMongooseModels from './initMongooseModels';
import syncModelIndexes from './syncModelIndexes';

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Holding',
    type: 'tangible',
    textFields: [{ name: 'name' }],
  },
  {
    name: 'Shop',
    type: 'tangible',
    textFields: [
      { name: 'title', index: true },
      { name: 'code', wildcardIndex: true },
      { name: 'tags', array: true, wildcardIndex: true },
    ],
    intFields: [{ name: 'rank', index: true, wildcardIndex: true }],
    relationalFields: [
      { name: 'holding', oppositeName: 'shops', configName: 'Holding', wildcardIndex: true },
      { name: 'supplier', oppositeName: 'suppliedShops', configName: 'Holding' },
    ],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs }, {});
const schema = makeExecutableSchema({ typeDefs, resolvers });

const connections: mongoose.Connection[] = [];

const connect = async (dbName: string) => {
  const conn = await mongoose
    .createConnection(`mongodb://127.0.0.1:27017/${dbName}`, { autoIndex: false })
    .asPromise();
  await conn.db!.dropDatabase();
  connections.push(conn);

  return conn;
};

const getIndexes = async (conn: mongoose.Connection, collectionName: string) =>
  (await conn.db!.collection(collectionName).indexes()).sort((a, b) =>
    String(a.name) < String(b.name) ? -1 : 1,
  );

// "since" of index stats is the time the index is created
const getIndexSince = async (conn: mongoose.Connection, collectionName: string, name: string) => {
  const stats = await conn
    .db!.collection(collectionName)
    .aggregate([{ $indexStats: {} }, { $match: { name } }])
    .toArray();

  return stats[0].accesses.since.getTime();
};

const composeProbeConfig = (name: string, wildcardFieldNames: string[]) =>
  composeAllEntityConfigs([
    {
      name,
      type: 'tangible',
      textFields: ['a', 'b', 'c'].map((fieldName) => ({
        name: fieldName,
        wildcardIndex: wildcardFieldNames.includes(fieldName),
      })),
    },
  ])[name] as TangibleEntityConfig;

// a model of a probe entity with "wildcardIndex" on "fieldNames" of the fields "a", "b", "c"
const createProbeModel = (
  conn: mongoose.Connection,
  name: string,
  fieldNames: string[],
  collectionName: string,
) => conn.model(name, createEntitySchema(composeProbeConfig(name, fieldNames)), collectionName);

afterAll(async () => {
  for (const conn of connections) {
    await conn.close();
  }
});

describe('wildcard index', () => {
  test('should index "wildcardIndex" fields by one root wildcard index', async () => {
    const conn = await connect('jest-wildcard-index');

    await initMongooseModels(conn, { allEntityConfigs });

    const indexes = await getIndexes(conn, 'shop_things');

    // "holding" has no own index, "rank" with "index" keeps its sortable one
    expect(indexes.map(({ name }) => name)).toEqual([
      'WildcardIndex',
      '_id_',
      'createdAt_1__id_1',
      'rank_1__id_1',
      'supplier_1',
      'title_1__id_1',
      'updatedAt_1__id_1',
    ]);

    const wildcardIndex = indexes.find(({ name }) => name === 'WildcardIndex');

    expect(wildcardIndex?.key).toEqual({ '$**': 1 });
    expect(wildcardIndex?.wildcardProjection).toEqual({ code: 1, tags: 1, rank: 1, holding: 1 });
  });

  test('should filter by "wildcardIndex" fields through the wildcard index', async () => {
    const conn = await connect('jest-wildcard-index-plans');

    const { Shop } = await initMongooseModels(conn, { allEntityConfigs });

    const holdingIds = Array.from({ length: 10 }, () => new mongoose.Types.ObjectId());

    await Shop.insertMany(
      Array.from({ length: 200 }, (_, i) => ({
        title: `title${i}`,
        code: `code${i}`,
        tags: [`tag${i % 20}`, `tag${(i + 1) % 20}`],
        rank: i,
        holding: holdingIds[i % 10],
      })),
    );

    const winningPlan = async (filter: Record<string, any>) => {
      const explain: any = await Shop.find(filter).explain('queryPlanner');
      const { queryPlanner } = Array.isArray(explain) ? explain[0] : explain;

      return JSON.stringify(queryPlanner.winningPlan);
    };

    expect(await winningPlan({ code: 'code7' })).toContain('"indexName":"WildcardIndex"');
    expect(await winningPlan({ tags: { $in: ['tag3', 'tag4'] } })).toContain(
      '"indexName":"WildcardIndex"',
    );
    expect(await winningPlan({ holding: holdingIds[3], code: 'code3' })).toContain(
      '"indexName":"WildcardIndex"',
    );

    expect(await Shop.countDocuments({ holding: holdingIds[3], tags: 'tag4' })).toBe(10);
  });

  test('should filter (not sort) by "wildcardIndex" fields through the GraphQL API', async () => {
    const conn = await connect('jest-wildcard-index-api');

    const { Shop } = await initMongooseModels(conn, { allEntityConfigs });

    const holdingId = new mongoose.Types.ObjectId();

    await Shop.insertMany([
      { title: 'a', code: 'c1', tags: ['x', 'y'], rank: 1, holding: holdingId },
      { title: 'b', code: 'c2', tags: ['y'], rank: 2, holding: holdingId },
      { title: 'c', code: 'c3', tags: ['x'], rank: 3 },
    ]);

    const execute = (source: string) =>
      graphql({ schema, source, contextValue: { mongooseConn: conn } });

    const { data, errors } = await execute(`{
      byHolding: Shops(where: { holding: "${toGlobalId(holdingId.toString(), 'Holding')}", tags: "x" }) { code }
      byCodes: Shops(where: { code_in: ["c2", "c3"] }, sort: { sortBy: [rank_DESC] }) { code }
      sortEnum: __type(name: "ShopSortEnum") { enumValues { name } }
      textNamesEnum: __type(name: "ShopTextNamesEnum") { enumValues { name } }
      holdingWhere: __type(name: "HoldingWhereInput") { inputFields { name } }
    }`);

    expect(errors).toBeUndefined();
    expect(data?.byHolding).toEqual([{ code: 'c1' }]);
    expect(data?.byCodes).toEqual([{ code: 'c3' }, { code: 'c2' }]);

    // "rank" is sortable by its "index", "code" & "tags" are not
    expect((data?.sortEnum as any).enumValues.map(({ name }: any) => name)).toEqual([
      'id_ASC',
      'id_DESC',
      'createdAt_ASC',
      'createdAt_DESC',
      'updatedAt_ASC',
      'updatedAt_DESC',
      'title_ASC',
      'title_DESC',
      'rank_ASC',
      'rank_DESC',
    ]);
    expect((data?.textNamesEnum as any).enumValues.map(({ name }: any) => name)).toEqual([
      'title',
      'code',
      'tags',
    ]);

    // parents are filtered by the children's "holding" of the wildcard index
    expect((data?.holdingWhere as any).inputFields.map(({ name }: any) => name)).toContain(
      'shops_',
    );

    const { errors: sortErrors } = await execute(
      '{ Shops(sort: { sortBy: [code_ASC] }) { code } }',
    );

    expect(sortErrors?.[0].message).toMatch('code_ASC');
  });

  test('should rebuild the wildcard index only when its fields change', async () => {
    const conn = await connect('jest-wildcard-index-sync');

    // different entity names: schemas are cached by name, both are used for one collection
    const ProbeA = createProbeModel(conn, 'ProbeA', ['a', 'b'], 'probes');
    const ProbeB = createProbeModel(conn, 'ProbeB', ['b', 'c'], 'probes');

    await syncModelIndexes(conn, ProbeA, '"ProbeA" entity');

    const since = await getIndexSince(conn, 'probes', 'WildcardIndex');

    // the same fields: the index is kept
    await syncModelIndexes(conn, ProbeA, '"ProbeA" entity', true);

    expect(await getIndexSince(conn, 'probes', 'WildcardIndex')).toBe(since);

    await new Promise((resolve) => setTimeout(resolve, 10));

    // other fields: the index is rebuilt with the new projection
    await syncModelIndexes(conn, ProbeB, '"ProbeB" entity');

    const wildcardIndex = (await getIndexes(conn, 'probes')).find(
      ({ name }) => name === 'WildcardIndex',
    );

    expect(wildcardIndex?.wildcardProjection).toEqual({ b: 1, c: 1 });
    expect(await getIndexSince(conn, 'probes', 'WildcardIndex')).toBeGreaterThan(since);
  });

  test('should drop root wildcard indexes with other names or without projection', async () => {
    const conn = await connect('jest-wildcard-index-legacy');

    const collection = conn.db!.collection('legacy_probes');

    await collection.createIndex(
      { '$**': 1 },
      { name: 'LegacyWildcard', wildcardProjection: { b: 1, c: 1 } },
    );

    const ProbeC = createProbeModel(conn, 'ProbeC', ['b', 'c'], 'legacy_probes');

    await syncModelIndexes(conn, ProbeC, '"ProbeC" entity');

    let wildcardIndexes = (await getIndexes(conn, 'legacy_probes')).filter(({ key }) => key['$**']);

    // the same fields but another name: replaced by "WildcardIndex"
    expect(
      wildcardIndexes.map(({ name, wildcardProjection }) => [name, wildcardProjection]),
    ).toEqual([['WildcardIndex', { b: 1, c: 1 }]]);

    await collection.dropIndex('WildcardIndex');
    await collection.createIndex({ '$**': 1 }, { name: 'WildcardIndex' });

    await syncModelIndexes(conn, ProbeC, '"ProbeC" entity', true);

    wildcardIndexes = (await getIndexes(conn, 'legacy_probes')).filter(({ key }) => key['$**']);

    // the schema name but all the fields: replaced by the one with projection
    expect(
      wildcardIndexes.map(({ name, wildcardProjection }) => [name, wildcardProjection]),
    ).toEqual([['WildcardIndex', { b: 1, c: 1 }]]);
  });

  test('should rebuild the wildcard index already dropped by a concurrent sync', async () => {
    const conn = await connect('jest-wildcard-index-race');

    const ProbeD = createProbeModel(conn, 'ProbeD', ['a', 'b'], 'race_probes');
    const ProbeE = createProbeModel(conn, 'ProbeE', ['b', 'c'], 'race_probes');

    await syncModelIndexes(conn, ProbeD, '"ProbeD" entity');

    // another instance listed the old index too and has already dropped it
    const staleIndexes = await ProbeE.collection.indexes();
    await conn.db!.collection('race_probes').dropIndex('WildcardIndex');

    const indexesSpy = jest.spyOn(ProbeE.collection, 'indexes').mockResolvedValueOnce(staleIndexes);

    await syncModelIndexes(conn, ProbeE, '"ProbeE" entity');

    expect(indexesSpy).toHaveBeenCalled();
    indexesSpy.mockRestore();

    const wildcardIndex = (await getIndexes(conn, 'race_probes')).find(
      ({ name }) => name === 'WildcardIndex',
    );

    expect(wildcardIndex?.wildcardProjection).toEqual({ b: 1, c: 1 });
  });
});
