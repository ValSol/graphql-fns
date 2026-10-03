import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig, GraphqlObject } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import createMongooseModel from '@/mongooseModels/createMongooseModel';
import pubsub from '@/resolvers/utils/pubsub';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import createEntitiesQueryResolver from '@/resolvers/queries/createEntitiesQueryResolver';
import createEntityCountQueryResolver from '@/resolvers/queries/createEntityCountQueryResolver';
import createEntityExistencesQueryResolver from '@/resolvers/queries/createEntityExistencesQueryResolver';
import composeAggregateHead from './composeAggregateHead';
import mergeWhereAndFilter from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-compose-aggregate-head';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

const groupConfig = {} as EntityConfig;
const shopConfig = {} as EntityConfig;

Object.assign(groupConfig, {
  name: 'Group',
  type: 'tangible',
  textFields: [
    { name: 'title', type: 'textFields' },
    { name: 'editors', array: true, type: 'textFields' },
  ],
});

Object.assign(shopConfig, {
  name: 'Shop',
  type: 'tangible',
  textFields: [
    { name: 'title', weight: 1, type: 'textFields' },
    { name: 'districtId', index: true, type: 'textFields' },
    { name: 'editors', array: true, type: 'textFields' },
  ],
  booleanFields: [{ name: 'show', type: 'booleanFields' }],
  relationalFields: [{ name: 'group', config: groupConfig, type: 'relationalFields' }],
  geospatialFields: [
    { name: 'position', geospatialType: 'Point', index: true, type: 'geospatialFields' },
  ],
});

const generalConfig: GeneralConfig = { allEntityConfigs: { Group: groupConfig, Shop: shopConfig } };

// the access filter of the "editor" shape: the user edits the shop itself or its group
const editorFilter = [
  { districtId: 'd1', show: true, editors: 'u1' },
  { districtId: 'd1', show: true, group_exists: true, group_: { editors: 'u1' } },
];

const wheres: GraphqlObject[] = [
  {},
  { title_re: [{ pattern: 'shop', flags: 'i' }] },
  { group_: { title: 'group 1' } },
  { OR: [{ title: 'shop 1' }, { group_: { title: 'group 2' } }] },
  { NOR: [{ group_: { title: 'group 1' } }] },
];

describe('composeAggregateHead', () => {
  let Group;
  let Shop;

  beforeAll(async () => {
    Group = await createMongooseModel(mongooseConn, groupConfig);
    Shop = await createMongooseModel(mongooseConn, shopConfig);

    const groups = await Group.insertMany([
      { title: 'group 1', editors: ['u1'] },
      { title: 'group 2', editors: ['u2'] },
      { title: 'group 3', editors: ['u1', 'u2'] },
    ]);

    const shops: GraphqlObject[] = [];

    for (let i = 0; i < 60; i += 1) {
      shops.push({
        title: `shop ${i}`,
        districtId: `d${i % 4}`,
        show: i % 5 !== 0,
        editors: i % 3 === 0 ? ['u1'] : [],
        group: i % 7 === 0 ? undefined : groups[i % 3]._id,
        position: { type: 'Point', coordinates: [30 + i / 100, 50 + i / 100] },
      });
    }

    await Shop.insertMany(shops);
  });

  test('gives the same documents as the pipeline without the pre-match', async () => {
    const options = [{}, { search: 'shop' }, { near: true }];

    for (const where of wheres) {
      for (const { search, near } of options as { search?: string; near?: boolean }[]) {
        const { lookups, where: where2 } = mergeWhereAndFilter(editorFilter, where, shopConfig);

        const geoNear = near
          ? {
              near: { type: 'Point' as const, coordinates: [30, 50] as [number, number] },
              distanceField: 'position_distance',
              key: 'position.coordinates',
              spherical: true as const,
            }
          : undefined;

        const head: Record<string, any>[] = [];

        if (search) head.push({ $match: { $text: { $search: search } } });

        if (geoNear) head.push({ $geoNear: geoNear });

        const withoutPreMatch = [...head, ...lookups, { $match: where2 }, { $project: { _id: 1 } }];

        const withPreMatch = [
          ...composeAggregateHead({ where: where2, lookups, geoNear, search }),
          { $project: { _id: 1 } },
        ];

        expect(withPreMatch).not.toEqual(withoutPreMatch);

        const expected = await Shop.aggregate(withoutPreMatch).exec();
        const result = await Shop.aggregate(withPreMatch).exec();

        const toIds = (items: { _id: any }[]) => items.map(({ _id }) => _id.toString()).sort();

        expect(toIds(result)).toEqual(toIds(expected));
      }
    }
  });

  test('resolvers give the results computed without the pre-match', async () => {
    const ShopCount = createEntityCountQueryResolver(shopConfig, generalConfig, {});
    const ShopExistences = createEntityExistencesQueryResolver(shopConfig, generalConfig, {});
    const Shops = createEntitiesQueryResolver(shopConfig, generalConfig, {});

    if (!ShopCount || !ShopExistences || !Shops) {
      throw new TypeError('Resolver have to be function!');
    }

    const involvedFilters = { inputOutputFilterAndLimit: [editorFilter] };

    const expectedIds = await Promise.all(
      wheres.map(async (where) => {
        const { lookups, where: where2 } = mergeWhereAndFilter(editorFilter, where, shopConfig);

        const items = await Shop.aggregate([...lookups, { $match: where2 }]).exec();

        return items.map(({ _id }) => _id.toString()).sort();
      }),
    );

    expect(expectedIds.some((ids) => ids.length > 0)).toBe(true);
    expect(expectedIds.some((ids) => ids.length === 0)).toBe(true);

    for (let i = 0; i < wheres.length; i += 1) {
      const where = wheres[i];

      const count = await ShopCount(
        null,
        { where },
        { mongooseConn, pubsub },
        null,
        { involvedFilters },
      );

      expect(count).toBe(expectedIds[i].length);

      const shops = await Shops(
        null,
        { where },
        { mongooseConn, pubsub },
        createInfoEssence({ projection: { title: 1 } }),
        { involvedFilters },
      );

      expect(shops.map(({ id }) => id.toString()).sort()).toEqual(expectedIds[i]);
    }

    const existences = await ShopExistences(
      null,
      { whereAndSearch: wheres.map((where) => ({ where })) },
      { mongooseConn, pubsub },
      null,
      { involvedFilters },
    );

    expect(existences).toEqual(expectedIds.map((ids) => ids.length > 0));
  });

  test('lets MongoDB use the index of a local field before the lookups', async () => {
    const { lookups, where } = mergeWhereAndFilter(editorFilter, {}, shopConfig);

    const before = await Shop.aggregate([...lookups, { $match: where }]).explain('executionStats');

    const after = await Shop.aggregate(composeAggregateHead({ where, lookups })).explain(
      'executionStats',
    );

    const before2 = JSON.stringify(before);
    const after2 = JSON.stringify(after);

    expect(before2).toContain('COLLSCAN');
    expect(after2).not.toContain('COLLSCAN');
    expect(after2).toContain('IXSCAN');
  });
});
