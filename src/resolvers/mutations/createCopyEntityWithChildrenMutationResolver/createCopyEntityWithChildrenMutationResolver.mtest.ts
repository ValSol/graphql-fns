/* eslint-env jest */
import type { GeneralConfig, EntityConfig, GraphqlObject } from '../../../tsTypes';

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
  default: createDeleteManyEntitiesWithChildrenMutationResolver,
} = require('../createDeleteManyEntitiesWithChildrenMutationResolver');
const { default: createEntityQueryResolver } = require('../../queries/createEntityQueryResolver');
const {
  default: createEntitiesQueryResolver,
} = require('../../queries/createEntitiesQueryResolver');

const { default: createCopyEntityWithChildrenMutationResolver } = require('./index');

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-copy-entity-with-children-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createCopyEntityWithChildrenMutationResolver', () => {
  const restaurantCloneConfig = {} as EntityConfig;
  const menuConfig = {} as EntityConfig;
  const menuCloneConfig = {} as EntityConfig;
  const menuSectionConfig = {} as EntityConfig;
  const menuSectionCloneConfig = {} as EntityConfig;
  const menuSubSectionConfig = {} as EntityConfig;
  const menuSubSectionCloneConfig = {} as EntityConfig;
  const restaurantConfig = {
    name: 'Restaurant',
    type: 'tangible',

    textFields: [
      {
        name: 'name',
        required: true,
        type: 'textFields',
      },
    ],

    geospatialFields: [
      {
        name: 'coordinates',
        geospatialType: 'Point',
        type: 'geospatialFields',
      },
    ],

    duplexFields: [
      {
        name: 'clone',
        oppositeName: 'original',
        config: restaurantCloneConfig,
        parent: true,
        type: 'duplexFields',
      },

      {
        name: 'menu',
        oppositeName: 'restaurant',
        config: menuConfig,
        parent: true,
        type: 'duplexFields',
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
        type: 'textFields',
      },
    ],

    geospatialFields: [
      {
        name: 'coordinates',
        geospatialType: 'Point',
        type: 'geospatialFields',
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: restaurantConfig,
        type: 'duplexFields',
      },

      {
        name: 'menu',
        oppositeName: 'restaurant',
        config: menuCloneConfig,
        parent: true,
        type: 'duplexFields',
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
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'restaurant',
        oppositeName: 'menu',
        config: restaurantConfig,
        type: 'duplexFields',
      },

      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        config: menuSectionConfig,
        parent: true,
        type: 'duplexFields',
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
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'restaurant',
        oppositeName: 'menu',
        config: restaurantCloneConfig,
        type: 'duplexFields',
      },

      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        config: menuSectionCloneConfig,
        parent: true,
        type: 'duplexFields',
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
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuConfig,
        type: 'duplexFields',
      },
      {
        name: 'subSections',
        oppositeName: 'section',
        config: menuSubSectionConfig,
        array: true,
        parent: true,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuSectionCloneConfig, {
    name: 'MenuCloneSection',
    type: 'tangible',

    textFields: [
      {
        name: 'name',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuCloneConfig,
        type: 'duplexFields',
      },
      {
        name: 'subSections',
        oppositeName: 'section',
        config: menuSubSectionCloneConfig,
        array: true,
        parent: true,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuSubSectionConfig, {
    name: 'MenuSubSection',
    type: 'tangible',

    textFields: [
      {
        name: 'name',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'section',
        oppositeName: 'subSections',
        config: menuSectionConfig,
        required: true,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuSubSectionCloneConfig, {
    name: 'MenuCloneSubSection',
    type: 'tangible',

    textFields: [
      {
        name: 'name',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'section',
        oppositeName: 'subSections',
        config: menuSectionCloneConfig,
        required: true,
        type: 'duplexFields',
      },
    ],
  });

  const allEntityConfigs = {
    Restaurant: restaurantConfig,
    RestaurantClone: restaurantCloneConfig,
    Menu: menuConfig,
    MenuClone: menuCloneConfig,
    MenuSection: menuSectionConfig,
    MenuCloneSection: menuSectionCloneConfig,
    MenuSubSection: menuSubSectionConfig,
    MenuCloneSubSection: menuSubSectionCloneConfig,
  };

  const generalConfig = { allEntityConfigs } as GeneralConfig;
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

    const menuCloneSectionSchema = createThingSchema(menuSectionCloneConfig);
    const MenuCloneSection = mongooseConn.model('MenuCloneSection_Thing', menuCloneSectionSchema);
    await MenuCloneSection.createCollection();

    const menuSubSectionSchema = createThingSchema(menuSubSectionConfig);
    const MenuSubSection = mongooseConn.model('MenuSubSection_Thing', menuSubSectionSchema);
    await MenuSubSection.createCollection();

    const menuCloneSubSectionSchema = createThingSchema(menuSubSectionCloneConfig);
    const MenuCloneSubSection = mongooseConn.model(
      'MenuCloneSubSection_Thing',
      menuCloneSubSectionSchema,
    );
    await MenuCloneSubSection.createCollection();

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
              {
                name: 'Section Name 1',
                subSections: {
                  create: [{ name: 'Sub Section Name 1-1' }, { name: 'Sub Section Name 1-2' }],
                  connect: [],
                },
              },
              {
                name: 'Section Name 2',
                subSections: { connect: [] },
              },
              {
                name: 'Section Name 3',
                subSections: {
                  create: [{ name: 'Sub Section Name 3-1' }, { name: 'Sub Section Name 3-2' }],
                },
              },
            ],
          },
        },
      },
    };

    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );
    expect(createdRestaurant.name).toBe(data.name);

    const copyRestaurantCloneWithChildren = createCopyEntityWithChildrenMutationResolver(
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
      null,
      { inputOutputEntity: [] },
    );
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
      { inputOutputEntity: [] },
    );

    expect(menuClone.name).toBe(data.menu.create.name);
    expect(restaurantClone.id.toString()).toBe(menuClone.restaurant.toString());

    const sectionsCloneQuery = createEntitiesQueryResolver(
      menuSectionCloneConfig,
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
      { inputOutputEntity: [] },
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
      null,
      { inputOutputEntity: [] },
    );

    expect(updatedRestaurant.name).toBe(restaurantDataToUpdate.name);

    const restaurantClone2 = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

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
      null,
      { inputOutputEntity: [] },
    );

    expect(updatedMenu.name).toBe(menuDataToUpdate.name);

    const restaurantClone3 = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    expect(restaurantClone3.menu.toString()).not.toBe(menuClone.id.toString());

    const menuClone2 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone3.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
      { inputOutputEntity: [] },
    );

    expect(restaurantClone3.menu.toString()).toBe(menuClone2.id.toString());
    expect(restaurantClone3.id.toString()).toBe(menuClone2.restaurant.toString());

    const sectionsClone2 = await sectionsCloneQuery(
      null,
      { where: { id_in: menuClone.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1, menu: 1 } },
      { inputOutputEntity: [] },
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
      null,
      { inputOutputEntity: [] },
    );

    expect(menuSection.name).toBe(sectionDataToUpdate.name);

    const restaurantClone4 = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    const menuClone3 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone4.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
      { inputOutputEntity: [] },
    );

    const sectionsClone3 = await sectionsCloneQuery(
      null,
      { where: { id_in: menuClone3.sections } },
      { mongooseConn, pubsub },
      { projection: { name: 1, menu: 1 } },
      { inputOutputEntity: [] },
    );

    const sectionsClonesObject = sectionsClone3.reduce((prev, item) => {
      prev[item.id] = item; // eslint-disable-line no-param-reassign
      return prev;
    }, {} as Record<string, GraphqlObject>);

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
      null,
      { inputOutputEntity: [] },
    );

    const restaurantClone5 = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    const menuClone4 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone5.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
      { inputOutputEntity: [] },
    );

    expect(menuClone4.sections[0].toString()).toBe(menuClone3.sections[1].toString());
    expect(menuClone4.sections[1].toString()).toBe(menuClone3.sections[2].toString());
    expect(menuClone4.sections[2].toString()).toBe(menuClone3.sections[0].toString());

    const menuDataToUpdate3 = {
      sections: {
        connect: [updatedMenu.sections[1], updatedMenu.sections[2], updatedMenu.sections[0]],
        create: [
          { name: 'Added Section Name 1' },
          {
            name: 'Added Section Name 2',
            subSections: {
              create: [
                { name: 'Added Sub Section Name 2-1 ' },
                { name: 'Added Sub Section Name 2-2' },
              ],
            },
          },
          { name: 'Added Section Name 3' },
        ],
        createPositions: [0, 2, 5],
      },
    };

    await updateMenu(
      null,
      { whereOne: { id: createdRestaurant.menu }, data: menuDataToUpdate3 },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    const restaurantClone6 = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    const menuClone5 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone6.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
      { inputOutputEntity: [] },
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
      { inputOutputEntity: [] },
    );

    const sectionsClonesObject2 = sectionsClone4.reduce((prev, item) => {
      prev[item.id] = item; // eslint-disable-line no-param-reassign
      return prev;
    }, {} as Record<string, GraphqlObject>);

    expect(sectionsClonesObject2[menuClone5.sections[0]].name).toBe(
      menuDataToUpdate3.sections.create[0].name,
    );
    expect(sectionsClonesObject2[menuClone5.sections[2]].name).toBe(
      menuDataToUpdate3.sections.create[1].name,
    );
    expect(sectionsClonesObject2[menuClone5.sections[5]].name).toBe(
      menuDataToUpdate3.sections.create[2].name,
    );

    const deleteManySections = createDeleteManyEntitiesWithChildrenMutationResolver(
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
      { inputOutputEntity: [] },
    );

    const restaurantClone7 = await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    const menuClone6 = await menuCloneQuery(
      null,
      { whereOne: { id: restaurantClone7.menu.toString() } },
      { mongooseConn, pubsub },
      { projection: { name: 1, sections: 1, restaurant: 1 } },
      { inputOutputEntity: [] },
    );

    expect(menuClone6.sections.length).toBe(3);
    expect(menuClone6.sections[0].toString()).toBe(menuClone5.sections[0].toString());
    expect(menuClone6.sections[1].toString()).toBe(menuClone5.sections[2].toString());
    expect(menuClone6.sections[2].toString()).toBe(menuClone5.sections[5].toString());

    const deleteManyMenusWithChildren = createDeleteManyEntitiesWithChildrenMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof deleteManyMenusWithChildren).toBe('function');
    if (!deleteManyMenusWithChildren) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    await deleteManyMenusWithChildren(
      null,
      { whereOne: [{ id: createdRestaurant.menu }] },
      { mongooseConn, pubsub },
      { projection: { name: 1 } },
      { inputOutputEntity: [] },
    );

    await copyRestaurantCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdRestaurant.id } },
      },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [] },
    );

    const sectionsClone5 = await sectionsCloneQuery(
      null,
      {},
      { mongooseConn, pubsub },
      { projection: { name: 1 } },
      { inputOutputEntity: [] },
    );

    expect(sectionsClone5).toEqual([]);

    const subSectionsCloneQuery = createEntitiesQueryResolver(
      menuSubSectionCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof subSectionsCloneQuery).toBe('function');
    if (!subSectionsCloneQuery) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const subSectionsClone = await subSectionsCloneQuery(
      null,
      {},
      { mongooseConn, pubsub },
      { projection: { name: 1 } },
      { inputOutputEntity: [] },
    );

    expect(subSectionsClone).toEqual([]);
  });
});
