// @flow
/* eslint-env jest */
import type { Enums, GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');

const mongoOptions = require('../../../test/mongo-options');
const createCreateThingMutationResolver = require('../mutations/createCreateThingMutationResolver');
const info = require('./array-info.auxiliary.js');
const createThingArrayResolver = require('./createThingArrayResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

describe('createThingArrayResolver', () => {
  const enums: Enums = [];
  const generalConfig: GeneralConfig = { thingConfigs: [], enums };
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

    const createPlace = createCreateThingMutationResolver(placeConfig, generalConfig);
    expect(typeof createPlace).toBe('function');
    const data = {
      title: 'Paris',
    };
    const createdPlace = await createPlace(null, { data }, { mongooseConn });
    const { id } = createdPlace;

    const Place = createThingArrayResolver(placeConfig, enums);
    const parent = { friends: [id] };
    const places = await Place(parent, null, { mongooseConn }, info);
    const [place] = places;

    expect(place.title).toBe(data.title);
  });
});
