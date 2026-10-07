import mongoose from 'mongoose';

import type { GeneralConfig, NearInput, TangibleEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import createThingSchema from '@/mongooseModels/createThingSchema';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import pubsub from '@/resolvers/utils/pubsub';
import createCreateEntityMutationResolver from '@/resolvers/mutations/createCreateEntityMutationResolver';
import createDeleteFilteredEntitiesMutationResolver from '@/resolvers/mutations/createDeleteFilteredEntitiesMutationResolver';
import createUpdateFilteredEntitiesMutationResolver from '@/resolvers/mutations/createUpdateFilteredEntitiesMutationResolver';
import createEntitiesQueryResolver from '@/resolvers/queries/createEntitiesQueryResolver';
import createEntitiesThroughConnectionQueryResolver from '@/resolvers/queries/createEntitiesThroughConnectionQueryResolver';

mongoose.set('strictQuery', false);

let mongooseConn;
let Place;

const placeConfig: TangibleEntityConfig = {
  name: 'Place',
  type: 'tangible',
  textFields: [
    { name: 'name', weight: 1, type: 'textFields' },
    { name: 'tag', type: 'textFields' },
  ],
  intFields: [{ name: 'num', type: 'intFields' }],
  geospatialFields: [
    { name: 'point', geospatialType: 'Point', index: true, type: 'geospatialFields' },
  ],
};

const generalConfig: GeneralConfig = { allEntityConfigs: { Place: placeConfig } };
const serversideConfig = {};

const context = () => ({ mongooseConn, pubsub });
const info = createInfoEssence({ projection: { num: 1, tag: 1 } });
const resolverOptions = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };

// the places lie on a line, ~963 m one from another; even ones are cafes, odd ones are shops
const near: NearInput = { geospatialField: 'point', coordinates: { lng: 50, lat: 30 } };
const nearWithin5km: NearInput = { ...near, maxDistance: 5000 };

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-aggregate-filtered-ids';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  Place = mongooseConn.model('Place_Thing', createThingSchema(placeConfig));
  await Place.init();

  const createPlace = createCreateEntityMutationResolver(
    placeConfig,
    generalConfig,
    serversideConfig,
  );

  for (let i = 9; i >= 0; i -= 1) {
    const data = {
      name: i % 2 ? `shop ${i}` : `cafe ${i}`,
      num: i,
      point: { lng: 50 + i * 0.01, lat: 30 },
    };

    await createPlace(null, { data }, context(), null, resolverOptions);
  }
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('"near" with "search"', () => {
  test('entities query selects by "search" and sorts by "near"', async () => {
    const Places = createEntitiesQueryResolver(placeConfig, generalConfig, serversideConfig);

    const places = await Places(null, { near, search: 'cafe' }, context(), info, resolverOptions);
    expect(places.map(({ num }) => num)).toEqual([0, 2, 4, 6, 8]);

    const places2 = await Places(
      null,
      { near: nearWithin5km, search: 'cafe' },
      context(),
      info,
      resolverOptions,
    );
    expect(places2.map(({ num }) => num)).toEqual([0, 2, 4]);
  });

  test('entities through connection query selects by "search" and sorts by "near"', async () => {
    const PlacesThroughConnection = createEntitiesThroughConnectionQueryResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );

    const {
      edges,
      pageInfo: { hasNextPage },
    } = await PlacesThroughConnection(
      null,
      { first: 2, near, search: 'cafe' },
      context(),
      info,
      resolverOptions,
    );

    expect(edges.map(({ node: { num } }) => num)).toEqual([0, 2]);
    expect(hasNextPage).toBe(true);
  });

  test('update filtered entities mutation selects by "near" and "search"', async () => {
    const updateFilteredPlaces = createUpdateFilteredEntitiesMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );

    const places = await updateFilteredPlaces(
      null,
      { near: nearWithin5km, search: 'cafe', data: { tag: 'close cafe' } },
      context(),
      info,
      resolverOptions,
    );

    expect(places.map(({ num }) => num).sort()).toEqual([0, 2, 4]);

    const updated = await Place.find({ tag: 'close cafe' }, { num: 1 }).lean();
    expect(updated.map(({ num }) => num).sort()).toEqual([0, 2, 4]);
  });

  test('delete filtered entities mutation selects by "near" and "search"', async () => {
    const deleteFilteredPlaces = createDeleteFilteredEntitiesMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );

    const places = await deleteFilteredPlaces(
      null,
      { near: nearWithin5km, search: 'shop' },
      context(),
      info,
      resolverOptions,
    );

    expect(places.map(({ num }) => num).sort()).toEqual([1, 3, 5]);

    const rest = await Place.find({}, { num: 1 }).lean();
    expect(rest.map(({ num }) => num).sort()).toEqual([0, 2, 4, 6, 7, 8, 9]);
  });
});
