// @flow
/* eslint-env jest */
import type { NearInput, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');

const mongoOptions = require('../../../test/mongo-options');
const createCreateThingMutationResolver = require('../mutations/createCreateThingMutationResolver');
const info = require('../info.auxiliary');
const info2 = require('./info-geospatial.auxiliary');
const infoForSort = require('./info-sort.auxiliary');

const createThingsQueryResolver = require('./createThingsQueryResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-things-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

describe('createThingQueryResolver', () => {
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

    const createPerson = createCreateThingMutationResolver(personConfig);
    expect(typeof createPerson).toBe('function');

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
    const createdPerson = await createPerson(null, { data }, { mongooseConn });

    const People = createThingsQueryResolver(personConfig);

    const people = await People(null, {}, { mongooseConn }, info);

    expect(people.length).toBe(5);
    expect(people[0].id).toEqual(createdPerson.id);

    const where = { position: data.theBestFriend.create.position };
    const people2 = await People(null, { where }, { mongooseConn }, info);

    expect(people2.length).toBe(4);

    const where2 = { friends: createdPerson.id };
    const people3 = await People(null, { where: where2 }, { mongooseConn }, info);

    expect(people3.length).toBe(3);

    const pagination = { skip: 1, first: 3 };
    const people4 = await People(null, { pagination }, { mongooseConn }, info);

    expect(people4.length).toBe(3);
  });

  test('should create query things resolver for thing with geospatial fields', async () => {
    const restaurantConfig: ThingConfig = {};
    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      textFields: [{ name: 'name' }],
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
          type: 'Point',
        },
        {
          name: 'point2',
          type: 'Point',
        },
        {
          name: 'area',
          type: 'Polygon',
        },
        {
          name: 'areas',
          array: true,
          type: 'Polygon',
        },
      ],
    });

    const createRestaurant = createCreateThingMutationResolver(restaurantConfig);
    expect(typeof createRestaurant).toBe('function');

    const data = {
      name: 'Murakami',
      restaurants: {
        create: [
          {
            name: 'Fabbrica',
            point: { longitude: 50.438198, latitude: 30.515858 },
            point2: { longitude: 50.438198, latitude: 30.515858 },
          },
          {
            name: 'Fine Family',
            point: { longitude: 50.438061, latitude: 30.515879 },
            point2: { longitude: 50.438061, latitude: 30.515879 },
          },
          {
            name: 'Zhizn Zamechatelnykh Lyudey',
            point: { longitude: 50.438007, latitude: 30.515858 },
            point2: { longitude: 50.438007, latitude: 30.515858 },
          },
          {
            name: 'Georgian House',
            point: { longitude: 50.437692, latitude: 30.51583 },
            point2: { longitude: 50.437692, latitude: 30.51583 },
          },
          {
            name: 'Mama Manana',
            point: { longitude: 50.437045, latitude: 30.515803 },
            point2: { longitude: 50.437045, latitude: 30.515803 },
          },
          {
            name: 'Satori Lounge',
            point: { longitude: 50.43673, latitude: 30.515007 },
            point2: { longitude: 50.43673, latitude: 30.515007 },
          },
          {
            name: 'NAM',
            point: { longitude: 50.436149, latitude: 30.515785 },
            point2: { longitude: 50.436149, latitude: 30.515785 },
          },
        ],
      },
      point: { longitude: 50.438198, latitude: 30.515858 },
      point2: { longitude: 50.438198, latitude: 30.515858 },
    };
    const createdRestaurant = await createRestaurant(null, { data }, { mongooseConn });

    const Restaurants = createThingsQueryResolver(restaurantConfig);

    const restaurants = await Restaurants(null, {}, { mongooseConn }, info);

    expect(restaurants.length).toBe(8);
    expect(restaurants[0].id).toEqual(createdRestaurant.id);

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { longitude: 50.435766, latitude: 30.515742 },
      maxDistance: 150,
    };
    const restaurants2 = await Restaurants(null, { near }, { mongooseConn }, info2);
    expect(restaurants2.length).toBe(3);
    expect(restaurants2[0].name).toEqual('NAM');
    expect(restaurants2[1].name).toEqual('Mama Manana');
    expect(restaurants2[2].name).toEqual('Satori Lounge');

    const near2: NearInput = {
      geospatialField: 'point2',
      coordinates: { longitude: 50.435766, latitude: 30.515742 },
      maxDistance: 150,
    };
    const restaurants3 = await Restaurants(null, { near: near2 }, { mongooseConn }, info2);
    expect(restaurants3.length).toBe(3);
    expect(restaurants3[0].name).toEqual('NAM');
    expect(restaurants3[1].name).toEqual('Mama Manana');
    expect(restaurants3[2].name).toEqual('Satori Lounge');
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

    const createTable = createCreateThingMutationResolver(tableConfig);
    expect(typeof createTable).toBe('function');

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

    await createTable(null, { data }, { mongooseConn });

    const Items = createThingsQueryResolver(tableItemConfig);

    const items = await Items(null, {}, { mongooseConn }, infoForSort);

    expect(items.length).toBe(9);

    const sort = { sortBy: ['first_ASC', 'second_DESC'] };

    const items2 = await Items(null, { sort }, { mongooseConn }, infoForSort);

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
