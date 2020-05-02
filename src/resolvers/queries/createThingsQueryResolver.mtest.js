// @flow
/* eslint-env jest */
import type { GeneralConfig, NearInput, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('../mutations/createCreateThingMutationResolver');
const { default: info } = require('../info.auxiliary');
const { default: info2 } = require('./info-geospatial.auxiliary');
const { default: infoForSort } = require('./info-sort.auxiliary');

const { default: createThingsQueryResolver } = require('./createThingsQueryResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-things-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createThingQueryResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  const serversideConfig = {};
  test('should create query things resolver', async () => {
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      pagination: true,
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
        {
          name: 'position',
          index: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          array: true,
          oppositeName: 'friends',
          config: personConfig,
        },
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
          config: personConfig,
        },
      ],
    });

    const createPerson = createCreateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Hugo',
      lastName: 'Boss',
      position: 'boss',
      friends: {
        create: [
          { firstName: 'Adam', lastName: 'Mashkin', position: 'programmer' },
          { firstName: 'Andy', lastName: 'Daskin', position: 'programmer' },
          { firstName: 'Fred', lastName: 'Prashkin', position: 'programmer' },
        ],
      },
      theBestFriend: {
        create: {
          firstName: 'Stanislav',
          lastName: 'Bzhezinsky',
          position: 'programmer',
        },
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });

    const People = createThingsQueryResolver(personConfig, generalConfig, serversideConfig);
    if (!People) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const people = await People(null, {}, { mongooseConn, pubsub }, info);

    expect(people.length).toBe(5);
    expect(people[0].id).toEqual(createdPerson.id);

    const where = { position: data.theBestFriend.create.position };
    const people2 = await People(null, { where }, { mongooseConn, pubsub }, info);

    expect(people2.length).toBe(4);

    const where2 = { friends: createdPerson.id };
    const people3 = await People(null, { where: where2 }, { mongooseConn, pubsub }, info);

    expect(people3.length).toBe(3);

    const pagination = { skip: 1, first: 3 };
    const people4 = await People(null, { pagination }, { mongooseConn, pubsub }, info);

    expect(people4.length).toBe(3);
  });

  test('should create query things resolver for thing with geospatial fields', async () => {
    const restaurantConfig: ThingConfig = {};
    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      booleanFields: [{ name: 'recommended', index: true }],
      // unique: true causes geospatial fetch error
      // textFields: [{ name: 'name' }, { name: 'num', unique: true }],
      textFields: [{ name: 'name' }, { name: 'num' }],
      relationalFields: [
        {
          name: 'restaurants',
          array: true,
          config: restaurantConfig,
        },
      ],

      geospatialFields: [
        {
          name: 'point',
          geospatialType: 'Point',
        },
        {
          name: 'point2',
          geospatialType: 'Point',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
        },
        {
          name: 'areas',
          array: true,
          geospatialType: 'Polygon',
        },
      ],
    });

    const createRestaurant = createCreateThingMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Murakami',
      restaurants: {
        create: [
          {
            name: 'Fabbrica',
            point: { lng: 50.438198, lat: 30.515858 },
            point2: { lng: 50.438198, lat: 30.515858 },
            num: '2',
          },
          {
            name: 'Fine Family',
            point: { lng: 50.438061, lat: 30.515879 },
            point2: { lng: 50.438061, lat: 30.515879 },
            num: '3',
          },
          {
            name: 'Zhizn Zamechatelnykh Lyudey',
            point: { lng: 50.438007, lat: 30.515858 },
            point2: { lng: 50.438007, lat: 30.515858 },
            num: '4',
          },
          {
            name: 'Georgian House',
            point: { lng: 50.437692, lat: 30.51583 },
            point2: { lng: 50.437692, lat: 30.51583 },
            num: '5',
          },
          {
            name: 'Mama Manana',
            point: { lng: 50.437045, lat: 30.515803 },
            point2: { lng: 50.437045, lat: 30.515803 },
            num: '6',
          },
          {
            name: 'Satori Lounge',
            point: { lng: 50.43673, lat: 30.515007 },
            point2: { lng: 50.43673, lat: 30.515007 },
            recommended: true,
            num: '7',
          },
          {
            name: 'NAM',
            point: { lng: 50.436149, lat: 30.515785 },
            point2: { lng: 50.436149, lat: 30.515785 },
            recommended: true,
            num: '8',
          },
        ],
      },
      point: { lng: 50.438198, lat: 30.515858 },
      point2: { lng: 50.438198, lat: 30.515858 },
      num: '1',
    };
    const createdRestaurant = await createRestaurant(null, { data }, { mongooseConn, pubsub });

    const Restaurants = createThingsQueryResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!Restaurants) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurants = await Restaurants(null, {}, { mongooseConn, pubsub }, info);

    expect(restaurants.length).toBe(8);
    expect(restaurants[0].id).toEqual(createdRestaurant.id);

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 150,
    };
    const restaurants2 = await Restaurants(null, { near }, { mongooseConn, pubsub }, info2);
    expect(restaurants2.length).toBe(3);
    expect(restaurants2[0].name).toEqual('NAM');
    expect(restaurants2[1].name).toEqual('Mama Manana');
    expect(restaurants2[2].name).toEqual('Satori Lounge');

    const where = {
      recommended: true,
    };
    const restaurants3 = await Restaurants(null, { near, where }, { mongooseConn, pubsub }, info2);
    expect(restaurants3.length).toBe(2);
    expect(restaurants3[0].name).toEqual('NAM');
    expect(restaurants3[1].name).toEqual('Satori Lounge');

    const where2 = {
      id_in: [restaurants3[0].id, restaurants3[1].id],
    };
    const restaurants4 = await Restaurants(
      null,
      { where: where2 },
      { mongooseConn, pubsub },
      info2,
    );
    expect(restaurants4.length).toBe(2);
  });

  test('should create query things resolver for thing with unique field', async () => {
    const restaurantConfig: ThingConfig = {};
    Object.assign(restaurantConfig, {
      name: 'Restaurant2',
      booleanFields: [{ name: 'recommended', index: true }],
      textFields: [{ name: 'name' }, { name: 'num', unique: true }],
      relationalFields: [
        {
          name: 'restaurants',
          array: true,
          config: restaurantConfig,
        },
      ],
    });

    const createRestaurant = createCreateThingMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Murakami',
      restaurants: {
        create: [
          {
            name: 'Fabbrica',
            num: '2',
          },
          {
            name: 'Fine Family',
            num: '3',
          },
          {
            name: 'Zhizn Zamechatelnykh Lyudey',
            num: '4',
          },
          {
            name: 'Georgian House',
            num: '5',
          },
          {
            name: 'Mama Manana',
            num: '6',
          },
          {
            name: 'Satori Lounge',
            recommended: true,
            num: '7',
          },
          {
            name: 'NAM',
            recommended: true,
            num: '8',
          },
        ],
      },
      point: { lng: 50.438198, lat: 30.515858 },
      point2: { lng: 50.438198, lat: 30.515858 },
      num: '1',
    };
    const createdRestaurant = await createRestaurant(null, { data }, { mongooseConn, pubsub });

    const Restaurants = createThingsQueryResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!Restaurants) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurants = await Restaurants(null, {}, { mongooseConn, pubsub }, info);

    expect(restaurants.length).toBe(8);
    expect(restaurants[0].id).toEqual(createdRestaurant.id);

    const where = {
      num_in: ['4', '2', '8', '6'],
    };
    const restaurants2 = await Restaurants(null, { where }, { mongooseConn, pubsub }, info2);
    expect(restaurants2.length).toBe(4);
  });

  test('should create query things resolver for thing sorted by several fields', async () => {
    const tableItemConfig: ThingConfig = {
      name: 'TableItem',
      textFields: [
        {
          name: 'first',
          index: true,
        },
        {
          name: 'second',
          index: true,
        },
      ],
    };
    const tableConfig: ThingConfig = {
      name: 'Table',
      relationalFields: [
        {
          name: 'items',
          array: true,
          config: tableItemConfig,
        },
      ],
    };

    const createTable = createCreateThingMutationResolver(
      tableConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createTable).toBe('function');
    if (!createTable) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      items: {
        create: [
          {
            first: 'b',
            second: 'a',
          },
          {
            first: 'a',
            second: 'b',
          },
          {
            first: 'b',
            second: 'b',
          },
          {
            first: 'c',
            second: 'b',
          },
          {
            first: 'c',
            second: 'c',
          },
          {
            first: 'b',
            second: 'c',
          },
          {
            first: 'c',
            second: 'a',
          },
          {
            first: 'a',
            second: 'a',
          },
          {
            first: 'a',
            second: 'c',
          },
        ],
      },
    };

    await createTable(null, { data }, { mongooseConn, pubsub });

    const Items = createThingsQueryResolver(tableItemConfig, generalConfig, serversideConfig);
    if (!Items) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const items = await Items(null, {}, { mongooseConn, pubsub }, infoForSort);

    expect(items.length).toBe(9);

    const sort = { sortBy: ['first_ASC', 'second_DESC'] };

    const items2 = await Items(null, { sort }, { mongooseConn, pubsub }, infoForSort);

    expect(items2.length).toBe(9);
    expect(items2[0].first).toBe('a');
    expect(items2[0].second).toBe('c');
    expect(items2[1].first).toBe('a');
    expect(items2[1].second).toBe('b');
    expect(items2[2].first).toBe('a');
    expect(items2[2].second).toBe('a');
    expect(items2[3].first).toBe('b');
    expect(items2[3].second).toBe('c');
    expect(items2[4].first).toBe('b');
    expect(items2[4].second).toBe('b');
    expect(items2[5].first).toBe('b');
    expect(items2[5].second).toBe('a');
    expect(items2[6].first).toBe('c');
    expect(items2[6].second).toBe('c');
    expect(items2[7].first).toBe('c');
    expect(items2[7].second).toBe('b');
    expect(items2[8].first).toBe('c');
    expect(items2[8].second).toBe('a');
  });
});
