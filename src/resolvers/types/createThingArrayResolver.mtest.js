// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('../mutations/createCreateThingMutationResolver');
const { default: info } = require('./array-info.auxiliary.js');
const { default: createThingArrayResolver } = require('./createThingArrayResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createThingArrayResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  const serversideConfig = {};
  test('should create type thing resolver', async () => {
    const placeConfig: ThingConfig = {};
    Object.assign(placeConfig, {
      name: 'Place',
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

    const createPlace = createCreateThingMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPlace).toBe('function');
    if (!createPlace) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      title: 'Paris',
    };
    const createdPlace = await createPlace(null, { data }, { mongooseConn, pubsub });
    const { id } = createdPlace;

    const Place = createThingArrayResolver(placeConfig);
    const parent = { friends: [id] };
    const places = await Place(parent, null, { mongooseConn, pubsub }, info);
    const [place] = places;

    expect(place.title).toBe(data.title);

    const parent2 = { friends: ['5cd82d6075fb194334d8c1d7', id, '5cd82d6075fb194334d8c1d8'] };
    const places2 = await Place(parent2, null, { mongooseConn, pubsub }, info);
    const [place2] = places2;

    expect(places2.length).toBe(1);
    expect(place2.title).toBe(data.title);
  });
});
