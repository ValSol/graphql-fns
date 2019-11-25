// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('../mutations/createCreateThingMutationResolver');
const { default: info } = require('./scalar-info.auxiliary.js');
const { default: createThingScalarResolver } = require('./createThingScalarResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-scalar-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createThingScalarResolver', () => {
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

    const Place = createThingScalarResolver(placeConfig);
    const parent = { friend: id };
    const place = await Place(parent, null, { mongooseConn, pubsub }, info);

    expect(place.title).toBe(data.title);

    const parent2 = { friend: '5cd82d6075fb194334d8c1d7' };
    const place2 = await Place(parent2, null, { mongooseConn, pubsub }, info);

    expect(place2).toBeNull();
  });
});
