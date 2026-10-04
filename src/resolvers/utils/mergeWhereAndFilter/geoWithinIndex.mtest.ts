import mongoose from 'mongoose';

import type { EntityConfig, GraphqlObject } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import createMongooseModel from '@/mongooseModels/createMongooseModel';
import composeWhereInput from './composeWhereInput';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-geo-within-index';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

const placeConfig = {} as EntityConfig;
const ownerConfig = {} as EntityConfig;

Object.assign(placeConfig, {
  name: 'Place',
  type: 'tangible',
  textFields: [{ name: 'title', type: 'textFields' }],
  geospatialFields: [
    { name: 'coordinates', geospatialType: 'Point', index: true, type: 'geospatialFields' },
    {
      name: 'entrances',
      geospatialType: 'Point',
      array: true,
      index: true,
      type: 'geospatialFields',
    },
  ],
});

Object.assign(ownerConfig, {
  name: 'Owner',
  type: 'tangible',
  textFields: [{ name: 'title', type: 'textFields' }],
  relationalFields: [
    { name: 'ownPlaces', array: true, config: placeConfig, type: 'relationalFields' },
  ],
});

const center = { lng: 30.5, lat: 50.45 };

const withinSphere = { center, radius: 2000 };

const withinPolygon = {
  externalRing: {
    ring: [
      { lng: 30.48, lat: 50.43 },
      { lng: 30.52, lat: 50.43 },
      { lng: 30.52, lat: 50.47 },
      { lng: 30.48, lat: 50.47 },
      { lng: 30.48, lat: 50.43 },
    ],
  },
};

// the condition as it was built before the fix: by the field itself, not by its "coordinates"
const withoutCoordinatesPath = (where: GraphqlObject) =>
  Object.keys(where).reduce<GraphqlObject>((prev, key) => {
    prev[key.endsWith('.coordinates') ? key.slice(0, -'.coordinates'.length) : key] = where[key];

    return prev;
  }, {});

const collectStages = (plan: any, stages: string[] = []): string[] => {
  if (!plan || typeof plan !== 'object') return stages;

  if (typeof plan.stage === 'string') stages.push(plan.stage);

  Object.values(plan).forEach((value) => collectStages(value, stages));

  return stages;
};

const sortedIds = (docs: { _id: any }[]) => docs.map(({ _id }) => _id.toString()).sort();

describe('"_within*" conditions of "Point" geospatial fields', () => {
  let Place;
  let Owner;

  beforeAll(async () => {
    Place = await createMongooseModel(mongooseConn, placeConfig);
    Owner = await createMongooseModel(mongooseConn, ownerConfig);

    const places: GraphqlObject[] = [];

    // a grid of 40 x 40 points around the center with step ~700 m
    for (let i = 0; i < 40; i += 1) {
      for (let j = 0; j < 40; j += 1) {
        const lng = 30.5 + (i - 20) / 100;
        const lat = 50.45 + (j - 20) / 160;

        places.push({
          title: `place ${i}:${j}`,
          coordinates: { type: 'Point', coordinates: [lng, lat] },
          entrances: [
            { type: 'Point', coordinates: [lng, lat] },
            { type: 'Point', coordinates: [lng + 0.05, lat] },
          ],
        });
      }
    }

    const docs = await Place.insertMany(places);

    // every owner gets 10 columns of the grid so only the middle owners are near the center
    await Owner.insertMany(
      [0, 1, 2, 3].map((k) => ({
        title: `owner ${k}`,
        ownPlaces: docs.filter((_, index) => Math.floor(index / 400) === k).map(({ _id }) => _id),
      })),
    );
  });

  test('has the "2dsphere" indexes on the "coordinates" paths', async () => {
    const indexes = await Place.collection.indexes();

    const keys = indexes.map(({ key }) => key);

    expect(keys).toContainEqual({ 'coordinates.coordinates': '2dsphere' });
    expect(keys).toContainEqual({ 'entrances.coordinates': '2dsphere' });
  });

  const cases: [string, GraphqlObject][] = [
    ['coordinates_withinSphere', { coordinates_withinSphere: withinSphere }],
    ['coordinates_withinPolygon', { coordinates_withinPolygon: withinPolygon }],
    ['entrances_withinSphere', { entrances_withinSphere: withinSphere }],
    ['entrances_withinPolygon', { entrances_withinPolygon: withinPolygon }],
  ];

  test.each(cases)('"%s" uses the index & gives the same documents', async (_, where) => {
    const { where: mongoWhere, lookups } = composeWhereInput(where, placeConfig);

    expect(lookups).toEqual([]);

    const [key] = Object.keys(mongoWhere);

    expect(key.endsWith('.coordinates')).toBe(true);

    const explanation = await Place.find(mongoWhere).explain('executionStats');

    const stages = collectStages(explanation.queryPlanner.winningPlan);

    expect(stages).toContain('IXSCAN');
    expect(stages).not.toContain('COLLSCAN');

    const docs = await Place.find(mongoWhere, { _id: 1 }).lean();
    const docsBefore = await Place.find(withoutCoordinatesPath(mongoWhere), {
      _id: 1,
    }).lean();

    expect(docs.length).toBeGreaterThan(0);
    expect(docs.length).toBeLessThan(1600);
    expect(explanation.executionStats.totalDocsExamined).toBeLessThan(1600);
    expect(sortedIds(docs)).toEqual(sortedIds(docsBefore));
  });

  test('a relational condition gives the same documents after "$lookup"', async () => {
    const where = {
      ownPlaces_: { coordinates_withinSphere: withinSphere, title_exists: true },
    };

    const { where: mongoWhere, lookups } = composeWhereInput(where, ownerConfig);

    expect(Object.keys(mongoWhere)).toContain('ownPlaces_.coordinates.coordinates');

    const docs = await Owner.aggregate([
      ...lookups,
      { $match: mongoWhere },
      { $project: { _id: 1 } },
    ]);
    const docsBefore = await Owner.aggregate([
      ...lookups,
      { $match: withoutCoordinatesPath(mongoWhere) },
      { $project: { _id: 1 } },
    ]);

    expect(docs.length).toBe(2);
    expect(sortedIds(docs)).toEqual(sortedIds(docsBefore));
  });
});
