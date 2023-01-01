// @flow
/* eslint-env jest */

import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: sleep } = require('../../../utils/sleep');
const { default: toGlobalId } = require('../../utils/toGlobalId');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../../mutations/createCreateEntityMutationResolver');
const { default: info } = require('./array-info.auxiliary');
const { default: createEntityArrayResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityArrayResolver', () => {
  const serversideConfig = {};
  test('should create type entity resolver', async () => {
    const placeConfig: EntityConfig = {};
    Object.assign(placeConfig, {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'friend',
          config: placeConfig,
        },
        {
          name: 'friends',
          config: placeConfig,
          array: true,
        },
      ],
    });

    const exampleSchema = createThingSchema(placeConfig);
    const Example = mongooseConn.model('Place_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const generalConfig: GeneralConfig = { allEntityConfigs: { Place: placeConfig } };

    const createPlace = createCreateEntityMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPlace).toBe('function');
    if (!createPlace) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data1 = { title: 'title-1' };
    const data2 = { title: 'title-2' };
    const data3 = { title: 'title-3' };

    const createdPlace1 = await createPlace(null, { data: data1 }, { mongooseConn, pubsub }, null, {
      foo: [],
    });
    const { id: id1 } = createdPlace1;

    const createdPlace2 = await createPlace(null, { data: data2 }, { mongooseConn, pubsub }, null, {
      foo: [],
    });
    const { id: id2 } = createdPlace2;

    const createdPlace3 = await createPlace(null, { data: data3 }, { mongooseConn, pubsub }, null, {
      foo: [],
    });
    const { id: id3 } = createdPlace3;

    const Place = createEntityArrayResolver(placeConfig, generalConfig, serversideConfig);
    const parent = { friends: [toGlobalId(id1, 'Place')] };
    const places = await Place(parent, null, { mongooseConn, pubsub }, info, { foo: [] });

    const [place] = places;

    expect(place.title).toBe(data1.title);

    const parent2 = {
      friends: [
        toGlobalId(id2, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d7', 'Place'),
        toGlobalId(id3, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d8', 'Place'),
        toGlobalId(id1, 'Place'),
      ],
    };
    const places2 = await Place(parent2, null, { mongooseConn, pubsub }, info, { foo: [] });
    const [place1, place2, place3] = places2;

    expect(places2.length).toBe(3);

    expect(place1.title).toBe(data2.title);
    expect(place2.title).toBe(data3.title);
    expect(place3.title).toBe(data1.title);
  });
});
