// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('../createCreateThingMutationResolver');
// const {
//   default: createUpdateThingMutationResolver,
// } = require('../createUpdateThingMutationResolver');
const { default: createThingQueryResolver } = require('../../queries/createThingQueryResolver');
const { default: createThingsQueryResolver } = require('../../queries/createThingsQueryResolver');

const { default: createCopyThingWithChildrenMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-copy-thing-with-children-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

describe('createCopyThingWithChildrenMutationResolver', () => {
  const restaurantCloneConfig: ThingConfig = {};
  const menuConfig: ThingConfig = {};
  const menuCloneConfig: ThingConfig = {};
  const menuSectionConfig: ThingConfig = {};
  const menuCloneSectionConfig: ThingConfig = {};
  const restaurantConfig = {
    name: 'Restaurant',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    geospatialFields: [
      {
        name: 'coordinates',
        geospatialType: 'Point',
      },
    ],

    duplexFields: [
      {
        name: 'clone',
        oppositeName: 'original',
        config: restaurantCloneConfig,
        parent: true,
      },

      {
        name: 'menu',
        oppositeName: 'restaurant',
        config: menuConfig,
        parent: true,
      },
    ],
  };

  Object.assign(restaurantCloneConfig, {
    name: 'RestaurantClone',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    geospatialFields: [
      {
        name: 'coordinates',
        geospatialType: 'Point',
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: restaurantConfig,
      },

      {
        name: 'menu',
        oppositeName: 'restaurant',
        config: menuCloneConfig,
        parent: true,
      },
    ],
  });

  Object.assign(menuConfig, {
    name: 'Menu',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'restaurant',
        oppositeName: 'menu',
        config: restaurantConfig,
      },

      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        config: menuSectionConfig,
        parent: true,
      },
    ],
  });

  Object.assign(menuCloneConfig, {
    name: 'MenuClone',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'restaurant',
        oppositeName: 'menu',
        config: restaurantCloneConfig,
      },

      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        config: menuCloneSectionConfig,
        parent: true,
      },
    ],
  });

  Object.assign(menuSectionConfig, {
    name: 'MenuSection',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuConfig,
      },
    ],
  });

  Object.assign(menuCloneSectionConfig, {
    name: 'MenuCloneSection',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuCloneConfig,
      },
    ],
  });

  const thingConfigs = {
    Restaurant: restaurantConfig,
    RestaurantClone: restaurantCloneConfig,
    Menu: menuConfig,
    MenuClone: menuCloneConfig,
    MenuSection: menuSectionConfig,
    MenuCloneSection: menuCloneSectionConfig,
  };

  const generalConfig: GeneralConfig = { thingConfigs };
  const serversideConfig = { transactions: true };

  test('should create mutation add thing resolver', async () => {
    const restaurantSchema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', restaurantSchema);
    await Restaurant.createCollection();

    const restaurantCloneSchema = createThingSchema(restaurantCloneConfig);
    const RestaurantClone = mongooseConn.model('RestaurantClone_Thing', restaurantCloneSchema);
    await RestaurantClone.createCollection();

    const menuSchema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', menuSchema);
    await Menu.createCollection();

    const menuSectionSchema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', menuSectionSchema);
    await MenuSection.createCollection();

    const menuCloneSchema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', menuCloneSchema);
    await MenuClone.createCollection();

    const menuCloneSectionSchema = createThingSchema(menuCloneSectionConfig);
    const MenuCloneSection = mongooseConn.model('MenuCloneSection_Thing', menuCloneSectionSchema);
    await MenuCloneSection.createCollection();

    const createRestaurant = createCreateThingMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Romashka Restaurant',
      coordinates: { lng: 50.419, lat: 30.639 },
      menu: {
        create: {
          name: 'Menu Name',
          sections: {
            create: [
              { name: 'Section Name 1' },
              { name: 'Section Name 2' },
              { name: 'Section Name 3' },
            ],
          },
        },
      },
    };

    const createdRestaurant = await createRestaurant(null, { data }, { mongooseConn, pubsub });
    expect(createdRestaurant.name).toBe(data.name);

    const copyRestaurantCloneWithChildren = createCopyThingWithChildrenMutationResolver(
      restaurantCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyRestaurantCloneWithChildren).toBe('function');
    if (!copyRestaurantCloneWithChildren) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurantClone = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
    );
    expect(restaurantClone.name).toBe(data.name);
    expect({
      lng: restaurantClone.coordinates.coordinates[0],
      lat: restaurantClone.coordinates.coordinates[1],
    }).toEqual(data.coordinates);
    expect(restaurantClone.original.toString()).toBe(createdRestaurant.id.toString());

    const menuCloneQuery = createThingQueryResolver(
      menuCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof menuCloneQuery).toBe('function');
    if (!menuCloneQuery) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const menuClone = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1 } },
    );

    expect(menuClone.name).toBe(data.menu.create.name);

    const sectionsCloneQuery = createThingsQueryResolver(
      menuCloneSectionConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof sectionsCloneQuery).toBe('function');
    if (!sectionsCloneQuery) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const sectionsClone = await sectionsCloneQuery(
      null,
      { where: { id_id: menuClone.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1 } },
    );

    expect(sectionsClone.length).toBe(data.menu.create.sections.create.length);

    sectionsClone.forEach((section, i) => {
      expect(section.name).toBe(data.menu.create.sections.create[i].name);
    });
  });
});
