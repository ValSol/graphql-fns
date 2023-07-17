/* eslint-env jest */
import type {
  GeneralConfig,
  NearInput,
  EntityConfig,
  TangibleEntityConfig,
} from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import sleep from '../../../utils/sleep';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';

import createEntitiesQueryResolver from './index';

const info = { projection: { textField1: 1, textField3: 1, createdAt: 1 } };
const info2 = { projection: { name: 1, textField3: 1, createdAt: 1 } };
const infoForSort = { projection: { first: 1, second: 1, createdAt: 1 } };

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entities-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  const serversideConfig: Record<string, any> = {};
  test('should create query entities resolver', async () => {
    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'position',
          index: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          array: true,
          oppositeName: 'friends',
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(personConfig);
    const Example = mongooseConn.model('Person_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const createPerson = createCreateEntityMutationResolver(
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
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    const People = createEntitiesQueryResolver(personConfig, generalConfig, serversideConfig);
    if (!People) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const people = await People(null, {}, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(people.length).toBe(5);
    expect(people[0].id).toEqual(createdPerson.id);

    const peopleLimited = await People(null, {}, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[], 3],
    });

    expect(peopleLimited.length).toBe(3);
    expect(peopleLimited[0].id).toEqual(createdPerson.id);

    const where = { position: data.theBestFriend.create.position };
    const people2 = await People(null, { where }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(people2.length).toBe(4);

    const where2 = { friends: createdPerson.id };
    const people3 = await People(null, { where: where2 }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(people3.length).toBe(3);

    const pagination = { skip: 1, first: 3 };
    const people4 = await People(null, { pagination }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(people4.length).toBe(3);

    const where3 = { friends_: { position: 'programmer' } };
    const people5 = await People(null, { where: where3 }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });
    expect(people5.length).toBe(1);
  });

  test('should create query entities resolver for entity with geospatial fields', async () => {
    const restaurantConfig = {} as EntityConfig;
    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      type: 'tangible',
      booleanFields: [{ name: 'recommended', index: true, type: 'booleanFields' }],
      // unique: true causes geospatial fetch error
      // textFields: [{ name: 'name' }, { name: 'num', unique: true }],
      textFields: [
        { name: 'name', type: 'textFields' },
        { name: 'num', type: 'textFields' },
      ],
      relationalFields: [
        {
          name: 'restaurants',
          oppositeName: 'parentRestaurants',
          array: true,
          config: restaurantConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentRestaurants',
          oppositeName: 'restaurants',
          array: true,
          parent: true,
          config: restaurantConfig,
          type: 'relationalFields',
        },
      ],

      geospatialFields: [
        {
          name: 'point',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'point2',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'areas',
          array: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(restaurantConfig);
    const Example = mongooseConn.model('Restaurant_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const createRestaurant = createCreateEntityMutationResolver(
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
    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    const Restaurants = createEntitiesQueryResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!Restaurants) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurants = await Restaurants(null, {}, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(restaurants.length).toBe(8);
    expect(restaurants[0].id).toEqual(createdRestaurant.id);

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 150,
    };
    const restaurants2 = await Restaurants(null, { near }, { mongooseConn, pubsub }, info2, {
      inputOutputEntity: [[]],
    });
    expect(restaurants2.length).toBe(3);
    expect(restaurants2[0].name).toEqual('NAM');
    expect(restaurants2[1].name).toEqual('Mama Manana');
    expect(restaurants2[2].name).toEqual('Satori Lounge');

    const where = {
      recommended: true,
    };
    const restaurants3 = await Restaurants(null, { near, where }, { mongooseConn, pubsub }, info2, {
      inputOutputEntity: [[]],
    });
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
      { inputOutputEntity: [[]] },
    );
    expect(restaurants4.length).toBe(2);
  });

  test('should create query entities resolver for entity with unique field', async () => {
    const restaurantConfig = {} as EntityConfig;
    Object.assign(restaurantConfig, {
      name: 'Restaurant2',
      type: 'tangible',
      booleanFields: [{ name: 'recommended', index: true, type: 'booleanFields' }],
      textFields: [
        { name: 'name', type: 'textFields' },
        { name: 'num', unique: true, type: 'textFields' },
      ],
      relationalFields: [
        {
          name: 'restaurants',
          oppositeName: 'parentRestaurants',
          array: true,
          config: restaurantConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentRestaurants',
          oppositeName: 'restaurants',
          array: true,
          parent: true,
          config: restaurantConfig,
          type: 'relationalFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(restaurantConfig);
    const Example = mongooseConn.model('Restaurant2_Thing', exampleSchema);
    await Example.createCollection();

    const createRestaurant = createCreateEntityMutationResolver(
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
    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    const Restaurants = createEntitiesQueryResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!Restaurants) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurants = await Restaurants(null, {}, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(restaurants.length).toBe(8);
    expect(restaurants[0].id).toEqual(createdRestaurant.id);

    const where = {
      num_in: ['4', '2', '8', '6'],
    };
    const restaurants2 = await Restaurants(null, { where }, { mongooseConn, pubsub }, info2, {
      inputOutputEntity: [[]],
    });
    expect(restaurants2.length).toBe(4);
  });

  test('should create query entities resolver for entity sorted by several fields', async () => {
    const tableConfig = {} as TangibleEntityConfig;

    const tableItemConfig: EntityConfig = {
      name: 'TableItem',
      type: 'tangible',
      textFields: [
        {
          name: 'first',
          index: true,
          weight: 1,
          type: 'textFields',
        },
        {
          name: 'second',
          index: true,
          weight: 5,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'parentItems',
          oppositeName: 'items',
          array: true,
          parent: true,
          config: tableConfig,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(tableConfig, {
      name: 'Table',
      type: 'tangible',
      relationalFields: [
        {
          name: 'items',
          oppositeName: 'parentItems',
          array: true,
          config: tableItemConfig,
          type: 'relationalFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(tableConfig);
    const Example = mongooseConn.model('Table_Thing', exampleSchema);
    await Example.createCollection();

    const example2Schema = createThingSchema(tableItemConfig);
    const Example2 = mongooseConn.model('TableItem_Thing', example2Schema);
    await Example2.createCollection();

    await sleep(250);

    const createTable = createCreateEntityMutationResolver(
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

    await createTable(null, { data }, { mongooseConn, pubsub }, null, { inputOutputEntity: [[]] });

    const Items = createEntitiesQueryResolver(tableItemConfig, generalConfig, serversideConfig);
    if (!Items) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const items = await Items(null, {}, { mongooseConn, pubsub }, infoForSort, {
      inputOutputEntity: [[]],
    });

    expect(items.length).toBe(9);

    const sort = { sortBy: ['first_ASC', 'second_DESC'] };

    const items2 = await Items(null, { sort }, { mongooseConn, pubsub }, infoForSort, {
      inputOutputEntity: [[]],
    });

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

  test('should create query entities resolver for fullText index', async () => {
    const tableConfig = {} as TangibleEntityConfig;

    const tableItemConfig: EntityConfig = {
      name: 'TableItem',
      type: 'tangible',
      textFields: [
        {
          name: 'first',
          index: true,
          weight: 1,
          type: 'textFields',
        },
        {
          name: 'second',
          index: true,
          weight: 5,
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'parentItems',
          oppositeName: 'items',
          array: true,
          parent: true,
          config: tableConfig,
          type: 'relationalFields',
        },
      ],
    };
    Object.assign(tableConfig, {
      name: 'Table',
      type: 'tangible',
      relationalFields: [
        {
          name: 'items',
          oppositeName: 'parentItems',
          array: true,
          config: tableItemConfig,
          type: 'relationalFields',
        },
      ],
    });

    const createTable = createCreateEntityMutationResolver(
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
            first: 'vasya & masha',
            second: 'pupkin',
          },
          {
            first: 'arnold',
            second: 'ivanov & petrov',
          },
          {
            first: 'masha',
            second: 'chernova',
          },
          {
            first: 'arnold',
            second: 'kislyi',
          },
          {
            first: 'masha',
            second: 'nikman & pupkin',
          },
          {
            first: 'vasya',
            second: 'doparidze',
          },
        ],
      },
    };

    await createTable(null, { data }, { mongooseConn, pubsub }, null, { inputOutputEntity: [[]] });

    const Items = createEntitiesQueryResolver(tableItemConfig, generalConfig, serversideConfig);
    if (!Items) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const items = await Items(null, {}, { mongooseConn, pubsub }, infoForSort, {
      inputOutputEntity: [[]],
    });

    expect(items.length).toBe(15);

    const search = 'arnold pupkin';

    const items2 = await Items(
      null,
      { search },
      { mongooseConn, pubsub },
      { ...infoForSort, score: 1 },
      { inputOutputEntity: [[]] },
    );

    expect(items2.length).toBe(4);

    expect(items2[0].first).toBe('arnold');
    expect(items2[0].second).toBe('kislyi');
    expect(items2[1].first).toBe('arnold');
    expect(items2[1].second).toBe('ivanov & petrov');
    expect(items2[2].first).toBe('vasya & masha');
    expect(items2[2].second).toBe('pupkin');
    expect(items2[3].first).toBe('masha');
    expect(items2[3].second).toBe('nikman & pupkin');
  });

  test('should create query entities resolver to aggregate result', async () => {
    const parentConfig = {} as TangibleEntityConfig;
    const childConfig: EntityConfig = {
      name: 'Child',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          array: true,
          index: true,
          type: 'textFields',
        },
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'parentChild',
          oppositeName: 'child',
          config: parentConfig,
          parent: true,
          array: true,
          type: 'relationalFields',
        },
      ],
    };
    Object.assign(parentConfig, {
      name: 'Parent',
      type: 'tangible',
      textFields: [
        {
          name: 'name',
          index: true,
          weight: 1,
          type: 'textFields',
        },
      ],
      geospatialFields: [
        {
          name: 'point',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
      ],
      relationalFields: [
        {
          name: 'child',
          oppositeName: 'parentChild',
          index: true,
          config: childConfig,
          type: 'relationalFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(parentConfig);
    const Example = mongooseConn.model('Parent_Thing', exampleSchema);
    await Example.createCollection();

    const example2Schema = createThingSchema(childConfig);
    const Example2 = mongooseConn.model('Child_Thing', example2Schema);
    await Example2.createCollection();

    await sleep(250);

    const coords = [
      { lng: 50.428, lat: 30.61 },
      { lng: 50.427, lat: 30.611 },
      { lng: 50.426, lat: 30.612 },
      { lng: 50.425, lat: 30.613 },
      { lng: 50.424, lat: 30.614 },
      { lng: 50.423, lat: 30.615 },
      { lng: 50.422, lat: 30.616 },
      { lng: 50.421, lat: 30.617 },
      { lng: 50.42, lat: 30.618 },
      { lng: 50.429, lat: 30.619 },
      { lng: 50.41, lat: 30.63 },
      { lng: 50.411, lat: 30.631 },
      { lng: 50.412, lat: 30.632 },
      { lng: 50.413, lat: 30.633 },
      { lng: 50.414, lat: 30.634 },
      { lng: 50.415, lat: 30.635 },
      { lng: 50.416, lat: 30.636 },
      { lng: 50.417, lat: 30.637 },
      { lng: 50.418, lat: 30.638 },
      { lng: 50.419, lat: 30.639 },
    ];

    const createParent = createCreateEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createParent).toBe('function');
    if (!createParent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    for (let i = 0; i < 20; i += 1) {
      const data = {
        name: `name${Math.floor(i / 3)}`,
        point: coords[i],
        child: {
          create: {
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };
      // eslint-disable-next-line no-await-in-loop
      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        inputOutputEntity: [[]],
      });
    }

    const Parents = createEntitiesQueryResolver(parentConfig, generalConfig, serversideConfig);
    if (!Parents) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = {
      child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] },
    };
    const parents = await Parents(null, { where }, { mongooseConn, pubsub }, infoForSort, {
      inputOutputEntity: [[]],
    });

    expect(parents.length).toBe(3);

    const where2 = { child_: { textField: 'first' } };
    const pagination = { skip: 3, first: 7 };
    const sort = { sortBy: ['name_DESC'] };
    const parents2 = await Parents(
      null,
      { pagination, sort, where: where2 },
      { mongooseConn, pubsub },
      infoForSort,
      { inputOutputEntity: [[]] },
    );

    expect(parents2.length).toBe(7);

    const near: NearInput = {
      geospatialField: 'point',
      coordinates: { lng: 50.425, lat: 30.615 },
      maxDistance: 1500,
    };

    const parents3 = await Parents(null, { near, where }, { mongooseConn, pubsub }, infoForSort, {
      inputOutputEntity: [[]],
    });
    expect(parents3.length).toBe(2);

    const search = 'name2';
    const parents4 = await Parents(
      null,
      { search, where: where2 },
      { mongooseConn, pubsub },
      infoForSort,
      { inputOutputEntity: [[]] },
    );
    expect(parents4.length).toBe(3);
  });
});
