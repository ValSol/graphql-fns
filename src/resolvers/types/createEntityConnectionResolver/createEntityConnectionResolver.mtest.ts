/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import toCursor from '../../utils/toCursor';
import toGlobalId from '../../utils/toGlobalId';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityConnectionResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-connection-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityConnectionResolver', () => {
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
          oppositeName: 'parentFriend',
          config: placeConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentFriend',
          oppositeName: 'friend',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          oppositeName: 'parentFriends',
          config: placeConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'parentFriends',
          oppositeName: 'friends',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = { allEntityConfigs: { Place: placeConfig } };

    const exampleSchema = createThingSchema(placeConfig);
    const Example = mongooseConn.model('Place_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

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

    const Place = createEntityConnectionResolver(placeConfig, generalConfig, serversideConfig);

    const parent = {
      friends: [
        toGlobalId(id2, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d7', 'Place'),
        toGlobalId(id3, 'Place'),
        toGlobalId('5cd82d6075fb194334d8c1d8', 'Place'),
        toGlobalId(id1, 'Place'),
      ],
    };

    const info = {
      projection: { title: 1 },
      fieldArgs: {},
      path: [],
      fieldName: 'friendsThroughConnection',
    };

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = await Place(parent, { first: 1 }, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    expect(hasNextPage).toBe(true);
    expect(hasPreviousPage).toBe(false);
    expect(startCursor).toBe(toCursor(id2, 0));
    expect(endCursor).toBe(toCursor(id2, 0));

    expect(edges.length).toBe(1);

    expect(edges[0].cursor).toBe(toCursor(id2, 0));
    expect(edges[0].node.id).toEqual(id2);
    expect(edges[0].node.title).toBe(data2.title);

    const {
      pageInfo: {
        hasNextPage: hasNextPage2,
        hasPreviousPage: hasPreviousPage2,
        startCursor: startCursor2,
        endCursor: endCursor2,
      },
      edges: edges2,
    } = await Place(parent, { after: endCursor, first: 3 }, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    expect(hasNextPage2).toBe(false);
    expect(hasPreviousPage2).toBe(true);
    expect(startCursor2).toBe(toCursor(id3, 1));
    expect(endCursor2).toBe(toCursor(id1, 2));

    expect(edges2.length).toBe(2);

    expect(edges2[0].cursor).toBe(toCursor(id3, 1));
    expect(edges2[0].node.id).toEqual(id3);
    expect(edges2[0].node.title).toBe(data3.title);

    expect(edges2[1].cursor).toBe(toCursor(id1, 2));
    expect(edges2[1].node.id).toEqual(id1);
    expect(edges2[1].node.title).toBe(data1.title);
  });
});
