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
  const dbURI = 'mongodb://127.0.0.1:27017/jest-array-type';
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

    const data = {
      title: 'Paris',
    };
    const createdPlace = await createPlace(null, { data }, { mongooseConn, pubsub });
    const { id } = createdPlace;

    const Place = createEntityArrayResolver(placeConfig, generalConfig, serversideConfig);
    const parent = { friends: [toGlobalId(id, 'Place')] };
    const places = await Place(parent, null, { mongooseConn, pubsub }, info);

    const [place] = places;

    expect(place.title).toBe(data.title);

    const parent2 = {
      friends: [
        toGlobalId('5cd82d6075fb194334d8c1d7', 'Place'),
        toGlobalId(id, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d8', 'Place'),
      ],
    };
    const places2 = await Place(parent2, null, { mongooseConn, pubsub }, info);
    const [place2] = places2;

    expect(places2.length).toBe(1);
    expect(place2.title).toBe(data.title);
  });
});
