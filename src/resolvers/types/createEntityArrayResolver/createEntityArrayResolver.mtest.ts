/* eslint-env jest */
import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import toGlobalId from '../../utils/toGlobalId';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityArrayResolver from './index';

const info = { projection: { title: 1 }, fieldArgs: {}, path: [], fieldName: 'friends' };

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityArrayResolver', () => {
  const serversideConfig: Record<string, any> = {};
  test('should create type entity resolver', async () => {
    const placeConfig = {} as EntityConfig;
    Object.assign(placeConfig, {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'friend',
          oppositeName: 'fellows',
          config: placeConfig,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friend',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          oppositeName: 'butties',
          config: placeConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'butties',
          oppositeName: 'friends',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
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
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });
    const { id: id1 } = createdPlace1;

    const createdPlace2 = await createPlace(null, { data: data2 }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });
    const { id: id2 } = createdPlace2;

    const createdPlace3 = await createPlace(null, { data: data3 }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });
    const { id: id3 } = createdPlace3;

    const Place = createEntityArrayResolver(placeConfig, generalConfig, serversideConfig);
    const parent = { friends: [toGlobalId(id1, 'Place')] };
    const places = await Place(parent, {}, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

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
    const places2 = await Place(parent2, {}, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });
    const [place1, place2, place3] = places2;

    expect(places2.length).toBe(3);

    expect(place1.title).toBe(data2.title);
    expect(place2.title).toBe(data3.title);
    expect(place3.title).toBe(data1.title);
  });
});
