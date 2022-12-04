// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../createCreateEntityMutationResolver');
const {
  default: createUpdateEntityMutationResolver,
} = require('../createUpdateEntityMutationResolver');
const {
  default: createDeleteManyEntitiesMutationResolver,
} = require('../createDeleteManyEntitiesMutationResolver');
const { default: createEntityQueryResolver } = require('../../queries/createEntityQueryResolver');
const {
  default: createEntitiesQueryResolver,
} = require('../../queries/createEntitiesQueryResolver');

const { default: createCopyManyEntitiesWithChildrenMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-copy-many-entities-with-children-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createCopyManyEntitiesWithChildrenMutationResolver', () => {
  const restaurantCloneConfig: EntityConfig = {};
  const menuConfig: EntityConfig = {};
  const menuCloneConfig: EntityConfig = {};
  const menuSectionConfig: EntityConfig = {};
  const menuCloneSectionConfig: EntityConfig = {};
  const restaurantConfig = {
    name: 'Restaurant',
    type: 'tangible',

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
    type: 'tangible',

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
    type: 'tangible',

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
    type: 'tangible',

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
    type: 'tangible',

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
    type: 'tangible',

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

  const entityConfigs = {
    Restaurant: restaurantConfig,
    RestaurantClone: restaurantCloneConfig,
    Menu: menuConfig,
    MenuClone: menuCloneConfig,
    MenuSection: menuSectionConfig,
    MenuCloneSection: menuCloneSectionConfig,
  };

  const generalConfig: GeneralConfig = { entityConfigs };
  const serversideConfig = { transactions: true };

  test('should create mutation add entity resolver', async () => {
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

    const createRestaurant = createCreateEntityMutationResolver(
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

    const copyManyRestaurantCloneWithChildrens = createCopyManyEntitiesWithChildrenMutationResolver(
      restaurantCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyManyRestaurantCloneWithChildrens).toBe('function');
    if (!copyManyRestaurantCloneWithChildrens) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurantClones = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );
    const [restaurantClone] = restaurantClones;
    expect(restaurantClone.name).toBe(data.name);
    expect({
      lng: restaurantClone.coordinates.coordinates[0],
      lat: restaurantClone.coordinates.coordinates[1],
    }).toEqual(data.coordinates);
    expect(restaurantClone.original.toString()).toBe(createdRestaurant.id.toString());

    const menuCloneQuery = createEntityQueryResolver(
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
      { projection: { name: 1, sections: 1, restaurant: 1 } },
    );

    expect(menuClone.name).toBe(data.menu.create.name);
    expect(restaurantClone.id.toString()).toBe(menuClone.restaurant.toString());

    const sectionsCloneQuery = createEntitiesQueryResolver(
      menuCloneSectionConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof sectionsCloneQuery).toBe('function');
    if (!sectionsCloneQuery) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const sectionsClone = await sectionsCloneQuery(
      null,
      { where: { id_in: menuClone.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1 } },
    );

    expect(sectionsClone.length).toBe(data.menu.create.sections.create.length);

    sectionsClone.forEach((section, i) => {
      expect(section.name).toBe(data.menu.create.sections.create[i].name);
    });

    const updateRestaurant = createUpdateEntityMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof updateRestaurant).toBe('function');
    if (!updateRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restaurantDataToUpdate = {
      name: 'Updated Romashka Restaurant',
    };

    const updatedRestaurant = await updateRestaurant(
      null,
      { whereOne: { id: createdRestaurant.id }, data: restaurantDataToUpdate },
      { mongooseConn, pubsub },
    );

    expect(updatedRestaurant.name).toBe(restaurantDataToUpdate.name);

    const restaurantClones2 = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );
    const [restaurantClone2] = restaurantClones2;
    expect(restaurantClone2.name).toBe(restaurantDataToUpdate.name);
    expect(restaurantClone2.menu.toString()).toBe(menuClone.id.toString());

    const updateMenu = createUpdateEntityMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof updateMenu).toBe('function');
    if (!updateMenu) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const menuDataToUpdate = {
      name: 'Updated Menu Name',
    };

    const updatedMenu = await updateMenu(
      null,
      { whereOne: { id: createdRestaurant.menu }, data: menuDataToUpdate },
      { mongooseConn, pubsub },
    );

    expect(updatedMenu.name).toBe(menuDataToUpdate.name);

    const restaurantClones3 = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );

    const [restaurantClone3] = restaurantClones3;
    expect(restaurantClone3.menu.toString()).not.toBe(menuClone.id.toString());

    const menuClone2 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone3.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
    );

    expect(restaurantClone3.menu.toString()).toBe(menuClone2.id.toString());
    expect(restaurantClone3.id.toString()).toBe(menuClone2.restaurant.toString());

    const sectionsClone2 = await sectionsCloneQuery(
      null,
      { where: { id_in: menuClone.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1, menu: 1 } },
    );

    expect(sectionsClone2.length).toBe(data.menu.create.sections.create.length);

    sectionsClone2.forEach((section, i) => {
      expect(section.name).toBe(data.menu.create.sections.create[i].name);
      expect(section.id.toString()).toBe(sectionsClone[i].id.toString());
      expect(section.menu.toString()).toBe(restaurantClone3.menu.toString());
    });

    const updateMenuSection = createUpdateEntityMutationResolver(
      menuSectionConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof updateMenuSection).toBe('function');
    if (!updateMenuSection) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const sectionDataToUpdate = {
      name: 'Updated Section Name 2',
    };

    const menuSection = await updateMenuSection(
      null,
      { whereOne: { id: updatedMenu.sections[1].toString() }, data: sectionDataToUpdate },
      { mongooseConn, pubsub },
    );

    expect(menuSection.name).toBe(sectionDataToUpdate.name);

    const restaurantClones4 = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );

    const [restaurantClone4] = restaurantClones4;

    const menuClone3 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone4.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
    );

    const sectionsClone3 = await sectionsCloneQuery(
      null,
      { where: { id_in: menuClone3.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1, menu: 1 } },
    );

    const sectionsClonesObject = sectionsClone3.reduce((prev, item) => {
      prev[item.id] = item; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

    menuClone3.sections.forEach((id, i) => {
      const section = sectionsClonesObject[id];
      if (i === 1) {
        expect(section.name).toBe(sectionDataToUpdate.name);
        expect(section.id.toString()).not.toBe(menuClone2.sections[i].toString());
      } else {
        expect(section.name).toBe(data.menu.create.sections.create[i].name);
        expect(section.id.toString()).toBe(menuClone2.sections[i].toString());
      }
      expect(section.menu.toString()).toBe(restaurantClone4.menu.toString());
    });

    const menuDataToUpdate2 = {
      sections: {
        connect: [updatedMenu.sections[1], updatedMenu.sections[2], updatedMenu.sections[0]],
      },
    };

    await updateMenu(
      null,
      { whereOne: { id: createdRestaurant.menu }, data: menuDataToUpdate2 },
      { mongooseConn, pubsub },
    );

    const restaurantClones5 = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );

    const [restaurantClone5] = restaurantClones5;

    const menuClone4 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone5.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
    );

    expect(menuClone4.sections[0].toString()).toBe(menuClone3.sections[1].toString());
    expect(menuClone4.sections[1].toString()).toBe(menuClone3.sections[2].toString());
    expect(menuClone4.sections[2].toString()).toBe(menuClone3.sections[0].toString());

    const menuDataToUpdate3 = {
      sections: {
        connect: [updatedMenu.sections[1], updatedMenu.sections[2], updatedMenu.sections[0]],
        create: [
          { name: 'Added Section Name 1' },
          { name: 'Added Section Name 2' },
          { name: 'Added Section Name 3' },
        ],
        createPositions: [0, 2, 5],
      },
    };

    await updateMenu(
      null,
      { whereOne: { id: createdRestaurant.menu }, data: menuDataToUpdate3 },
      { mongooseConn, pubsub },
    );

    const restaurantClones6 = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );

    const [restaurantClone6] = restaurantClones6;

    const menuClone5 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone6.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
    );

    expect(menuClone5.sections.length).toBe(6);
    expect(menuClone5.sections[1].toString()).toBe(menuClone3.sections[1].toString());
    expect(menuClone5.sections[3].toString()).toBe(menuClone3.sections[2].toString());
    expect(menuClone5.sections[4].toString()).toBe(menuClone3.sections[0].toString());

    const sectionsClone4 = await sectionsCloneQuery(
      null,
      { where: { id_in: menuClone5.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1, menu: 1 } },
    );

    const sectionsClonesObject2 = sectionsClone4.reduce((prev, item) => {
      prev[item.id] = item; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

    expect(sectionsClonesObject2[menuClone5.sections[0]].name).toBe(
      menuDataToUpdate3.sections.create[0].name,
    );
    expect(sectionsClonesObject2[menuClone5.sections[2]].name).toBe(
      menuDataToUpdate3.sections.create[1].name,
    );
    expect(sectionsClonesObject2[menuClone5.sections[5]].name).toBe(
      menuDataToUpdate3.sections.create[2].name,
    );

    const deleteManySections = createDeleteManyEntitiesMutationResolver(
      menuSectionConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof deleteManySections).toBe('function');
    if (!deleteManySections) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    await deleteManySections(
      null,
      { whereOne: updatedMenu.sections.map((id) => ({ id: id.toString() })) },
      { mongooseConn, pubsub },
      { projection: { name: 1, menu: 1 } },
    );

    const restaurantClones7 = await copyManyRestaurantCloneWithChildrens(
      null,
      {
        whereOnes: [{ original: { id: createdRestaurant.id } }],
      },
      { mongooseConn, pubsub },
    );
    const [restaurantClone7] = restaurantClones7;

    const menuClone6 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone7.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
    );

    expect(menuClone6.sections.length).toBe(3);
    expect(menuClone6.sections[0].toString()).toBe(menuClone5.sections[0].toString());
    expect(menuClone6.sections[1].toString()).toBe(menuClone5.sections[2].toString());
    expect(menuClone6.sections[2].toString()).toBe(menuClone5.sections[5].toString());
  });
});