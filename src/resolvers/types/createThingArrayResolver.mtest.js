// @flow
/* eslint-env jest */
const mongoose = require('mongoose');

const createCreateThingMutationResolver = require('../mutations/createCreateThingMutationResolver');
const info = require('./array-info.auxiliary.js');
const createThingArrayResolver = require('./createThingArrayResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-array-type';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createThingArrayResolver', () => {
  test('should create type thing resolver', async () => {
    const thingConfig = {
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
          thingName: 'Place',
        },
        {
          name: 'friends',
          thingName: 'Place',
          array: true,
        },
      ],
    };

    const createPlace = createCreateThingMutationResolver(thingConfig);
    expect(typeof createPlace).toBe('function');
    const data = {
      title: 'Paris',
    };
    const createdPlace = await createPlace(null, { data }, { mongooseConn });
    const { id } = createdPlace;

    const Place = createThingArrayResolver(thingConfig);
    const parent = { friends: [id] };
    const places = await Place(parent, null, { mongooseConn }, info);
    const [place] = places;

    expect(place.title).toBe(data.title);
  });
});
