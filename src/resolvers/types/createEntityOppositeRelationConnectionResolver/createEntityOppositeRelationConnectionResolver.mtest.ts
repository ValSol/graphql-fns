/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import pubsub from '../../utils/pubsub';
import toGlobalId from '../../utils/toGlobalId';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityOppositeRelationConnectionResolver from './index';

const info = {
  projection: { title: 1 },
  fieldArgs: {},
  path: [],
  fieldName: 'friendsThroughConnection',
};

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-connection-opposite-relation-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityOppositeRelationConnectionResolver', () => {
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
          oppositeName: 'friends',
          config: placeConfig,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          oppositeName: 'friend',
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

    const data = { title: 'title-main' };

    const createdPlace = await createPlace(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id } = createdPlace;

    const data1 = { title: 'title-1', friend: { connect: id } };
    const data2 = { title: 'title-2', friend: { connect: id } };
    const data3 = { title: 'title-3', friend: { connect: id } };

    const createdPlace1 = await createPlace(null, { data: data1 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id: id1 } = createdPlace1;

    const createdPlace2 = await createPlace(null, { data: data2 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id: id2 } = createdPlace2;

    const createdPlace3 = await createPlace(null, { data: data3 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const { id: id3 } = createdPlace3;

    const Place = createEntityOppositeRelationConnectionResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    const parent = { id: toGlobalId(id, 'Place') };
    const places = await Place(parent, { first: 10 }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    const { edges } = places;
    expect(edges.length).toBe(3);
    expect(edges[0].node.title).toBe(data1.title);
    expect(edges[1].node.title).toBe(data2.title);
    expect(edges[2].node.title).toBe(data3.title);
  });
});
